import { PointerEvent, ReactNode, useContext, useEffect, useReducer, useRef } from "react"
import { Point } from "../../Lib/Math"
import { EasingName, getEasingFunction } from "../../Components/Animations/easings"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { DrawOptions, ChartOptions, CanvasStyleOptions } from "./index.d"
import { LineChart } from "../../Components/Chart/LineChart"
import { DropdownMenu } from "../Base/DropdownMenu"
import { useAnimate } from "../Animations/useAnimate"

function drawXAxis(ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, offset: number, styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, chartHeight + offset)
    ctx.lineTo(chartWidth + offset, chartHeight + offset)

    ctx.stroke()
}

function drawYAxis(ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number, offset: number, styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, chartHeight + offset)
    ctx.lineTo(offset, offset)

    ctx.stroke()
}

function drawGridHorizontalLines(ctx: CanvasRenderingContext2D, count: number, chartWidth: number, chartHeight: number, offset: number, styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    let segments = count - 2 + 1
    for (let i = 0; i < segments; i++) {
        ctx.moveTo(offset + ((i + 1) * chartWidth / segments), chartHeight + offset)
        ctx.lineTo(offset + ((i + 1) * chartWidth / segments), offset)
    }

    ctx.stroke()
}

function drawGridVerticalLines(ctx: CanvasRenderingContext2D, count: number, chartWidth: number, chartHeight: number, offset: number, styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, offset)
    ctx.lineTo(chartWidth + offset, offset)

    let segments = count - 2 + 1
    for (let i = 0; i < segments - 1; i++) {
        ctx.moveTo(offset, offset + ((i + 1) * chartHeight / segments))
        ctx.lineTo(chartWidth + offset, offset + ((i + 1) * chartHeight / segments))
    }

    ctx.stroke()
}

export type ChartProps = {
    chartOptions?: ChartOptions
    shapes?: LineChart[]
    animationDuration?: number
    gridHorizontalLines?: DrawOptions & { count?: number }
    gridVerticalLines?: DrawOptions & { count?: number }
    xAxis?: DrawOptions
    yAxis?: DrawOptions
    xLabels?: { value: number, node?: ReactNode }[]
    yLabels?: { value: number, node?: ReactNode }[]
}

