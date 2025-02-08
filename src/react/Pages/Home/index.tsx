import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { memo, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Calendar } from "./Calendar";
import { Clock } from "../../Components/Clock";
import { ChartArea, Chart as ChartJs } from 'chart.js/auto'
import { ColorStatic } from "../../Lib/Colors/ColorStatic";
import { Button } from "../../Components/Base/Button";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { Chart } from "../../Components/Chart";
import { LineChart } from "../../Components/Chart/LineChart";
import { Visit } from "@/src/Electron/Database/Models/Visit";
import { DateTime } from "luxon";
import { Date } from "../../Lib/DateTime";
import { RendererDbAPI } from "@/src/Electron/Database/renderer";
import { toDateTime, toFormat } from "../../Lib/DateTime/date-time-helpers";

export const Home = memo(function Home() {
    console.log('Home')

    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    let x = [0, 1, 2, 3, 4, 5, 6, 7]
    let y = [85, 85, 80, 85, 56, 55, 40, 50]

    return (
        <div className="size-full overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-12 justify-center w-full *:p-1">
                <div className="sm:col-span-12 md:col-span-3 col-span-12">
                    <Clock />
                </div>

                <div className="sm:col-span-12 md:col-span-6 col-span-12">
                    <Calendar />
                </div>

                {/* <div className="sm:col-span-12 md:col-span-3 col-span-12">
                    <Analytics />
                </div> */}

                <div className="sm:col-span-12 md:col-span-4 col-span-12">
                    {/* <Chart2 /> */}
                    {/* <Chart x={[85, 85, 80, 85, 56, 55, 40, 50]} y={[85, 85, 80, 85, 56, 55, 40, 50]} /> */}
                    <div className="absolute top-0 left-0 bg-surface-bright z-50 w-[1000px] h-[800px]">
                        <VisitsChart />
                        {/* <Chart
                            shapes={[
                                new LineChart({
                                    x,
                                    y,
                                    xLabels: x.map(value => ({ value, node: value })),
                                    yLabels: y.map(value => ({ value, node: value })),
                                    hoverOptions: {
                                        animate(ctx, e, dataPoints, dataPointIndex, chartOptions, hoverOptions, dx) {
                                            ctx.strokeStyle = 'red'
                                            ctx.lineWidth = 1

                                            if (dataPoints[dataPointIndex] !== undefined) {
                                                ctx.beginPath()
                                                ctx.ellipse(dataPoints[dataPointIndex].x, dataPoints[dataPointIndex].y, hoverOptions.hoverRadius ?? 20, hoverOptions.hoverRadius ?? 20, 0, 0, 2 * Math.PI * dx)
                                                ctx.stroke()
                                            }
                                        },
                                        controller: 3,
                                        duration: 2000,
                                        ease: 'easeOutExpo',
                                        getHoverNode: (ps, i) => 'aaaaaaaaaa',
                                        hoverHeight: 100,
                                        hoverWidth: 200,
                                        hoverRadius: 20,
                                    },
                                    fillOptions: {
                                        styles: undefined,
                                        animateStyles(ctx, dataPoints, styleOptions, chartOptions, fraction) {
                                            let g = ctx.createLinearGradient(0, 0, 0, chartOptions?.height ?? 10)
                                            g.addColorStop(0, 'red')
                                            g.addColorStop(1, 'transparent')
                                            return {
                                                fillStyle: g,
                                                // fillStyle: '#0000ff00',
                                                // strokeStyle: 'red',
                                                strokeStyle: 'transparent',
                                                lineCap: 'butt',
                                                lineWidth: 20,
                                            }
                                        },
                                    },
                                    strokeOptions: {
                                        controller: 3,
                                        duration: 5000,
                                        styles: {
                                            strokeStyle: '#00ff0080',
                                            lineWidth: 20,
                                            lineCap: 'round',
                                        },
                                        ease: 'easeOutExpo'
                                    },
                                    animationDuration: 5000
                                })
                            ]}
                        /> */}
                    </div>
                </div>
            </div>
        </div>
    )
})

