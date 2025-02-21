import { ReactNode, useContext, useEffect, useRef, useState } from "react"
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext"
import { Visit } from "@/src/Electron/Database/Models/Visit"
import { DateTime, Duration } from "luxon"
import { DATE, gregorianToPersian, persianToGregorian, toDateTime, toFormat } from "@/src/react/Lib/DateTime/date-time-helpers"
import { RendererDbAPI } from "@/src/Electron/Database/renderer"
import { localizeNumbers } from "@/src/react/Localization/helpers"
import { t } from "i18next"
import { Stack } from "../Base/Stack"
import { IShape } from "./IShape"
import { Chart } from "."
import { LineChart } from "./LineChart"
import { Point } from "../../Lib/Math"
import { Label } from "./index.d"

export function VisitsChart() {
    let local = useContext(ConfigurationContext)!.local

    const [visits, setVisits] = useState<Visit[]>([])
    const [shapes, setShapes] = useState<IShape[]>()

    const [startDate, setStartDate] = useState<number>(DateTime.utc().minus({ months: 6 }).toUnixInteger())
    const [endDate, setEndDate] = useState<number>(DateTime.utc().toUnixInteger())

    const [ready, setReady] = useState(false)

    const dataPoints = useRef<Point[]>()

    const xRange = useRef<[number | undefined, number | undefined]>()
    const yRange = useRef<[number | undefined, number | undefined]>()

    const xLabels = useRef<Label[]>()
    const yLabels = useRef<Label[]>()

    const hasPlayed = useRef<boolean>(false)

    useEffect(() => {
        if (!hasPlayed.current) {
            hasPlayed.current = true
            init()
        }
    }, [])

    async function init() {
        let vs = await fetchVisits()
        if (Array.isArray(vs))
            setVisits(vs)
        else
            return

        if (vs.length <= 0)
            return

        let visitsPerDay = calculateVisitsPerDay(vs)

        if (visitsPerDay.length <= 0)
            return

        yRange.current = [0, visitsPerDay.reduce((p, c, i) => c.count > p ? c.count : p, 0)]
        xRange.current = [visitsPerDay[0].dateTS, visitsPerDay[visitsPerDay.length - 1].dateTS]

        xLabels.current = []
        if (local.calendar === 'Gregorian') {
            let ts = DateTime.fromSeconds(xRange.current[1]!).set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toUnixInteger()
            xLabels.current.push({ value: ts, node: getMonth(ts) })
            let safety = 0
            while (safety < 2000) {
                safety++
                xLabels.current.push({ value: ts, node: getMonth(ts) })

                ts = DateTime.fromSeconds(ts).minus({ months: 1 }).toUnixInteger()

                if (ts <= xRange.current[0]!)
                    break
            }
            if (safety >= 2000)
                console.warn('safety limit exceeded!')
        } else {
            let ts: number
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

        setShapes([
            {
                control: 1,
                duration: 5000,
                xLabels: xLabels.current,
                yLabels: yLabels.current,
                hoverOptions: {
                    getHoverNode: (i) =>
                        <Stack direction="vertical" stackProps={{ className: 'p-2 rounded-lg bg-surface-container border' }}>
                            <Stack stackProps={{ className: 'justify-between' }}><div>{t('VisitsChart.count')}</div> <div>{localizeNumbers(local.language, visitsPerDay[i].count)}</div></Stack>
                            <Stack stackProps={{ className: 'justify-between' }}><div>{t('VisitsChart.date')}</div> <div>{toFormat(visitsPerDay[i].dateTS, local, undefined, DATE)}</div></Stack>
                        </Stack>,
                    hoverRadius: 4,
                    getDataPointOnHover(hoverPoint, hoverOptions) {
                        console.log('getDataPointOnHover', { hoverPoint, hoverOptions, dataPoints })
                        if (hoverOptions?.hoverRadius === undefined)
                            return undefined

                        let r = hoverOptions.hoverRadius!

                        if (dataPoints.current !== undefined)
                            for (let i = 0; i < dataPoints.current.length; i++)
                                if (
                                    hoverPoint.x <= dataPoints.current[i].x + r &&
                                    hoverPoint.x >= dataPoints.current[i].x - r &&
                                    hoverPoint.y <= dataPoints.current[i].y + r &&
                                    hoverPoint.y >= dataPoints.current[i].y - r
                                )
                                    return { ...dataPoints.current[i], index: i }

                        return undefined
                    },
                },
                onCanvasCoordsChange(shape) {
                    if (!shape.canvasCoords)
                        return

                    if (!dataPoints.current) {
                        dataPoints.current = LineChart.calculateDataPoints(
                            visitsPerDay.map(v => v.dateTS),
                            visitsPerDay.map(v => v.count),
                            xRange.current!,
                            yRange.current!,
                            shape.canvasCoords.width,
                            shape.canvasCoords.height,
                            shape.canvasCoords.offset
                        )

                        xLabels.current = LineChart.calculateXLabels(xLabels.current!, xRange.current!, shape.canvasCoords.width, shape.canvasCoords.offset)
                            .map(v => ({ ...v, options: { className: 'text-xs' } }))
                        shape.xLabels = xLabels.current

                        yLabels.current = LineChart.calculateYLabels(yLabels.current!, yRange.current!, shape.canvasCoords.height, shape.canvasCoords.offset)
                            .map((v, i) => ({ ...v, node: localizeNumbers(local.language, (yRange.current![1]! - yRange.current![0]!) * i / 4) }))
                            .map(v => ({ ...v, options: { className: 'text-xs' } }))
                        shape.yLabels = yLabels.current
                    }
                },
                draw(dx, ctx, shape) {
                    if (!dataPoints.current)
                        return

                    ctx.save()

                    if (shape.styleOptions)
                        Object.keys(shape.styleOptions).forEach(k => ctx[k] = shape.styleOptions![k])

                    let lineWidth = shape.styleOptions?.lineWidth ?? 0
                    let range = (xRange.current![1]! - xRange.current![0]!)
                    let month = Duration.fromDurationLike({ months: 1 }).toMillis() / 1000
                    let rectWidth = 0.75 * shape.canvasCoords!.width! / (range / month)
                    if (shape.hoverOptions)
                        shape.hoverOptions.hoverRadius = rectWidth / 2
                    dataPoints.current.forEach(p => {
                        ctx.beginPath()
                        let roundness = rectWidth / 4
                        let h = (shape.canvasCoords!.height! - p.y - shape.canvasCoords!.offset!.bottom - shape.canvasCoords!.offset!.top - lineWidth / 2) * dx! + roundness
                        ctx.roundRect(lineWidth / 2 + p.x - rectWidth / 2, shape.canvasCoords!.height! - shape.canvasCoords!.offset!.bottom + roundness - h, rectWidth, h, roundness)
                        ctx.stroke()
                        ctx.fill()
                    })

                    ctx.restore()
                },
                styleOptions: {
                    fillStyle: '#00ff0080',
                    strokeStyle: 'transparent',
                    lineWidth: 0,
                    lineCap: 'round',
                },
                ease: 'easeOutExpo'
            }
        ])
        setReady(true)
    }

    function getMonth(ts: number): string {
        return toFormat(ts, local, undefined, 'LLL')
    }

    function calculateVisitsPerDay(vs: Visit[]): { count: number, dateTS: number }[] {
        // {dateTS => count}
        let map: { [k: string]: number } = {}
        for (let i = 0; i < vs.length; i++) {
            let k = toFormat(vs[i].due!, local, undefined, 'yyyy M')

            if (map[k] === undefined)
                map[k] = 1
            else
                map[k] += 1
        }

        if (local.calendar === 'Gregorian')
            return Object.entries(map).map(e => ({ count: e[1], dateTS: DateTime.fromFormat(e[0], 'yyyy M').toUnixInteger() }))
        else
            return Object.entries(map).map(e => {
                return ({ count: e[1], dateTS: toDateTime({ date: persianToGregorian({ year: Number(e[0].split(' ')[0]), month: Number(e[0].split(' ')[1]), day: 1 }), time: { hour: 0, minute: 0, second: 0, millisecond: 0 } }, local, { ...local, calendar: 'Gregorian', zone: 'UTC' }).toUnixInteger() })
            })

    }

    async function fetchVisits(): Promise<Visit[]> {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisitsByDate(startDate, endDate, true)
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
            chartKey="VisitsChart"
            shapes={shapes}
            dimensions={{
                offset: {
                    top: 0,
                    bottom: 30,
                    left: 30,
                    right: 0,
                }
            }}
        />
    )
}
