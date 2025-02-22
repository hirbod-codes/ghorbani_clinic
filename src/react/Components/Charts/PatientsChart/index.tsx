import { Patient } from "@/src/Electron/Database/Models/Patient"
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext"
import { useContext, useEffect, useRef, useState } from "react"
import { LineChart } from "../../Chart/LineChart"
import { DateTime } from "luxon"
import { RendererDbAPI } from "@/src/Electron/Database/renderer"
import { gregorianToPersian, persianToGregorian, toDateTime, toFormat } from "@/src/react/Lib/DateTime/date-time-helpers"
import { Chart } from "../../Chart"
import { localizeNumbers } from "@/src/react/Localization/helpers"
import { Label } from "../../Chart/index.d"
import { IShape } from "../../Chart/IShape"
import { Bezier } from "bezier-js"
import { Point } from "@/src/react/Lib/Math"
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic"

export function PatientsChart() {
    let configuration = useContext(ConfigurationContext)!
    const local = configuration.local
    const themeOptions = configuration.themeOptions

    const [patients, setPatients] = useState<Patient[]>([])
    const [shapes, setShapes] = useState<IShape[]>()

    const [startDate, setStartDate] = useState<number>(DateTime.utc().minus({ months: 6 }).toUnixInteger())
    const [endDate, setEndDate] = useState<number>(DateTime.utc().toUnixInteger())

    const [ready, setReady] = useState(false)

    const dataPoints = useRef<Point[]>()
    const drawPoints = useRef<Point[]>()
    const controlsCurves = useRef<Bezier[][]>()

    const xRange = useRef<[number | undefined, number | undefined]>()
    const yRange = useRef<[number | undefined, number | undefined]>()

    const xLabels = useRef<Label[]>()
    const yLabels = useRef<Label[]>()

    useEffect(() => {
        init()
    }, [])

    async function init() {
        let patients = await fetchPatients()
        if (Array.isArray(patients))
            setPatients(patients)
        else
            return

        if (patients.length <= 0)
            return

        let patientsPerMonth = calculatePatientsPerMonth(patients)

        yRange.current = [0, patientsPerMonth.reduce((p, c, i) => c.count > p ? c.count : p, 0)]
        xRange.current = [patientsPerMonth[0].dateTS, patientsPerMonth[patientsPerMonth.length - 1].dateTS]

        xLabels.current = []
        if (local.calendar === 'Gregorian') {
            let ts = DateTime.fromSeconds(xRange.current[1]!).set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toUnixInteger()
            xLabels.current.push({ value: ts, node: toFormat(ts, local, undefined, 'LLL') })
            let safety = 0
            while (safety < 2000) {
                safety++
                xLabels.current.push({ value: ts, node: toFormat(ts, local, undefined, 'LLL') })

                ts = DateTime.fromSeconds(ts).minus({ months: 1 }).toUnixInteger()

                if (ts <= xRange.current[0]!)
                    break
            }
            if (safety >= 2000)
                console.warn('safety limit exceeded!')
        } else {
            let ts = Infinity
            let p = gregorianToPersian(DateTime.fromSeconds(xRange.current![1]!).toObject())
            p.day = 1
            let safety = 0
            do {
                safety++
                ts = toDateTime({ date: persianToGregorian(p), time: { hour: 0, minute: 0, second: 0, millisecond: 0 } }, { ...local, calendar: 'Gregorian', zone: 'UTC' }, { ...local, calendar: 'Gregorian', zone: 'UTC' }).toUnixInteger()

                xLabels.current.push({ value: ts, node: toFormat(ts, local, undefined, 'LLL') })

                if (p.month > 1)
                    p.month -= 1
                else {
                    p.month = 12
                    p.year -= 1
                }
            } while (safety < 2000 && ts > xRange.current[0]!);
            if (safety >= 2000)
                console.warn('safety limit exceeded!')
        }

        yLabels.current = Array(5).fill(0).map((v, i) => ({ value: (yRange.current![1]! - yRange.current![0]!) * i / 4, node: localizeNumbers(local.language, (yRange.current![1]! - yRange.current![0]!) * i / 4), options: { className: 'text-xs' } }))

        let duration = 5000

        const rgb = ColorStatic.parse(themeOptions.colors.success[themeOptions.mode].main).toRgb()

        setShapes([
            {
                control: 0,
                onCanvasCoordsChange(shape) {
                    return new Promise((resolve, reject) => {
                        if (!shape.canvasCoords)
                            return

                        if (!dataPoints.current)
                            dataPoints.current = LineChart.calculateDataPoints(
                                patientsPerMonth.map(p => p.dateTS),
                                patientsPerMonth.map(p => p.count),
                                xRange.current!,
                                yRange.current!,
                                shape.canvasCoords.width,
                                shape.canvasCoords.height,
                                shape.canvasCoords.offset
                            )

                        if (!drawPoints.current)
                            drawPoints.current = LineChart.bezierCurve(dataPoints.current, duration)

                        if (controlsCurves.current)
                            return

                        const workerFunction = () => {
                            self.addEventListener('message', (e) => {
                                self.postMessage(performIntensiveTask(e.data))
                            })

                            function performIntensiveTask(data) {
                                let { drawPoints, lineWidth } = JSON.parse(data)

                                return JSON.stringify(LineChart.calculateControlPoints(drawPoints).map(c => new Bezier(...c).offset((lineWidth ?? 0) / 2) as Bezier[]))
                            }
                        }


                        let w = `
                            const Bezier = require('bezier-js').Bezier

                            ${LineChart.toString()}

                            (${workerFunction.toString()})()
                        `
                        const workerUrl = URL.createObjectURL(new Blob([w], { type: 'application/javascript' }))
                        const worker = new Worker(workerUrl, { type: 'module' });

                        if (!worker.onmessage)
                            worker.onmessage = ((e) => {
                                console.log('worker onmessage')
                                try {
                                    if (!controlsCurves.current)
                                        controlsCurves.current = JSON.parse(e.data)
                                } catch (e) {
                                    console.error(e)
                                    reject()
                                } finally {
                                    worker.terminate()
                                }
                                resolve()
                            })

                        if (!worker.onerror)
                            worker.onerror = ((e) => {
                                console.error('onerror', e)
                                reject()
                            })

                        if (!worker.onmessageerror)
                            worker.onmessageerror = ((e) => {
                                console.error('onmessageerror', e)
                                reject()
                            })

                        worker.postMessage(JSON.stringify({ drawPoints: drawPoints.current, lineWidth: shape.styleOptions?.lineWidth }))

                        console.log('worker posted message')
                    })
                },
                draw(dx, ctx, shape) {
                    if (!drawPoints.current || !controlsCurves.current)
                        return

                    ctx.save()

                    if (shape.styleOptions)
                        Object.keys(shape.styleOptions).forEach(k => ctx[k] = shape.styleOptions![k])
                    else
                        shape.styleOptions = {}

                    let offsetTop = shape.canvasCoords!.offset!.top
                    let offsetLeft = shape.canvasCoords!.offset!.left
                    let g = ctx.createLinearGradient(offsetLeft, offsetTop, offsetLeft, offsetTop + shape.canvasCoords!.height!)
                    g.addColorStop(0, rgb.toHex())
                    g.addColorStop(1, 'transparent')
                    shape.styleOptions!.fillStyle = g

                    ctx.fillStyle = g

                    ctx.beginPath()

                    let firstPoint: Point | undefined = undefined
                    for (const controlCurves of controlsCurves.current) {
                        if (firstPoint === undefined) {
                            firstPoint = controlCurves[0].points[0]
                            ctx.moveTo(firstPoint.x, firstPoint.y)
                        }
                        controlCurves.forEach((b, j) => {
                            // ctx.moveTo(firstPoint!.x, firstPoint!.y)
                            ctx.bezierCurveTo(b.points[1].x, b.points[1].y, b.points[2].x, b.points[2].y, b.points[3].x, b.points[3].y)
                            firstPoint = b.points[b.points.length - 1]
                        })
                    }

                    ctx.stroke()

                    ctx.lineTo(drawPoints.current[drawPoints.current.length - 1].x, shape.canvasCoords!.height! + shape.canvasCoords!.offset!.top)
                    ctx.lineTo(drawPoints.current[0].x, shape.canvasCoords!.height! + shape.canvasCoords!.offset!.top)
                    ctx.lineTo(drawPoints.current[0].x, drawPoints.current[0].y)

                    ctx.fill()

                    ctx.restore()
                },
                styleOptions: {
                    fillStyle: 'transparent',
                    strokeStyle: 'transparent',
                    lineWidth: 0,
                },
            },
            {
                control: 1,
                duration: duration,
                xLabels: xLabels.current,
                yLabels: yLabels.current,
                onCanvasCoordsChange(shape) {
                    if (!shape.canvasCoords)
                        return

                    if (!dataPoints.current)
                        dataPoints.current = LineChart.calculateDataPoints(
                            patientsPerMonth.map(p => p.dateTS),
                            patientsPerMonth.map(p => p.count),
                            xRange.current!,
                            yRange.current!,
                            shape.canvasCoords.width,
                            shape.canvasCoords.height,
                            shape.canvasCoords.offset
                        )

                    if (!drawPoints.current)
                        drawPoints.current = LineChart.bezierCurve(dataPoints.current, duration)


                    shape.xLabels = LineChart.calculateXLabels(xLabels.current!, xRange.current!, shape.canvasCoords.width, shape.canvasCoords.offset)
                        .map(v => ({ ...v, options: { className: 'text-xs' } }))

                    shape.yLabels = LineChart.calculateYLabels(yLabels.current!, yRange.current!, shape.canvasCoords.height, shape.canvasCoords.offset)
                        .map((v, i) => ({ ...v, node: localizeNumbers(local.language, (yRange.current![1]! - yRange.current![0]!) * i / 4) }))
                        .map(v => ({ ...v, options: { className: 'text-xs' } }))
                },
                draw(dx, ctx, shape) {
                    if (!drawPoints.current)
                        return

                    ctx.save()

                    if (shape.styleOptions)
                        Object.keys(shape.styleOptions).forEach(k => ctx[k] = shape.styleOptions![k])

                    ctx.beginPath()

                    ctx.moveTo(drawPoints.current[0].x, drawPoints.current[0].y)
                    let count = drawPoints.current.length * dx
                    for (let i = 1; i < count; i++)
                        if (drawPoints.current[i] || drawPoints.current[i]?.x || drawPoints.current[i]?.y)
                            ctx.lineTo(drawPoints.current[i].x, drawPoints.current[i].y)

                    ctx.stroke()

                    ctx.restore()
                },
                styleOptions: {
                    fillStyle: 'transparent',
                    strokeStyle: rgb.toHex(),
                    lineWidth: 4,
                    lineCap: 'round',
                },
                ease: 'easeOutExpo'
            },
        ])
        setReady(true)
    }

    function calculatePatientsPerMonth(patients: Patient[]): { count: number, dateTS: number }[] {
        // {dateTS => count}
        let map: { [k: string]: number } = {}
        for (let i = 0; i < patients.length; i++) {
            let k = DateTime.fromSeconds(patients[i].createdAt!).toFormat('yyyy LLL')

            if (map[k] === undefined)
                map[k] = 1
            else
                map[k] += 1
        }

        return Object.entries(map).map(e => ({ count: e[1], dateTS: DateTime.fromFormat(e[0], 'yyyy LLL').toUnixInteger() }))
    }

    async function fetchPatients(): Promise<Patient[]> {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatientsByCreatedAtDate(startDate, endDate, true)
            console.log({ res })

            if (res.code !== 200 || !res.data)
                return []

            return res.data ?? []
        } catch (error) {
            console.error(error)
            return []
        }
    }

    return (
        ready &&
        <Chart
            chartKey="PatientsChart"
            shapes={shapes}
            dimensions={{
                offset: {
                    top: 10,
                    bottom: 45,
                    left: 45,
                    right: 10,
                },
            }}
        />
    )
}

