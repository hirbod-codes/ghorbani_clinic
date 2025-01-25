import { useContext, useEffect, useRef } from "react"
import { Point } from "../../Lib/Math"
import { getEasingFunction } from "../../Components/Animations/easings"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { DrawOptions, ChartOptions, CanvasStyleOptions } from "./index.d"
import { LineChart } from "../../Components/Chart/LineChart"

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

    const points = useRef<Point[]>()

    const animationId = useRef<number>()

    let oldT = 0
    let passed = 0

    const animate = (ctx: CanvasRenderingContext2D, points: Point[], canvasWidth: number, canvasHeight: number, t: DOMHighResTimeStamp) => {
        if (oldT === 0)
            oldT = t
        passed = t - oldT
        let dx = (passed % animationDuration) / animationDuration

        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        let gridHorizontalLinesFraction = getEasingFunction(gridHorizontalLines.ease ?? 'easeInSine')(dx)
        gridHorizontalLines.styles = {
            strokeStyle: themeOptions.colors.outline[themeOptions.mode].main,
            lineWidth: 0.5,
            ...gridHorizontalLines?.animateStyles ? gridHorizontalLines.animateStyles(ctx, points, { ...gridHorizontalLines.styles }, chartOptions, gridHorizontalLinesFraction) : gridHorizontalLines?.styles
        }
        gridHorizontalLines?.animateDraw
            ? gridHorizontalLines.animateDraw(
                ctx,
                points,
                gridHorizontalLines.styles,
                chartOptions,
                gridHorizontalLinesFraction
            )
            : drawGridHorizontalLines(
                ctx,
                gridHorizontalLines?.count ?? 5,
                canvasWidth,
                canvasHeight,
                chartOptions.offset,
                gridHorizontalLines.styles,
                gridHorizontalLinesFraction,
                animationDuration
            )

        let gridVerticalLinesFraction = getEasingFunction(gridVerticalLines.ease ?? 'easeInSine')(dx)
        gridVerticalLines.styles = {
            strokeStyle: themeOptions.colors.outline[themeOptions.mode].main,
            lineWidth: 0.5,
            ...gridVerticalLines?.animateStyles ? gridVerticalLines.animateStyles(ctx, points, { ...gridVerticalLines.styles }, chartOptions, gridVerticalLinesFraction) : gridVerticalLines?.styles
        }
        gridVerticalLines?.animateDraw
            ? gridVerticalLines.animateDraw(
                ctx,
                points,
                gridVerticalLines.styles,
                chartOptions,
                gridVerticalLinesFraction
            )
            : drawGridVerticalLines(
                ctx,
                gridVerticalLines?.count ?? 5,
                canvasWidth,
                canvasHeight,
                chartOptions.offset,
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
            ...xAxis?.animateStyles ? xAxis.animateStyles(ctx, points, { ...xAxis.styles }, chartOptions, xAxisFraction) : xAxis?.styles
        }
        xAxis?.animateDraw
            ? xAxis.animateDraw(
                ctx,
                points,
                xAxis.styles,
                chartOptions,
                xAxisFraction
            )
            : drawXAxis(
                ctx,
                canvasWidth,
                canvasHeight,
                chartOptions.offset,
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
            ...yAxis?.animateStyles ? yAxis.animateStyles(ctx, points, { ...yAxis.styles }, chartOptions, yAxisFraction) : yAxis?.styles
        }
        yAxis?.animateDraw
            ? yAxis.animateDraw(
                ctx,
                points,
                yAxis.styles,
                chartOptions,
                yAxisFraction
            )
            : drawYAxis(
                ctx,
                canvasWidth,
                canvasHeight,
                chartOptions.offset,
                yAxis.styles,
                yAxisFraction,
                animationDuration
            )

        shapes.forEach(s => {
            s.stroke(ctx, getEasingFunction(s.strokeOptions.ease ?? 'easeInSine')(dx))
            s.fill(ctx, getEasingFunction(s.fillOptions.ease ?? 'easeInSine')(dx))
        })

        animationId.current = requestAnimationFrame((t) => animate(ctx, points, canvasWidth, canvasHeight, t))
    }

    const containerRef = useRef<HTMLDivElement>(null)
    const canvasWidth = useRef<number>()
    const canvasHeight = useRef<number>()

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

            shapes.forEach(s => s.setChartOptions({ ...chartOptions, width: rect.width, height: rect.height }))

            animationId.current = requestAnimationFrame((t) => animate(ctx.current!, points.current!, canvasWidth.current!, canvasHeight.current!, t))
        }
    }, [])

    function onPointerOver(e) {
        // if (!hoverNode || !points.current || !hoverHelpers.current || !ctx.current)
        //     return

        // for (let i = 0; i < points.current.length; i++)
        //     if (hoverHelpers.current[i].isInside(ctx.current, points.current[i])) {
        //         hoveringPoint.current = points.current[i]
        //         break;
        //     } else
        //         hoveringPoint.current = undefined
    }

    return (
        <div className="size-full" ref={containerRef}>
            <canvas
                ref={canvasRef}
                className="border-4 border-blue-500 size-full"
                style={{ backgroundColor: chartOptions.bgColor }}
                onPointerOver={onPointerOver}
            />
        </div>
    )
}
