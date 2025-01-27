import { PointerEvent, ReactNode, useContext, useEffect, useReducer, useRef } from "react"
import { Point } from "../../Lib/Math"
import { EasingName, getEasingFunction } from "../../Components/Animations/easings"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { DrawOptions, ChartOptions, CanvasStyleOptions } from "./index.d"
import { LineChart } from "../../Components/Chart/LineChart"
import { DropdownMenu } from "../Base/DropdownMenu"
import { useAnimate } from "../Animations/useAnimate"

function drawXAxis(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, canvasHeight - offset)
    ctx.lineTo(canvasWidth - offset, canvasHeight - offset)

    ctx.stroke()
}

function drawYAxis(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, canvasHeight - offset)
    ctx.lineTo(offset, offset)

    ctx.stroke()
}

function drawGridHorizontalLines(ctx: CanvasRenderingContext2D, count: number, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    let width = canvasWidth - (2 * offset)
    let segments = count - 2 + 1
    for (let i = 0; i < segments; i++) {
        ctx.moveTo(offset + ((i + 1) * width / segments), canvasHeight - offset)
        ctx.lineTo(offset + ((i + 1) * width / segments), offset)
    }

    ctx.stroke()
}

function drawGridVerticalLines(ctx: CanvasRenderingContext2D, count: number, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: CanvasStyleOptions, fraction: number, animationDuration: number) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, offset)
    ctx.lineTo(canvasWidth - offset, offset)

    let height = canvasHeight - (2 * offset)
    let segments = count - 2 + 1
    for (let i = 0; i < segments - 1; i++) {
        ctx.moveTo(offset, offset + ((i + 1) * height / segments))
        ctx.lineTo(canvasWidth - offset, offset + ((i + 1) * height / segments))
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
}

export function Chart({
    chartOptions = {
        width: 800,
        height: 400,
        offset: 30,
        xAxisOffset: 15,
        yAxisOffset: 15,
        hoverRadius: 20,
    },
    shapes = [],
    animationDuration = 5000,
    gridHorizontalLines = {},
    gridVerticalLines = {},
    xAxis = {},
    yAxis = {},
}: ChartProps) {
    const themeOptions = useContext(ConfigurationContext)!.themeOptions

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
            ...gridHorizontalLines?.animateStyles ? gridHorizontalLines.animateStyles(ctx, { ...gridHorizontalLines.styles }, chartOptions, gridHorizontalLinesFraction) : gridHorizontalLines?.styles
        }
        gridHorizontalLines?.animateDraw
            ? gridHorizontalLines.animateDraw(
                ctx,
                gridHorizontalLines.styles,
                chartOptions,
                gridHorizontalLinesFraction
            )
            : drawGridHorizontalLines(
                ctx,
                gridHorizontalLines?.count ?? 5,
                canvasWidth,
                canvasHeight,
                chartOptions.offset ?? 30,
                gridHorizontalLines.styles,
                gridHorizontalLinesFraction,
                animationDuration
            )

        let gridVerticalLinesFraction = getEasingFunction(gridVerticalLines.ease ?? 'easeInSine')(dx)
        gridVerticalLines.styles = {
            strokeStyle: themeOptions.colors.outline[themeOptions.mode].main,
            lineWidth: 0.5,
            ...gridVerticalLines?.animateStyles ? gridVerticalLines.animateStyles(ctx, { ...gridVerticalLines.styles }, chartOptions, gridVerticalLinesFraction) : gridVerticalLines?.styles
        }
        gridVerticalLines?.animateDraw
            ? gridVerticalLines.animateDraw(
                ctx,
                gridVerticalLines.styles,
                chartOptions,
                gridVerticalLinesFraction
            )
            : drawGridVerticalLines(
                ctx,
                gridVerticalLines?.count ?? 5,
                canvasWidth,
                canvasHeight,
                chartOptions.offset ?? 30,
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
            ...xAxis?.animateStyles ? xAxis.animateStyles(ctx, { ...xAxis.styles }, chartOptions, xAxisFraction) : xAxis?.styles
        }
        xAxis?.animateDraw
            ? xAxis.animateDraw(
                ctx,
                xAxis.styles,
                chartOptions,
                xAxisFraction
            )
            : drawXAxis(
                ctx,
                canvasWidth,
                canvasHeight,
                chartOptions.offset ?? 30,
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
            ...yAxis?.animateStyles ? yAxis.animateStyles(ctx, { ...yAxis.styles }, chartOptions, yAxisFraction) : yAxis?.styles
        }
        yAxis?.animateDraw
            ? yAxis.animateDraw(
                ctx,
                yAxis.styles,
                chartOptions,
                yAxisFraction
            )
            : drawYAxis(
                ctx,
                canvasWidth,
                canvasHeight,
                chartOptions.offset ?? 30,
                yAxis.styles,
                yAxisFraction,
                animationDuration
            )

        shapes.forEach(s => {
            s.animate(t, s.animationRunsController, (dx) => {
                s.stroke(ctx, getEasingFunction(s.strokeOptions.ease ?? 'easeInSine')(dx))
                s.fill(ctx, getEasingFunction(s.fillOptions.ease ?? 'easeInSine')(dx))
            })

            s.animate(t, 3, (dx) => {
                if (!hoverEvent.current)
                    return

                s.onHover(ctx, hoverEvent.current!, getEasingFunction(s.strokeOptions.ease ?? 'easeInSine')(dx))
            })
        })
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

            shapes.forEach(s => s.setChartOptions({ ...chartOptions, ...s.getChartOptions(), width: rect.width, height: rect.height }))
            shapes.forEach(s => s.play())

            drawAnimation.play((t => draw(ctx.current!, canvasWidth.current!, canvasHeight.current!, t)))
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
                    node: shapes[i].getChartOptions().getHoverNode !== undefined && typeof shapes[i].getChartOptions().getHoverNode === 'function' ? shapes[i].getChartOptions().getHoverNode!(shapes[i].points, pIndex) : ''
                }

            if (shouldRerender)
                rerender()
        }
    }

    return (
        <div className="size-full" ref={containerRef}>
            <canvas
                ref={canvasRef}
                className="border-4 border-blue-500 size-full"
                style={{ backgroundColor: chartOptions.bgColor }}
                onPointerMove={onPointerOver}
                onPointerLeave={() => hoverEvent.current = undefined}
            />

            {shapes.map((s, i) =>
                <DropdownMenu
                    key={i}
                    open={hover.current[i]?.open ?? false}
                    containerProps={{ style: { zIndex: 50 } }}
                    anchorDomRect={{
                        width: s.getChartOptions().hoverWidth,
                        height: s.getChartOptions().hoverHeight,
                        top: hover.current[i]?.top ?? 0,
                        left: hover.current[i]?.left ?? 0,
                    }}
                >
                    {hover.current[i]?.node}
                </DropdownMenu>
            )}
        </div>
    )
}
