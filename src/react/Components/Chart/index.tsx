import { PointerEvent, ReactNode, useCallback, useContext, useEffect, useReducer, useRef } from "react"
import { Point } from "../../Lib/Math"
import { EasingName, getEasingFunction } from "../../Components/Animations/easings"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { DrawOptions, ChartOptions, CanvasStyleOptions } from "./index.d"
import { LineChart } from "../../Components/Chart/LineChart"
import { DropdownMenu } from "../Base/DropdownMenu"
import { useAnimate } from "../Animations/useAnimate"
import { cn } from "../../shadcn/lib/utils"

function drawXAxis(ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, offset: ChartOptions['offset'], styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset!.left, chartHeight + offset!.top)
    ctx.lineTo(chartWidth + offset!.left, chartHeight + offset!.top)

    ctx.stroke()
}

function drawYAxis(ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, offset: ChartOptions['offset'], styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset!.left, chartHeight + offset!.top)
    ctx.lineTo(offset!.left, offset!.top)

    ctx.stroke()
}

export type ChartProps = {
    chartOptions?: ChartOptions
    shapes?: LineChart[]
    animationDuration?: number
    xAxis?: DrawOptions
    yAxis?: DrawOptions
    beforeAxisDrawHook?: (ctx: CanvasRenderingContext2D, t: DOMHighResTimeStamp, dx: number, chartOptions: ChartOptions) => void
    afterAxisDrawHook?: (ctx: CanvasRenderingContext2D, t: DOMHighResTimeStamp, dx: number, chartOptions: ChartOptions) => void
    afterChartOptionsSet?: (chartOptions: ChartOptions) => void
}