export function VisitsChart() {
    let local = useContext(ConfigurationContext)!.local

    const [visits, setVisits] = useState<Visit[]>([])
    const [shapes, setShapes] = useState<LineChart[]>()

    const [startDate, setStartDate] = useState<number>(DateTime.utc().minus({ months: 6 }).toUnixInteger())
    const [endDate, setEndDate] = useState<number>(DateTime.utc().toUnixInteger())

    const [ready, setReady] = useState(false)

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

        let vspd = calculateVisitsPerDay(vs)
        console.log({ vspd })

        let xRange: [number | undefined, number | undefined] = [Math.min(DateTime.fromSeconds(vs[0].due).toUnixInteger(), startDate), DateTime.fromSeconds(vs[vs.length - 1].due).plus({ months: 1 }).minus({ days: 1 }).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toUnixInteger()]
        console.log({ xRange })

        let xLabels: { value: number, node: ReactNode }[] = [{ value: xRange[1]!, node: getMonth(xRange[1]!) }]
        let ts = DateTime.fromSeconds(xRange[1]!).minus({ months: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toUnixInteger()
        while (true) {
            if (ts <= xRange[0]!) {
                xLabels.unshift({ value: xRange[0]!, node: getMonth(xRange[0]!) })
                break
            }

            xLabels.unshift({ value: ts, node: getMonth(ts) })

            ts = DateTime.fromSeconds(ts).minus({ months: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toUnixInteger()
        }

        let chart = new LineChart({
            x: vspd.map(v => v.dateTS),
            y: vspd.map(v => v.count),
            xLabels: xLabels.map(v => ({ ...v, options: { className: 'text-xs' } })),
            yLabels: Array(10).fill(0).map((v, i) => ({ value: i, node: i, options: { className: 'text-xs' } })),
            xRange,
            // yRange: [1, 4],
            strokeOptions: {
                controller: 3,
                duration: 5000,
                // animateDraw(ctx, dataPoints, styleOptions, chartOptions, fraction) {
                //     if (styleOptions)
                //         Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions![k])

                //     let rectWidth = 10
                //     dataPoints.forEach(p => {
                //         ctx.beginPath()
                //         let offset = chartOptions!.offset! + 2
                //         let h = chartOptions!.height! - p.y - offset
                //         ctx.rect(p.x - rectWidth / 2, chartOptions!.height! + offset - fraction! * h, rectWidth, h * fraction!)
                //         // ctx.stroke()
                //         ctx.fill()
                //     })

                //     ctx.beginPath()
                //     ctx.moveTo(dataPoints[0].x, dataPoints[0].y)
                //     dataPoints.forEach(p => ctx.lineTo(p.x, p.y))
                //     ctx.stroke()
                // },
                styles: {
                    fillStyle: 'transparent',
                    strokeStyle: '#00ff0080',
                    lineWidth: 4,
                    lineCap: 'butt',
                },
                ease: 'easeOutExpo'
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
            let k = DateTime.fromSeconds(vs[i].due).toFormat('yyyy LLL dd')

            if (map[k] === undefined)
                map[k] = 1
            else
                map[k] += 1
        }

        return Object.entries(map).map(e => ({ count: e[1], dateTS: DateTime.fromFormat(e[0], 'yyyy LLL dd').toUnixInteger() }))
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
        ready && <Chart shapes={shapes} xAxis={{ styles: { lineWidth: 2 } }} />
    )
    // shapes={[
    //     new LineChart({
    //         x,
    //         y,
    //         xLabels: x.map(value => ({ value, node: value })),
    //         yLabels: y.map(value => ({ value, node: value })),
    //         hoverOptions: {
    //             animate(ctx, e, dataPoints, dataPointIndex, chartOptions, hoverOptions, dx) {
    //                 ctx.strokeStyle = 'red'
    //                 ctx.lineWidth = 1

    //                 if (dataPoints[dataPointIndex] !== undefined) {
    //                     ctx.beginPath()
    //                     ctx.ellipse(dataPoints[dataPointIndex].x, dataPoints[dataPointIndex].y, hoverOptions.hoverRadius ?? 20, hoverOptions.hoverRadius ?? 20, 0, 0, 2 * Math.PI * dx)
    //                     ctx.stroke()
    //                 }
    //             },
    //             controller: 3,
    //             duration: 2000,
    //             ease: 'easeOutExpo',
    //             getHoverNode: (ps, i) => 'aaaaaaaaaa',
    //             hoverHeight: 100,
    //             hoverWidth: 200,
    //             hoverRadius: 20,
    //         },
    //         fillOptions: {
    //             styles: undefined,
    //             animateStyles(ctx, dataPoints, styleOptions, chartOptions, fraction) {
    //                 let g = ctx.createLinearGradient(0, 0, 0, chartOptions?.height ?? 10)
    //                 g.addColorStop(0, 'red')
    //                 g.addColorStop(1, 'transparent')
    //                 return {
    //                     fillStyle: g,
    //                     // fillStyle: '#0000ff00',
    //                     // strokeStyle: 'red',
    //                     strokeStyle: 'transparent',
    //                     lineCap: 'butt',
    //                     lineWidth: 20,
    //                 }
    //             },
    //         },
    //         strokeOptions: {
    //             controller: 3,
    //             duration: 5000,
    //             styles: {
    //                 strokeStyle: '#00ff0080',
    //                 lineWidth: 20,
    //                 lineCap: 'round',
    //             },
    //             ease: 'easeOutExpo'
    //         },
    //     })
    // ]}
}

export function Chart2() {
    const containerRef = useRef<HTMLCanvasElement>(null)
    const pRef = useRef<HTMLParagraphElement>(null)

    const [chart, setChart] = useState<ChartJs | undefined>(undefined)
    const chartPropsRef = useRef<{
        width: number | undefined
        height: number | undefined
        borderGradient: CanvasGradient | undefined

        canvas: HTMLCanvasElement | undefined
        chart: ChartJs | undefined
        chartBgColor: string

        patternCanvas: HTMLCanvasElement | undefined
        patternContext: CanvasRenderingContext2D | undefined
        animateBackground: boolean
        backgroundGradientWidth: number | undefined
        backgroundGradient: CanvasGradient | undefined

        ctx: CanvasRenderingContext2D | undefined
        chartArea: ChartArea | undefined
        previousBorderFraction: number
        previousBackgroundFraction: number
        previousPulseFraction: number
        borderDir: boolean
        backgroundDir: boolean
        pulseRadiusDir: boolean
        pulseBackgroundDir: boolean
        rippleColor: string
        color: string
        pulseColor: string
    }>({
        width: undefined,
        height: undefined,
        borderGradient: undefined,
        chart: undefined,
        chartBgColor: '#ffffff',
        canvas: undefined,
        patternCanvas: undefined,
        patternContext: undefined,
        animateBackground: false,
        backgroundGradient: undefined,
        backgroundGradientWidth: undefined,
        ctx: undefined,
        chartArea: undefined,
        previousBorderFraction: 0,
        previousBackgroundFraction: 0,
        previousPulseFraction: 0,
        borderDir: true,
        backgroundDir: true,
        pulseRadiusDir: true,
        pulseBackgroundDir: true,
        rippleColor: '#00ff0030',
        color: '#00ff0080',
        pulseColor: '#00ff0080',
    })

    const fgColor = 'black'
    const displayXAxis = true
    const displayYAxis = true

    const init = (): void => {
        if (ChartJs.getChart(containerRef.current!) !== undefined)
            return

        let data = [85, 85, 80, 85, 56, 55, 40, 50]
        let datasetCommonOptions: any = {
            borderJoinStyle: 'round',
            borderCapStyle: 'round',
            pointBackgroundColor: 'red',
            pointBorderWidth: 0,
            pointRadius: 0,
            tension: 0.1,
            type: 'line',
            label: 'My First Dataset',
            data: data,
            borderWidth: 8,
        }

        let c = new ChartJs(
            containerRef.current!,
            {
                options: {
                    locale: 'en',
                    scales: {
                        x: {
                            bounds: 'ticks',
                            ticks: {
                                maxTicksLimit: 3,
                                color: fgColor,
                                display: displayXAxis,
                            },
                            grid: {
                                display: true
                            }
                        },
                        y: {
                            ticks: {
                                count: 3,
                                color: fgColor,
                                display: displayYAxis
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                },
                data: {
                    labels: data,
                    datasets: [
                        // pulse
                        // {
                        //     type: 'scatter',
                        //     data: [{ x: data[data.length - 1], y: data[data.length - 1] }] as any,
                        //     label: 'pulse',
                        //     pointRadius: 0,
                        //     backgroundColor: 'transparent',
                        //     borderColor: chartPropsRef.current.pulseColor,
                        //     animations: {
                        //         radius: {
                        //             type: "number",
                        //             delay: 500,
                        //             duration: 2500,
                        //             easing: 'easeOutExpo',
                        //             loop: true,
                        //             to: 24,
                        //             fn: (from, to, fraction) => {
                        //                 if (fraction > 0.95 && chartPropsRef.current.pulseRadiusDir)
                        //                     chartPropsRef.current.pulseRadiusDir = false
                        //                 if (fraction < 0.05 && !chartPropsRef.current.pulseRadiusDir)
                        //                     chartPropsRef.current.pulseRadiusDir = true

                        //                 return (chartPropsRef.current.pulseRadiusDir ? fraction * (to as number) : 0) as any
                        //             }
                        //         },
                        //         borderColor: {
                        //             type: "number",
                        //             delay: 500,
                        //             duration: 2500,
                        //             easing: 'easeOutExpo',
                        //             from: 0,
                        //             loop: true,
                        //             fn: (from, to, fraction) => {
                        //                 if (fraction > 0.95 && chartPropsRef.current.pulseBackgroundDir) {
                        //                     chartPropsRef.current.pulseBackgroundDir = false;
                        //                 }
                        //                 if (fraction < 0.05 && !chartPropsRef.current.pulseBackgroundDir) {
                        //                     chartPropsRef.current.pulseBackgroundDir = true;
                        //                 }

                        //                 let c = ColorStatic.parse(chartPropsRef.current.pulseColor).toRgb()
                        //                 c.setAlpha((1 - fraction) * c.getAlpha()!)
                        //                 return c.toHex() as any
                        //             }
                        //         }
                        //     }
                        // },
                        // border
                        {
                            ...datasetCommonOptions,
                            borderColor: () => {
                                if (!chartPropsRef.current.chart)
                                    return

                                let points = chartPropsRef.current.chart.getDatasetMeta(0).data
                                let lastDataPoint = points[points.length - 1]

                                if (!lastDataPoint || !lastDataPoint.x || !lastDataPoint.y)
                                    return

                                if (!chartPropsRef.current.chartArea || !chartPropsRef.current.ctx)
                                    return

                                let w = Math.sqrt(Math.pow(chartPropsRef.current.chartArea.width, 2) + Math.pow(chartPropsRef.current.chartArea.height, 2))
                                chartPropsRef.current.backgroundGradient = chartPropsRef.current.ctx.createRadialGradient(lastDataPoint.x, lastDataPoint.y, 0, lastDataPoint.x, lastDataPoint.y, w);

                                chartPropsRef.current.backgroundGradient.addColorStop(0, chartPropsRef.current.color);
                                chartPropsRef.current.backgroundGradient.addColorStop(1, 'transparent');

                                return chartPropsRef.current.backgroundGradient as any
                            },
                        },
                        // border background
                        {
                            ...datasetCommonOptions,
                            fill: true,
                            borderColor: chartPropsRef.current.chartBgColor
                        },
                        // background animation
                        {
                            ...datasetCommonOptions,
                            fill: true,
                            borderWidth: 0,
                            animations: {
                                backgroundColor: {
                                    type: 'number',
                                    // delay: 500,
                                    duration: 3000,
                                    easing: 'linear',
                                    from: 0,
                                    loop: true,
                                    fn: (from, to, fraction) => {
                                        if (fraction > 0.95 && chartPropsRef.current.backgroundDir) {
                                            chartPropsRef.current.backgroundDir = false;
                                        }
                                        if (fraction < 0.05 && !chartPropsRef.current.backgroundDir) {
                                            chartPropsRef.current.backgroundDir = true;
                                        }

                                        if (pRef?.current) {
                                            pRef.current.innerText = `dir: ${chartPropsRef.current.backgroundDir ? '+' : '-'}, fraction: ${fraction.toFixed(2)}, ${(1 - fraction).toFixed(2)}, r: ${chartPropsRef.current.previousBackgroundFraction > fraction ? '+' : '-'}`
                                            pRef.current.style.width = `${(fraction * 100)}px`
                                        }

                                        if (fraction > 1)
                                            fraction = 1

                                        if (fraction < 0)
                                            fraction = 0

                                        if (!chartPropsRef.current.chart)
                                            return

                                        let points = chartPropsRef.current.chart.getDatasetMeta(0).data
                                        let lastDataPoint = points[points.length - 1]

                                        if (!lastDataPoint || !lastDataPoint.x || !lastDataPoint.y)
                                            return

                                        if (!chartPropsRef.current.chartArea || !chartPropsRef.current.ctx)
                                            return '#00000000' as any

                                        if (chartPropsRef.current.backgroundDir === true) {
                                            if (!chartPropsRef.current.backgroundGradientWidth)
                                                chartPropsRef.current.backgroundGradientWidth = chartPropsRef.current.canvas!.width
                                            let w = chartPropsRef.current.backgroundGradientWidth
                                            w *= fraction
                                            chartPropsRef.current.patternContext!.beginPath()
                                            chartPropsRef.current.patternContext!.clearRect(0, 0, chartPropsRef.current.patternCanvas!.width, chartPropsRef.current.patternCanvas!.height)

                                            // let c = ColorStatic.parse(chartPropsRef.current.pulseColor).toRgb()
                                            // c.setAlpha((1 - fraction) * c.getAlpha()!)
                                            // chartPropsRef.current.patternContext!.strokeStyle = c.toHex()
                                            let g = chartPropsRef.current.patternContext!.createLinearGradient(chartPropsRef.current.patternCanvas!.width, 0, 0, 0)
                                            g.addColorStop(0, '#00ff00')
                                            g.addColorStop(1, chartPropsRef.current.chartBgColor)
                                            chartPropsRef.current.patternContext!.strokeStyle = g

                                            chartPropsRef.current.patternContext!.lineWidth = 8
                                            chartPropsRef.current.patternContext!.ellipse(lastDataPoint.x, lastDataPoint.y, w, w, 0, 0, 2 * Math.PI)
                                            chartPropsRef.current.patternContext!.stroke()
                                        }

                                        return chartPropsRef.current.ctx.createPattern(chartPropsRef.current!.patternCanvas as any, 'no-repeat')! as any
                                    },
                                },
                            },
                        },
                        // background color
                        {
                            ...datasetCommonOptions,
                            borderWidth: 0,
                            fill: true,
                            animations: {
                                backgroundColor: {
                                    type: 'number',
                                    delay: 500,
                                    duration: 2500,
                                    easing: 'easeOutExpo',
                                    from: 0,
                                    loop: true,
                                    fn: (from, to, fraction) => {
                                        if (!chartPropsRef.current.chart)
                                            return

                                        let points = chartPropsRef.current.chart.getDatasetMeta(0).data
                                        let lastDataPoint = points[points.length - 1]

                                        if (!lastDataPoint || !lastDataPoint.x || !lastDataPoint.y)
                                            return

                                        if (!chartPropsRef.current.chartArea || !chartPropsRef.current.ctx)
                                            return

                                        let w = chartPropsRef.current.chartArea.width
                                        chartPropsRef.current.backgroundGradient = chartPropsRef.current.ctx.createRadialGradient(lastDataPoint.x, lastDataPoint.y, 0, lastDataPoint.x, lastDataPoint.y, w);

                                        chartPropsRef.current.backgroundGradient.addColorStop(0, chartPropsRef.current.color);
                                        chartPropsRef.current.backgroundGradient.addColorStop(1, chartPropsRef.current.chartBgColor);

                                        return chartPropsRef.current.backgroundGradient as any
                                    }
                                }
                            },
                        },
                    ]
                },
            }
        )

        console.log('instances', ChartJs.getChart(containerRef.current!))

        setChart(c)

        chartPropsRef.current.chart = c
        chartPropsRef.current.canvas = c.canvas
        chartPropsRef.current.ctx = c.ctx
        chartPropsRef.current.chartArea = c.chartArea

        chartPropsRef.current.patternCanvas = document.createElement("canvas");
        chartPropsRef.current.patternCanvas.width = c.canvas.width;
        chartPropsRef.current.patternCanvas.height = c.canvas.height;

        chartPropsRef.current.patternContext = chartPropsRef.current.patternCanvas.getContext("2d")!
    }

    useEffect(() => {
        if (containerRef?.current) {
            init()

            return () => chart?.destroy()
        }
    }, [containerRef, containerRef?.current])

    return (
        <>
            <div className="h-[10cm] w-[20cm] border">
                <canvas id='chartJs' ref={containerRef} style={{ overflow: 'hidden', width: '800px', height: '400px' }} />
            </div>
            <p ref={pRef} className="w-24 h-[80px] border overflow-visible text-nowrap" />
            <Button onClick={() => chartPropsRef.current.animateBackground = !chartPropsRef.current.animateBackground}>animate</Button>
        </>
    )
}
