import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { Calendar } from "./Calendar";
import { Clock } from "../../Components/Clock";
import { ChartArea, Chart as ChartJs } from 'chart.js/auto'
import { ColorStatic } from "../../Lib/Colors/ColorStatic";
import { Button } from "../../Components/Base/Button";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { Chart } from "../../Components/Chart";
import { LineChart } from "../../Components/Chart/LineChart";

export const Home = memo(function Home() {
    console.log('Home')

    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    return (
        <div className="size-full overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-12 justify-center w-full *:p-1">
                <div className="sm:col-span-0 md:col-span-3" />
                <div className="sm:col-span-12 md:col-span-6 col-span-12">
                    <SearchPatientField />
                </div>
                <div className="sm:col-span-0 md:col-span-3" />

                <div className="sm:col-span-12 md:col-span-3 col-span-12">
                    <Clock />
                </div>

                <div className="sm:col-span-12 md:col-span-6 col-span-12">
                    <Calendar />
                </div>

                <div className="sm:col-span-12 md:col-span-4 col-span-12">
                    <Chart2 />
                    {/* <Chart x={[85, 85, 80, 85, 56, 55, 40, 50]} y={[85, 85, 80, 85, 56, 55, 40, 50]} /> */}
                    <div className="absolute top-0 left-0 bg-surface-bright z-50 size-[800px]">
                        <Chart
                            shapes={[
                                new LineChart({
                                    x: [0, 1, 2, 3, 4, 5, 6, 7],
                                    y: [85, 85, 80, 85, 56, 55, 40, 50],
                                    chartOptions: {
                                        getHoverNode: (ps, i) => 'aaaaaaaaaa',
                                        hoverHeight: 100,
                                        hoverWidth: 200,
                                        hoverRadius: 20,
                                    },
                                    fillOptions: {
                                        styles: {
                                            fillStyle: 'transparent',
                                            lineWidth: 4,
                                            strokeStyle: 'red'
                                        }
                                    },
                                    strokeOptions: {
                                        styles: {
                                            strokeStyle: '#00ff0080',
                                            lineWidth: 4,
                                            lineCap: 'round'
                                        },
                                        ease: 'easeOutExpo'
                                    },
                                    animationDuration: 5000
                                })
                            ]}
                        />
                    </div>
                </div>
                <div className="sm:col-span-0" />

                {/* <div className="sm:col-span-12 md:col-span-4 col-span-12">
                    <Analytics />
                </div> */}
            </div>
        </div>
    )
})

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