export function Chart({
    chartOptions: chartOptionsInput,
    shapes = [],
    animationDuration = 5000,
    xAxis = {},
    yAxis = {},
    beforeAxisDrawHook,
    afterAxisDrawHook,
    afterChartOptionsSet,
}: ChartProps) {
    if (!chartOptionsInput)
        chartOptionsInput = {
            offset: { top: 20, right: 20, left: 60, bottom: 60 },
            xAxisOffset: 15,
            yAxisOffset: 15,
        }
    else if (!chartOptionsInput.offset)
        chartOptionsInput.offset = { top: 20, right: 20, left: 60, bottom: 60 }

    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    const chartOptions = useRef<ChartOptions>(chartOptionsInput)
    const isDrawn = useRef<boolean>(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctx = useRef<CanvasRenderingContext2D>()

    const drawAnimation = useAnimate()

    const containerRef = useRef<HTMLDivElement>(null)
    const canvasWidth = useRef<number>()
    const canvasHeight = useRef<number>()

    const hover = useRef<{ [k: number]: { open?: boolean, pIndex?: number, top?: number, left?: number, node?: ReactNode } }>({})
    const hoverEvent = useRef<PointerEvent>()

    const [, rerender] = useReducer(x => x + 1, 0)

    console.log('Chart', { chartOptions, isDrawn, canvasRef, ctx, drawAnimation, containerRef, canvasWidth, canvasHeight, hover, hoverEvent, shapes, animationDuration, xAxis, yAxis });

    let oldT = 0
    let passed = 0

    const draw = useCallback(function draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, t: DOMHighResTimeStamp) {
        if (oldT === 0)
            oldT = t
        passed = t - oldT
        let dx = (passed % animationDuration) / animationDuration

        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        if (beforeAxisDrawHook)
            beforeAxisDrawHook(ctx, t, dx, chartOptions.current)

        let xAxisFraction = getEasingFunction(xAxis.ease ?? 'easeInSine')(dx)
        xAxis.styles =
        {
            strokeStyle: themeOptions.colors.surface[themeOptions.mode].foreground,
            lineWidth: 2,
            lineCap: 'square',
            ...xAxis?.animateStyles ? xAxis.animateStyles(ctx, { ...xAxis.styles }, chartOptions.current, xAxisFraction) : xAxis?.styles
        }
        xAxis?.animateDraw
            ? xAxis.animateDraw(
                ctx,
                xAxis.styles,
                chartOptions.current,
                xAxisFraction
            )
            : drawXAxis(
                ctx,
                chartOptions.current.width!,
                chartOptions.current.height!,
                chartOptions.current.offset,
                xAxis.styles,
                xAxisFraction,
                animationDuration
            )

        let yAxisFraction = getEasingFunction(yAxis.ease ?? 'easeInSine')(dx)
        yAxis.styles =
        {
            strokeStyle: themeOptions.colors.surface[themeOptions.mode].foreground,
            lineWidth: 2,
            lineCap: 'square',
            ...yAxis?.animateStyles ? yAxis.animateStyles(ctx, { ...yAxis.styles }, chartOptions.current, yAxisFraction) : yAxis?.styles
        }
        yAxis?.animateDraw
            ? yAxis.animateDraw(
                ctx,
                yAxis.styles,
                chartOptions.current,
                yAxisFraction
            )
            : drawYAxis(
                ctx,
                chartOptions.current.width!,
                chartOptions.current.height!,
                chartOptions.current.offset!,
                yAxis.styles,
                yAxisFraction,
                animationDuration
            )

        if (afterAxisDrawHook)
            afterAxisDrawHook(ctx, t, dx, chartOptions.current)

        let path = new Path2D()
        path.rect((chartOptions.current.offset!.left) + (yAxis?.styles?.lineWidth ?? 0) / 2, (chartOptions.current.offset!.top), (chartOptions.current.width ?? 0) - (yAxis?.styles?.lineWidth ?? 0) / 2, (chartOptions.current.height ?? 0) - (xAxis?.styles?.lineWidth ?? 0) / 2)
        ctx.clip(path)

        shapes.forEach(s => s.animateDefaults(t, ctx, hoverEvent.current))
    }, [shapes, xAxis, yAxis, chartOptions.current])

    useEffect(() => {
        if (shapes.length > 0 && canvasRef.current && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            canvasWidth.current = rect.width
            canvasHeight.current = rect.height

            ctx.current = canvasRef.current.getContext('2d')!

            canvasRef.current.style.width = rect.width + "px"
            canvasRef.current.style.height = rect.height + "px"

            let scale = window.devicePixelRatio
            canvasRef.current.width = rect.width * scale
            canvasRef.current.height = rect.height * scale
            ctx.current.scale(scale, scale)

            chartOptions.current.width = rect.width - (chartOptions.current.offset!.left + chartOptions.current.offset!.right)
            chartOptions.current.height = rect.height - (chartOptions.current.offset!.top + chartOptions.current.offset!.bottom)

            shapes.forEach(s => s.setChartOptions({ ...chartOptions.current, ...s.getChartOptions(), width: chartOptions.current.width, height: chartOptions.current.height }))

            if (afterChartOptionsSet)
                afterChartOptionsSet({ ...chartOptions.current, width: chartOptions.current.width, height: chartOptions.current.height })

            rerender()

            drawAnimation.play((t => draw(ctx.current!, canvasWidth.current!, canvasHeight.current!, t)))
        }
    }, [shapes, canvasRef?.current, containerRef?.current])

    const onPointerOver = useCallback(function onPointerOver(e: PointerEvent) {
        hoverEvent.current = e

        if (shapes)
            for (let i = 0; i < shapes.length; i++) {
                let shouldRerender = false

                let pIndex = shapes[i].findHoveringDataPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })

                if (
                    (hover.current[i]?.open === true && pIndex === undefined) ||
                    (hover.current[i]?.open === false && pIndex !== undefined)
                )
                    shouldRerender = true

                if (hover.current[i] === undefined)
                    hover.current[i] = {}

                if (pIndex === undefined)
                    hover.current[i].open = false
                else {
                    const canvasDomRect = canvasRef.current?.getBoundingClientRect()
                    hover.current[i] = {
                        open: true,
                        pIndex: pIndex,
                        top: (canvasDomRect?.top ?? 0) + shapes[i].points[pIndex]?.y,
                        left: (canvasDomRect?.left ?? 0) + shapes[i].points[pIndex]?.x,
                        node: shapes[i].hoverOptions.getHoverNode !== undefined && typeof shapes[i].hoverOptions.getHoverNode === 'function' ? shapes[i].hoverOptions.getHoverNode!(shapes[i].points, pIndex) : ''
                    }
                }

                if (shouldRerender)
                    rerender()
            }
    }, [shapes])

    return (
        <div className="size-full overflow-hidden" ref={containerRef}>
            <canvas
                ref={canvasRef}
                className="size-full"
                style={{ backgroundColor: chartOptions.current.bgColor }}
                onPointerMove={onPointerOver}
                onPointerLeave={() => {
                    hoverEvent.current = undefined
                    hover.current = {}
                    rerender()
                }}
            />

            {shapes.map((s, i) =>
                <DropdownMenu
                    key={i}
                    open={hover.current[i]?.open ?? false}
                    verticalPosition="top"
                    containerProps={{
                        className: 'pointer-events-none select-none',
                        style: { zIndex: 50 }
                    }}
                    anchorDomRect={{
                        width: 10,
                        height: 10,
                        top: hover.current[i]?.top,
                        left: hover.current[i]?.left,
                    }}
                >
                    {hover.current[i]?.node}
                </DropdownMenu>
            )}

            {(shapes.map(s =>
                s.getChartOptions() && s.xLabels.map((l, i) =>
                    l.value !== undefined && l.node !== undefined
                        ? <div key={i} {...l.options} className={cn("absolute", l?.options?.className)} style={{ ...l?.options?.style, top: `${(s.getChartOptions()!.height ?? 0) + (s.getChartOptions()!.offset!.top ?? 0) + (s.getChartOptions()!.xAxisOffset ?? 0)}px`, left: l.value }}>
                            <div className="relative -translate-y-1/2 -translate-x-1/2">
                                {l.node}
                            </div>
                        </div>
                        : undefined
                )
            ))}

            {(shapes.map(s =>
                s.getChartOptions() && s.yLabels.map((l, i) =>
                    l.value !== undefined && l.node !== undefined
                        ? <div key={i} {...l.options} className={cn("absolute", l?.options?.className)} style={{ ...l?.options?.style, top: l.value, left: `${(s.getChartOptions()!.offset!.left ?? 0) - (s.getChartOptions()!.yAxisOffset ?? 0)}px` }}>
                            <div className="relative -translate-y-1/2 -translate-x-full">
                                {l.node}
                            </div>
                        </div>
                        : undefined
                )
            ))}
        </div >
    )
}