export function Chart({
    chartOptions: chartOptionsInput = {
        offset: 60,
        xAxisOffset: 15,
        yAxisOffset: 15,
    },
    shapes = [],
    animationDuration = 5000,
    gridHorizontalLines = {},
    gridVerticalLines = {},
    xAxis = {},
    yAxis = {},
    xLabels = [],
    yLabels = [],
}: ChartProps) {
    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    const chartOptions = useRef<ChartOptions>(chartOptionsInput)
    const isDrawn = useRef<boolean>(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctx = useRef<CanvasRenderingContext2D>()

    const drawAnimation = useAnimate()

    let oldT = 0
    let passed = 0

    function draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, t: DOMHighResTimeStamp) {
        if (oldT === 0)
            oldT = t
        passed = t - oldT
        let dx = (passed % animationDuration) / animationDuration

        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        let gridHorizontalLinesFraction = getEasingFunction(gridHorizontalLines.ease ?? 'easeInSine')(dx)
        gridHorizontalLines.styles = {
            strokeStyle: themeOptions.colors.outline[themeOptions.mode].main,
            lineWidth: 0.5,
            ...gridHorizontalLines?.animateStyles ? gridHorizontalLines.animateStyles(ctx, { ...gridHorizontalLines.styles }, chartOptions.current, gridHorizontalLinesFraction) : gridHorizontalLines?.styles
        }
        gridHorizontalLines?.animateDraw
            ? gridHorizontalLines.animateDraw(
                ctx,
                gridHorizontalLines.styles,
                chartOptions.current,
                gridHorizontalLinesFraction
            )
            : drawGridHorizontalLines(
                ctx,
                gridHorizontalLines?.count ?? 5,
                chartOptions.current.width!,
                chartOptions.current.height!,
                chartOptions.current.offset ?? 30,
                gridHorizontalLines.styles,
                gridHorizontalLinesFraction,
                animationDuration
            )

        let gridVerticalLinesFraction = getEasingFunction(gridVerticalLines.ease ?? 'easeInSine')(dx)
        gridVerticalLines.styles = {
            strokeStyle: themeOptions.colors.outline[themeOptions.mode].main,
            lineWidth: 0.5,
            ...gridVerticalLines?.animateStyles ? gridVerticalLines.animateStyles(ctx, { ...gridVerticalLines.styles }, chartOptions.current, gridVerticalLinesFraction) : gridVerticalLines?.styles
        }
        gridVerticalLines?.animateDraw
            ? gridVerticalLines.animateDraw(
                ctx,
                gridVerticalLines.styles,
                chartOptions.current,
                gridVerticalLinesFraction
            )
            : drawGridVerticalLines(
                ctx,
                gridVerticalLines?.count ?? 5,
                chartOptions.current.width!,
                chartOptions.current.height!,
                chartOptions.current.offset ?? 30,
                gridVerticalLines.styles,
                gridVerticalLinesFraction,
                animationDuration
            )

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
                chartOptions.current.offset ?? 30,
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
                chartOptions.current.offset ?? 30,
                yAxis.styles,
                yAxisFraction,
                animationDuration
            )

        let path = new Path2D()
        path.rect((chartOptions.current.offset ?? 0) - (yAxis?.styles?.lineWidth ?? 0), (chartOptions.current.offset ?? 0) - (xAxis?.styles?.lineWidth ?? 0), (chartOptions.current.width ?? 0) + (yAxis?.styles?.lineWidth ?? 0), (chartOptions.current.height ?? 0) + (xAxis?.styles?.lineWidth ?? 0) * 2)
        ctx.clip(path)

        shapes.forEach(s => s.animateDefaults(t, ctx, hoverEvent.current))
    }

    const containerRef = useRef<HTMLDivElement>(null)
    const canvasWidth = useRef<number>()
    const canvasHeight = useRef<number>()

    const hover = useRef<{ [k: number]: { open?: boolean, pIndex?: number, top?: number, left?: number, node?: ReactNode } }>({})
    const hoverEvent = useRef<PointerEvent>()

    const [, rerender] = useReducer(x => x + 1, 0)

    useEffect(() => {
        if (canvasRef.current && containerRef.current && !isDrawn.current) {
            isDrawn.current = true

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

            chartOptions.current.width = rect.width - (chartOptions.current.offset ?? 0) * 2
            chartOptions.current.height = rect.height - (chartOptions.current.offset ?? 0) * 2

            console.log({ rect, chartOptions: chartOptions.current })

            shapes.forEach(s => s.setChartOptions({ ...chartOptions.current, ...s.getChartOptions(), width: chartOptions.current.width, height: chartOptions.current.height }))

            drawAnimation.play((t => draw(ctx.current!, canvasWidth.current!, canvasHeight.current!, t)))

            rerender()
        }
    }, [])

    function onPointerOver(e: PointerEvent) {
        hoverEvent.current = e

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
            else
                hover.current[i] = {
                    open: true,
                    pIndex: pIndex,
                    top: shapes[i].points[pIndex]?.y,
                    left: shapes[i].points[pIndex]?.x,
                    node: shapes[i].hoverOptions.getHoverNode !== undefined && typeof shapes[i].hoverOptions.getHoverNode === 'function' ? shapes[i].hoverOptions.getHoverNode!(shapes[i].points, pIndex) : ''
                }

            if (shouldRerender)
                rerender()
        }
    }

    return (
        <div className="size-full" ref={containerRef}>
            <canvas
                ref={canvasRef}
                className="border border-blue-500 size-full"
                style={{ backgroundColor: chartOptions.current.bgColor }}
                onPointerMove={onPointerOver}
                onPointerLeave={() => {
                    hoverEvent.current = undefined
                    for (const k in hover.current)
                        hover.current[k].open = false
                    rerender()
                }}
            />

            {shapes.map((s, i) =>
                <DropdownMenu
                    key={i}
                    open={hover.current[i]?.open ?? false}
                    containerProps={{ style: { zIndex: 50 } }}
                    anchorDomRect={{
                        width: s.hoverOptions.hoverWidth,
                        height: s.hoverOptions.hoverHeight,
                        top: hover.current[i]?.top,
                        left: hover.current[i]?.left,
                    }}
                >
                    {hover.current[i]?.node}
                </DropdownMenu>
            )}

            {shapes.map(s =>
                s.xLabels.map((l, i) =>
                    l.value !== undefined && l.node !== undefined
                        ? <div key={i} className="absolute" style={{ top: `${(chartOptions.current.height ?? 0) + (chartOptions.current.offset ?? 0) + (chartOptions.current.xAxisOffset ?? 0)}px`, left: l.value }}>
                            <div className="relative -translate-y-1/2 -translate-x-1/2">
                                {l.node}
                            </div>
                        </div>
                        : undefined
                )
            )}

            {shapes.map(s =>
                s.yLabels.map((l, i) =>
                    l.value !== undefined && l.node !== undefined
                        ? <div key={i} className="absolute" style={{ top: l.value, left: `${(chartOptions.current.offset ?? 0) - (chartOptions.current.yAxisOffset ?? 0)}px` }}>
                            <div className="relative -translate-y-1/2 -translate-x-full">
                                {l.node}
                            </div>
                        </div>
                        : undefined
                )
            )}
        </div >
    )
}
