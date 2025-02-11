import { ReactNode, useContext, useEffect, useRef, useState } from "react"
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext"
import { Visit } from "@/src/Electron/Database/Models/Visit"
import { LineChart } from "../../Chart/LineChart"
import { DateTime, Duration } from "luxon"
import { DATE, gregorianToPersian, persianToGregorian, toDateTime, toFormat } from "@/src/react/Lib/DateTime/date-time-helpers"
import { Stack } from "../../Base/Stack"
import { RendererDbAPI } from "@/src/Electron/Database/renderer"
import { Chart } from "../../Chart"

export function VisitsChart() {
    let local = useContext(ConfigurationContext)!.local

    const [visits, setVisits] = useState<Visit[]>([])
    const [shapes, setShapes] = useState<LineChart[]>()

    const [startDate, setStartDate] = useState<number>(DateTime.utc().minus({ months: 6 }).toUnixInteger())
    const [endDate, setEndDate] = useState<number>(DateTime.utc().toUnixInteger())

    const [ready, setReady] = useState(false)

    const xRange = useRef<[number | undefined, number | undefined]>()

    useEffect(() => {
        init()
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

        let yRange: [number | undefined, number | undefined] = [0, visitsPerDay.reduce((p, c, i) => c.count > p ? c.count : p, 0)]
        xRange.current = [visitsPerDay[0].dateTS, visitsPerDay[visitsPerDay.length - 1].dateTS]

        let xLabels: { value: number, node: ReactNode }[] = []
        if (local.calendar === 'Gregorian') {
            let ts = DateTime.fromSeconds(xRange.current[1]!).set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toUnixInteger()
            xLabels.push({ value: ts, node: getMonth(ts) })
            while (true) {
                xLabels.push({ value: ts, node: getMonth(ts) })

                ts = DateTime.fromSeconds(ts).minus({ months: 1 }).toUnixInteger()

                if (ts <= xRange.current[0]!)
                    break
            }
        } else {
            let ts: number
            let p = gregorianToPersian(DateTime.fromSeconds(xRange.current![1]!).toObject())
            p.day = 1
            do {
                console.log(
                    xRange.current![1]!,
                    JSON.stringify(DateTime.fromSeconds(xRange.current![1]!).toObject()),
                    gregorianToPersian(DateTime.fromSeconds(xRange.current![1]!).toObject()),
                    persianToGregorian(gregorianToPersian(DateTime.fromSeconds(xRange.current![1]!).toObject()))
                );

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
            x: visitsPerDay.map(v => v.dateTS),
            y: visitsPerDay.map(v => v.count),
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
                animateDraw(ctx, dataPoints, styleOptions, chartOptions, fraction) {
                    if (styleOptions)
                        Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions![k])

                    let lineWidth = styleOptions?.lineWidth ?? 0
                    let range = (xRange.current![1]! - xRange.current![0]!)
                    let month = Duration.fromDurationLike({ months: 1 }).toMillis() / 1000
                    let rectWidth = 0.75 * chartOptions!.width! / (range / month)
                    dataPoints.forEach(p => {
                        ctx.beginPath()
                        let roundness = rectWidth / 4
                        let offset = chartOptions!.offset!.top
                        let h = (chartOptions!.height! - p.y + offset - lineWidth / 2) * fraction! + roundness
                        ctx.roundRect(lineWidth / 2 + p.x - rectWidth / 2, chartOptions!.height! + offset - h + roundness, rectWidth, h, roundness)
                        ctx.stroke()
                        ctx.fill()
                    })
                },
                styles: {
                    fillStyle: '#00ff0080',
                    strokeStyle: 'transparent',
                    lineWidth: 0,
                    lineCap: 'round',
                },
                ease: 'easeOutExpo'
            },
            hoverOptions: {
                getHoverNode: (ps, i) =>
                    <Stack direction="vertical" stackProps={{ className: 'p-2 rounded-lg bg-surface-container border' }}>
                        <Stack stackProps={{ className: 'justify-between' }}><div>count</div> <div>{visitsPerDay[i].count}</div></Stack>
                        <Stack stackProps={{ className: 'justify-between' }}><div>date</div> <div>{toFormat(visitsPerDay[i].dateTS, local, undefined, DATE)}</div></Stack>
                    </Stack>,
                hoverRadius: 0,
            },
        })

        setShapes([chart])
        setReady(true)
    }

    function getMonth(ts: number): string {
        return toFormat(ts, local, undefined, 'LLL')
    }

    function calculateVisitsPerDay(vs: Visit[]): { count: number, dateTS: number }[] {
        // {dateTS => count}
        let map: { [k: string]: number } = {}
        for (let i = 0; i < vs.length; i++) {
            let k = toFormat(vs[i].due, local, undefined, 'yyyy M')

            if (map[k] === undefined)
                map[k] = 1
            else
                map[k] += 1
        }

        if (local.calendar === 'Gregorian')
            return Object.entries(map).map(e => ({ count: e[1], dateTS: DateTime.fromFormat(e[0], 'yyyy M').toUnixInteger() }))
        else
            return Object.entries(map).map(e => ({ count: e[1], dateTS: toDateTime({ date: persianToGregorian({ year: Number(e[0].split(' ')[0]), month: Number(e[0].split(' ')[1]), day: 1 }), time: { hour: 0, minute: 0, second: 0, millisecond: 0 } }, local, { ...local, calendar: 'Gregorian', zone: 'UTC' }).toUnixInteger() }))

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
            shapes={shapes}
            xAxis={{ styles: { lineWidth: 2 } }}
            yAxis={{ styles: { lineWidth: 2 } }}
            afterAxisDrawHook={(ctx, t, dx, chartOptions) => {
                let range = xRange.current![1]! - xRange.current![0]!
                let ts = DateTime.fromSeconds(xRange.current![0]!).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).plus({ days: 1 }).toUnixInteger()
                ctx.lineWidth = 0.5
                do {
                    let x = chartOptions!.offset!.left + chartOptions!.width! * (ts - xRange.current![0]!) / range
                    let y = chartOptions!.height! + chartOptions!.offset!.top
                    ctx.beginPath()
                    ctx.moveTo(x, y)
                    ctx.lineTo(x, y + 8)
                    ctx.stroke()

                    ts = DateTime.fromSeconds(ts).plus({ days: 1 }).toUnixInteger()
                } while (ts < xRange.current![1]!);
            }}
            afterChartOptionsSet={(chartOptions) => shapes!.forEach(s => s.hoverOptions.hoverRadius = 0.75 * chartOptions!.width! / (((xRange.current![1]! - xRange.current![0]!)) / (Duration.fromDurationLike({ days: 1 }).toMillis() / 1000)))}
            chartOptions={{
                offset: {
                    top: 0,
                    bottom: 30,
                    left: 30,
                    right: 0,
                },
                xAxisOffset: 15,
                yAxisOffset: 15,
            }}
        />
    )
}
