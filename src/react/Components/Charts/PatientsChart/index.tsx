import { Patient } from "@/src/Electron/Database/Models/Patient"
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext"
import { ReactNode, useContext, useEffect, useRef, useState } from "react"
import { LineChart } from "../../Chart/LineChart"
import { DateTime } from "luxon"
import { RendererDbAPI } from "@/src/Electron/Database/renderer"
import { gregorianToPersian, persianToGregorian, toDateTime, toFormat } from "@/src/react/Lib/DateTime/date-time-helpers"
import { Chart } from "../../Chart"

export function PatientsChart() {
    let local = useContext(ConfigurationContext)!.local

    const [patients, setPatients] = useState<Patient[]>([])
    const [shapes, setShapes] = useState<LineChart[]>()

    const [startDate, setStartDate] = useState<number>(DateTime.utc().minus({ months: 6 }).toUnixInteger())
    const [endDate, setEndDate] = useState<number>(DateTime.utc().toUnixInteger())

    const [ready, setReady] = useState(false)

    const xRange = useRef<[number | undefined, number | undefined]>()

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

        let pspm = calculatePatientsPerMonth(patients)

        let yRange: [number | undefined, number | undefined] = [0, pspm.reduce((p, c, i) => c.count > p ? c.count : p, 0)]
        xRange.current = [pspm[0].dateTS, pspm[pspm.length - 1].dateTS]

        let xLabels: { value: number, node: ReactNode }[] = []
        if (local.calendar === 'Gregorian') {
            let ts = DateTime.fromSeconds(xRange.current[1]!).set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toUnixInteger()
            xLabels.push({ value: ts, node: toFormat(ts, local, undefined, 'LLL') })
            while (true) {
                xLabels.push({ value: ts, node: toFormat(ts, local, undefined, 'LLL') })

                ts = DateTime.fromSeconds(ts).minus({ months: 1 }).toUnixInteger()

                if (ts <= xRange.current[0]!)
                    break
            }
        } else {
            let ts = Infinity
            let p = gregorianToPersian(DateTime.fromSeconds(xRange.current![1]!).toObject())
            p.day = 1
            do {
                ts = toDateTime({ date: persianToGregorian(p), time: { hour: 0, minute: 0, second: 0, millisecond: 0 } }, { ...local, calendar: 'Gregorian', zone: 'UTC' }, { ...local, calendar: 'Gregorian', zone: 'UTC' }).toUnixInteger()

                xLabels.push({ value: ts, node: toFormat(ts, local, undefined, 'LLL') })

                if (p.month > 1)
                    p.month -= 1
                else {
                    p.month = 12
                    p.year -= 1
                }
            } while (ts > xRange.current[0]!);
        }

        let chart = new LineChart({
            x: pspm.map(v => v.dateTS),
            y: pspm.map(v => v.count),
            xLabels: xLabels.map(v => ({ ...v, options: { className: 'text-xs' } })),
            yLabels: Array(yRange[1]! + 1).fill(0).map((v, i) => ({ value: i, node: i, options: { className: 'text-xs' } })),
            xRange: xRange.current,
            yRange,
            verticalLinesOptions: {
                controller: 1,
                duration: 5000,
                styles: {
                    lineWidth: 0.5
                },
                animateDraw(ctx, dataPoints, styleOptions, chartOptions, fraction) {
                    if (styleOptions)
                        Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions![k])

                    xLabels.forEach(l => {
                        let x = ((l.value - xRange.current![0]!) / (xRange.current![1]! - xRange.current![0]!)) * chartOptions!.width! + chartOptions!.offset!.left!
                        ctx.beginPath()
                        ctx.moveTo(x, chartOptions!.offset!.top + chartOptions!.height!)
                        ctx.lineTo(x, chartOptions!.offset!.top)
                        ctx.stroke()
                    })
                },
            },
            strokeOptions: {
                controller: 1,
                duration: 5000,
                styles: {
                    fillStyle: 'transparent',
                    strokeStyle: '#00ff0080',
                    lineWidth: 2,
                    lineCap: 'round',
                },
                ease: 'easeOutExpo'
            },
            fillOptions: {
                controller: 1,
                duration: 5000,
                animateStyles(ctx, dataPoints, styleOptions, chartOptions, fraction) {
                    let offsetTop = chartOptions!.offset!.top
                    let offsetLeft = chartOptions!.offset!.left
                    let g = ctx.createLinearGradient(offsetLeft, offsetTop, offsetLeft, offsetTop + chartOptions!.height!)
                    g.addColorStop(0, '#00ff0080')
                    g.addColorStop(1, 'transparent')
                    styleOptions!.fillStyle = g
                    return styleOptions!
                },
                styles: {
                    fillStyle: 'transparent',
                    strokeStyle: 'transparent',
                    lineWidth: 0,
                },
                ease: 'easeOutExpo'
            }
        })

        setShapes([chart])
        setReady(true)
    }

    function calculatePatientsPerMonth(vs: Patient[]): { count: number, dateTS: number }[] {
        // {dateTS => count}
        let map: { [k: string]: number } = {}
        for (let i = 0; i < vs.length; i++) {
            let k = DateTime.fromSeconds(vs[i].createdAt!).toFormat('yyyy LLL')

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
            shapes={shapes}
            xAxis={{ styles: { lineWidth: 2 } }}
            yAxis={{ styles: { lineWidth: 2 } }}
            chartOptions={{
                offset: {
                    top: 10,
                    bottom: 30,
                    left: 30,
                    right: 10,
                },
                xAxisOffset: 15,
                yAxisOffset: 15,
            }}
        />
    )
}

