import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { memo, useEffect, useRef, useState } from "react";
import { Calendar } from "./Calendar";
import { Clock } from "../../Components/Clock";
import { ChartArea, Chart as ChartJs } from 'chart.js/auto'
import { ColorStatic } from "../../Lib/Colors/ColorStatic";
import { Button } from "../../Components/Base/Button";

export const Home = memo(function Home() {
    console.log('Home')

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
                    <Chart />
                </div>
                <div className="sm:col-span-0" />

                {/* <div className="sm:col-span-12 md:col-span-4 col-span-12">
                    <Analytics />
                </div> */}
            </div>
        </div>
    )
})

export function Chart() {
    const containerRef = useRef<HTMLCanvasElement>(null)
    const pRef = useRef<HTMLParagraphElement>(null)

    const [chart, setChart] = useState<ChartJs | undefined>(undefined)
    const chartPropsRef = useRef<{
        width: number | undefined
        height: number | undefined
        borderGradient: CanvasGradient | undefined

        canvas: HTMLCanvasElement | undefined

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

    const getGradient = (r2: number) => chartPropsRef.current.ctx!.createRadialGradient(chartPropsRef.current.chartArea!.right + 10, chartPropsRef.current.chartArea!.bottom + 10, 0, chartPropsRef.current.chartArea!.right + 10, chartPropsRef.current.chartArea!.bottom + 10, r2)

    const init = (): void => {
        let data = [85, 85, 80, 85, 56, 55, 40]
        setChart(new ChartJs(
            containerRef.current!,
            {
                // plugins: [{
                // }],
                data: {
                    labels: data,
                    datasets: [
                        {
                            type: 'line',
                            label: 'My First Dataset',
                            data: data,
                            fill: true,
                            borderColor: 'transparent',
                            // borderColor: function (context) {
                            //     const chart = context.chart;
                            //     chartPropsRef.current.ctx = chart.ctx
                            //     chartPropsRef.current.chartArea = chart.chartArea

                            //     if (!chartPropsRef.current.chartArea) {
                            //         // This case happens on initial chart load
                            //         return;
                            //     }

                            //     const chartWidth = chartPropsRef.current.chartArea.width;
                            //     const chartHeight = chartPropsRef.current.chartArea.height;
                            //     if (!chartPropsRef.current.borderGradient || chartPropsRef.current.width !== chartWidth || chartPropsRef.current.height !== chartHeight) {
                            //         // Create the chartPropsRef.current.borderGradient because this is either the first render
                            //         // or the size of the chart has changed

                            //         chartPropsRef.current.width = chartWidth;
                            //         chartPropsRef.current.height = chartHeight;
                            //         let w = Math.sqrt(Math.pow(chartPropsRef.current.chartArea.width, 2) + Math.pow(chartPropsRef.current.chartArea.height, 2)) + 10
                            //         chartPropsRef.current.borderGradient = chartPropsRef.current.ctx.createRadialGradient(chartPropsRef.current.chartArea.right, chartPropsRef.current.chartArea.bottom, 0, chartPropsRef.current.chartArea.right, chartPropsRef.current.chartArea.bottom, w);
                            //         chartPropsRef.current.borderGradient.addColorStop(0, chartPropsRef.current.color);
                            //         chartPropsRef.current.borderGradient.addColorStop(1, 'transparent');
                            //     }

                            //     return chartPropsRef.current.borderGradient;
                            // },
                            backgroundColor: function (context) {
                                const chart = context.chart;
                                chartPropsRef.current.canvas = chart.canvas
                                chartPropsRef.current.ctx = chart.ctx
                                chartPropsRef.current.chartArea = chart.chartArea

                                if (!chartPropsRef.current.chartArea) {
                                    // This case happens on initial chart load
                                    return;
                                }

                                const chartWidth = chartPropsRef.current.chartArea.width;
                                const chartHeight = chartPropsRef.current.chartArea.height;

                                if (!chartPropsRef.current.backgroundGradient || chartPropsRef.current.width !== chartWidth || chartPropsRef.current.height !== chartHeight) {
                                    // Create the chartPropsRef.current.backgroundGradient because this is either the first render
                                    // or the size of the chart has changed

                                    chartPropsRef.current.width = chartWidth;
                                    chartPropsRef.current.height = chartHeight;
                                    // let w = Math.sqrt(Math.pow(chartPropsRef.current.chartArea.width, 2) + Math.pow(chartPropsRef.current.chartArea.height, 2)) + 10
                                    // chartPropsRef.current.backgroundGradient = chartPropsRef.current.ctx.createRadialGradient(chartPropsRef.current.chartArea.right, chartPropsRef.current.chartArea.bottom, 0, chartPropsRef.current.chartArea.right, chartPropsRef.current.chartArea.bottom, w);
                                    chartPropsRef.current.backgroundGradient = chartPropsRef.current.ctx.createLinearGradient(chartPropsRef.current.chartArea.left, chartPropsRef.current.chartArea.top, chartPropsRef.current.chartArea.left, chartPropsRef.current.chartArea.bottom);
                                    chartPropsRef.current.backgroundGradient.addColorStop(0, chartPropsRef.current.color);
                                    chartPropsRef.current.backgroundGradient.addColorStop(1, 'transparent');

                                    chartPropsRef.current.patternCanvas = document.createElement("canvas");
                                    chartPropsRef.current.patternCanvas.width = chart.canvas.width;
                                    chartPropsRef.current.patternCanvas.height = chart.canvas.height;

                                    chartPropsRef.current.patternContext = chartPropsRef.current.patternCanvas.getContext("2d")!
                                }

                                return chartPropsRef.current.backgroundGradient;
                            },
                            tension: 0.1,
                            borderWidth: 8,
                        },
                        {
                            type: 'line',
                            label: 'My First Dataset',
                            data: data,
                            fill: true,
                            tension: 0.1,
                            borderWidth: 1,
                            borderColor: 'transparent',
                            animations: {
                                // borderColor: {
                                //     type: 'number',
                                //     easing: 'easeOutExpo',
                                //     delay: 500,
                                //     duration: 1500,
                                //     from: 0,
                                //     loop: true,
                                //     fn: (from, to, fraction) => {
                                //         fraction = Math.min(1, Math.max(0, fraction))

                                //         if (previousBorderFraction > fraction)
                                //             dir = false;
                                //         else
                                //             dir = true;
                                //         previousBorderFraction = fraction

                                //         if (dir) {
                                //             let w = Math.sqrt(Math.pow(chartArea.width, 2) + Math.pow(chartArea.height, 2)) + 30
                                //             w *= fraction
                                //             borderGradient = ctx.createRadialGradient(chartArea.right + 10, chartArea.bottom + 10, 0, chartArea.right + 10, chartArea.bottom + 10, w);
                                //             borderGradient.addColorStop(0, rippleColor);
                                //             borderGradient.addColorStop(1, 'transparent');
                                //         } else {
                                //             let w = Math.sqrt(Math.pow(chartArea.width, 2) + Math.pow(chartArea.height, 2)) + 10
                                //             borderGradient = ctx.createRadialGradient(chartArea.right, chartArea.bottom, 0, chartArea.right, chartArea.bottom, w);
                                //             let c = ColorStatic.parse(rippleColor).toRgb()
                                //             c.setAlpha(fraction)
                                //             borderGradient.addColorStop(0, rippleColor);
                                //             borderGradient.addColorStop(0, c.toHex());
                                //             borderGradient.addColorStop(1, 'transparent');
                                //         }

                                //         return borderGradient
                                //     },
                                // },
                                backgroundColor: {
                                    type: 'number',
                                    // easing: (ctx, options) => {

                                    // },
                                    delay: 500,
                                    duration: 2500,
                                    easing: 'easeOutExpo',
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
                                            pRef.current.innerText = `dir: ${chartPropsRef.current.backgroundDir ? '+' : '-'}, fraction: ${fraction}, r: ${chartPropsRef.current.previousBackgroundFraction > fraction ? '+' : '-'}`
                                            pRef.current.style.width = `${(fraction * 100)}px`
                                        }

                                        if (fraction > 1)
                                            fraction = 1

                                        if (fraction < 0)
                                            fraction = 0

                                        if (!chartPropsRef.current.chartArea || !chartPropsRef.current.ctx)
                                            return '#00000000' as any
                                        // return getGradient(0)

                                        // if (chartPropsRef.current.backgroundDir === true) {
                                        //     if (!chartPropsRef.current.backgroundGradientWidth)
                                        //         chartPropsRef.current.backgroundGradientWidth = Math.sqrt(Math.pow(chartPropsRef.current.chartArea.width, 2) + Math.pow(chartPropsRef.current.chartArea.height, 2)) * 1.3
                                        //     let w = chartPropsRef.current.backgroundGradientWidth
                                        //     w *= fraction
                                        //     chartPropsRef.current.backgroundGradient = chartPropsRef.current.ctx.createRadialGradient(chartPropsRef.current.chartArea.right + 10, chartPropsRef.current.chartArea.bottom + 10, 0, chartPropsRef.current.chartArea.right + 10, chartPropsRef.current.chartArea.bottom + 10, w);
                                        //     chartPropsRef.current.backgroundGradient.addColorStop(0.85, 'transparent');
                                        //     chartPropsRef.current.backgroundGradient.addColorStop(0.9, chartPropsRef.current.rippleColor);
                                        //     chartPropsRef.current.backgroundGradient.addColorStop(0.95, 'transparent');
                                        // }

                                        // return chartPropsRef.current.backgroundGradient! as any

                                        if (chartPropsRef.current.backgroundDir === true) {
                                            if (!chartPropsRef.current.backgroundGradientWidth)
                                                chartPropsRef.current.backgroundGradientWidth = Math.sqrt(Math.pow(chartPropsRef.current.canvas!.width, 2) + Math.pow(chartPropsRef.current.canvas!.height, 2)) + 10
                                            let w = chartPropsRef.current.backgroundGradientWidth
                                            w *= fraction
                                            // w *= 3/4
                                            chartPropsRef.current.patternContext!.beginPath()
                                            chartPropsRef.current.patternContext!.clearRect(0, 0, chartPropsRef.current.patternCanvas!.width, chartPropsRef.current.patternCanvas!.height)

                                            let c = ColorStatic.parse(chartPropsRef.current.pulseColor).toRgb()
                                            // let c = ColorStatic.parse('#00ff0080').toRgb()
                                            c.setAlpha((1 - fraction) * c.getAlpha()!)
                                            chartPropsRef.current.patternContext!.strokeStyle = c.toHex()

                                            chartPropsRef.current.patternContext!.lineWidth = 4
                                            // chartPropsRef.current.patternContext!.shadowBlur = 4
                                            // chartPropsRef.current.patternContext!.shadowColor = 'black'
                                            // chartPropsRef.current.patternContext!.shadowOffsetX = 0
                                            // chartPropsRef.current.patternContext!.shadowOffsetY = 0
                                            chartPropsRef.current.patternContext!.ellipse(chartPropsRef.current.patternCanvas!.width, chartPropsRef.current.patternCanvas!.height, w, w, 0, 0, 2 * Math.PI)
                                            chartPropsRef.current.patternContext!.rect(0, 0, chartPropsRef.current.patternCanvas!.width, chartPropsRef.current.patternCanvas!.height)
                                            chartPropsRef.current.patternContext!.stroke()
                                        }

                                        return chartPropsRef.current.ctx.createPattern(chartPropsRef.current!.patternCanvas as any, 'no-repeat')! as any
                                    },
                                },
                            },
                        },
                        {
                            type: 'scatter',
                            data: [{ x: 40, y: 40 }],
                            label: 'pulse',
                            pointRadius: 0,
                            backgroundColor: 'transparent',
                            borderColor: chartPropsRef.current.pulseColor,
                            animations: {
                                radius: {
                                    type: "number",
                                    delay: 500,
                                    duration: 2500,
                                    easing: 'easeOutExpo',
                                    loop: true,
                                    to: 24,
                                    fn: (from, to, fraction) => {
                                        if (fraction > 0.95 && chartPropsRef.current.pulseRadiusDir) {
                                            chartPropsRef.current.pulseRadiusDir = false;
                                        }
                                        if (fraction < 0.05 && !chartPropsRef.current.pulseRadiusDir) {
                                            chartPropsRef.current.pulseRadiusDir = true;
                                        }

                                        return (chartPropsRef.current.pulseRadiusDir ? fraction * (to as number) : 0) as any
                                    }
                                },
                                borderColor: {
                                    type: "number",
                                    delay: 500,
                                    duration: 2500,
                                    easing: 'easeOutExpo',
                                    from: 0,
                                    loop: true,
                                    fn: (from, to, fraction) => {
                                        if (fraction > 0.95 && chartPropsRef.current.pulseBackgroundDir) {
                                            chartPropsRef.current.pulseBackgroundDir = false;
                                        }
                                        if (fraction < 0.05 && !chartPropsRef.current.pulseBackgroundDir) {
                                            chartPropsRef.current.pulseBackgroundDir = true;
                                        }

                                        let c = ColorStatic.parse(chartPropsRef.current.pulseColor).toRgb()
                                        c.setAlpha((1 - fraction) * c.getAlpha()!)
                                        return c.toHex() as any
                                    }
                                }
                            }
                        },
                    ]
                },
            }
        ))
    }

    useEffect(() => {
        if (containerRef?.current) {
            init()

            // if (chart) {
            //     chart.ctx.beginPath()
            //     chart.ctx.strokeStyle = 'green';
            //     chart.ctx.rect(0, 0, chart.chartArea.width, chart.chartArea.height)
            //     chart.draw()
            // }

            return () => chart?.destroy()
        }
    }, [])

    return (
        <>
            <div className="h-[10cm] w-[20cm] border">
                <canvas ref={containerRef} style={{ overflow: 'hidden', width: '800px', height: '400px' }} />
            </div>
            <p ref={pRef} className="w-24 h-[80px] border overflow-visible text-nowrap" />
            <Button onClick={() => chartPropsRef.current.animateBackground = !chartPropsRef.current.animateBackground}>animate</Button>
        </>
    )
}
