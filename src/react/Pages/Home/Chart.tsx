import { ReactNode, useEffect, useRef, useState } from "react"
import { Point } from "../../Lib/Math"
import { Circle } from "../../Components/Base/Canvas/Shapes/Circle"
import { DropdownMenu } from "../../Components/Base/DropdownMenu"
import { EasingName, getEasingFunction } from "../../Components/Animations/easings"

export type DistributionMode = 'absolute' | 'even'

export type StyleOptions = {
    strokeStyle?: string | CanvasGradient | CanvasPattern
    fillStyle?: string | CanvasGradient | CanvasPattern
    lineWidth?: number
    lineJoin?: CanvasLineJoin
    lineCap?: CanvasLineCap
    lineDashOffset?: number
    miterLimit?: number
    shadowBlur?: number
    shadowColor?: string
    shadowOffsetX?: number
    shadowOffsetY?: number
    textAlign?: CanvasTextAlign
    textBaseline?: CanvasTextBaseline
    textRendering?: CanvasTextRendering
    wordSpacing?: string
}

export type ShapeProps = {
    ease?: EasingName
    styles?: StyleOptions
    animateStyles?: (ctx: CanvasRenderingContext2D, points: Point[], styleOptions: StyleOptions, fraction: number) => StyleOptions
}

export type ChartProps = {
    chartBgColor: string
    canvasWidth?: number
    canvasHeight?: number
    chartOffset?: number
    xAxisOffset?: number
    yAxisOffset?: number
    hoverNode?: ReactNode
    hoverRadius?: number
    x: number[]
    y: number[]
    xLabels?: ReactNode[]
    yLabels?: ReactNode[]
    xDistributionMode?: DistributionMode
    yDistributionMode?: DistributionMode
    points?: Point[]
    graphFill?: ShapeProps
    graph?: ShapeProps & { f?: number, tension?: number }
    gridHorizontalLines?: ShapeProps
    gridVerticalLines?: ShapeProps
    xAxis?: ShapeProps & { count?: number }
    yAxis?: ShapeProps & { count?: number }
}

export function Chart({
    chartBgColor,
    canvasWidth = 800,
    canvasHeight = 400,
    chartOffset = 30,
    xAxisOffset = 15,
    yAxisOffset = 15,
    hoverNode,
    hoverRadius = 20,
    x,
    y,
    xLabels,
    yLabels,
    points: inputPoints,
    xDistributionMode = 'absolute',
    yDistributionMode = 'absolute',
    graphFill,
    graph,
    gridHorizontalLines,
    gridVerticalLines,
    xAxis,
    yAxis,
}: ChartProps) {
    const isDrawn = useRef<boolean>(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const ctx = useRef<CanvasRenderingContext2D>()

    const points = useRef<Point[]>()
    const xLabelPositions = useRef<Point[]>()
    const yLabelPositions = useRef<Point[]>()

    const hoverHelpers = useRef<Circle[]>()
    const hoveringPoint = useRef<Point>()

    const animationId = useRef<number>()

    const animate = (ctx: CanvasRenderingContext2D, points: Point[], t: DOMHighResTimeStamp) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        drawGraphFill(
            ctx,
            points,
            canvasHeight,
            chartOffset,
            graphFill?.animateStyles ? graphFill.animateStyles(ctx, points, { ...graphFill.styles }, getEasingFunction(graphFill.ease ?? 'easeInSine')(t)) : graphFill?.styles ?? {},
            graph?.f,
            graph?.tension
        )

        drawGraph(
            ctx,
            points,
            chartBgColor,
            graph?.animateStyles ? graph.animateStyles(ctx, points, { ...graph.styles }, getEasingFunction(graph.ease ?? 'easeInSine')(t)) : graph?.styles ?? {},
            graph?.f,
            graph?.tension
        )

        hoverHelpers.current = createCircles(ctx, points, hoverRadius, 0, 'transparent', 'transparent')

        drawGridHorizontalLines(
            ctx,
            canvasWidth,
            canvasHeight,
            chartOffset,
            gridHorizontalLines?.animateStyles ? gridHorizontalLines.animateStyles(ctx, points, { ...gridHorizontalLines.styles }, getEasingFunction(gridHorizontalLines.ease ?? 'easeInSine')(t)) : gridHorizontalLines?.styles ?? {},
        )

        drawGridVerticalLines(
            ctx,
            canvasWidth,
            canvasHeight,
            chartOffset,
            gridVerticalLines?.animateStyles ? gridVerticalLines.animateStyles(ctx, points, { ...gridVerticalLines.styles }, getEasingFunction(gridVerticalLines.ease ?? 'easeInSine')(t)) : gridVerticalLines?.styles ?? {},
        )

        drawXAxis(
            ctx,
            xAxis?.count ?? x.length,
            canvasWidth,
            canvasHeight,
            chartOffset,
            xAxis?.animateStyles ? xAxis.animateStyles(ctx, points, { ...xAxis.styles }, getEasingFunction(xAxis.ease ?? 'easeInSine')(t)) : xAxis?.styles ?? {},
        )

        drawYAxis(
            ctx,
            yAxis?.count ?? x.length,
            canvasWidth,
            canvasHeight,
            chartOffset,
            yAxis?.animateStyles ? yAxis.animateStyles(ctx, points, { ...yAxis.styles }, getEasingFunction(yAxis.ease ?? 'easeInSine')(t)) : yAxis?.styles ?? {},
        )

        animationId.current = requestAnimationFrame((t) => animate(ctx, points, t))
    }

    useEffect(() => {
        if (canvasRef.current && !isDrawn.current) {
            isDrawn.current = true

            let xAxis = distribute(x, canvasWidth - (chartOffset * 2), xDistributionMode).map(v => v + chartOffset)
            let yAxis = distribute(y, canvasHeight - (chartOffset * 2) - (graph?.styles?.lineWidth ?? 0), yDistributionMode).map(v => canvasHeight - (chartOffset * 2) - (graph?.styles?.lineWidth ?? 0) - v).map(v => v + chartOffset + ((graph?.styles?.lineWidth ?? 0) / 2))

            xLabelPositions.current = xAxis.map(v => ({ x: v, y: canvasHeight - chartOffset + xAxisOffset }))
            yLabelPositions.current = yAxis.map(v => ({ y: v, x: chartOffset - yAxisOffset }))

            points.current = inputPoints
                ? inputPoints.map(v => ({ x: v.x + chartOffset, y: v.y + chartOffset + ((graph?.styles?.lineWidth ?? 0) / 2) }))
                : xAxis.map((_, i) => ({ x: xAxis[i], y: yAxis[i] }))

            ctx.current = canvasRef.current.getContext('2d')!

            canvasRef.current.style.width = canvasWidth + "px";
            canvasRef.current.style.height = canvasHeight + "px";

            let scale = window.devicePixelRatio
            canvasRef.current.width = canvasWidth * scale
            canvasRef.current.height = canvasHeight * scale
            ctx.current.scale(scale, scale);

            animationId.current = requestAnimationFrame((t) => animate(ctx.current!, points.current!, t))
        }
    }, [])

    function onPointerOver(e) {
        if (!hoverNode || !points.current || !hoverHelpers.current || !ctx.current)
            return

        for (let i = 0; i < points.current.length; i++)
            if (hoverHelpers.current[i].isInside(ctx.current, points.current[i])) {
                hoveringPoint.current = points.current[i]
                break;
            } else
                hoveringPoint.current = undefined
    }

    return (
        <>
            <canvas
                ref={canvasRef}
                className="border-4 border-blue-500 size-full"
                style={{ backgroundColor: chartBgColor }}
                width={canvasWidth}
                height={canvasHeight}
                onPointerOver={onPointerOver}
            />

            {xLabels && xLabelPositions &&
                xLabels.map((l, i) =>
                    <div key={i} className="absolute" style={{ left: xLabelPositions[i].x, top: xLabelPositions[i].y }}>
                        {l}
                    </div>
                )
            }

            {yLabels && yLabelPositions &&
                yLabels.map((l, i) =>
                    <div key={i} className="absolute" style={{ left: yLabelPositions[i].x, top: yLabelPositions[i].y }}>
                        {l}
                    </div>
                )
            }

            {hoverNode &&
                <DropdownMenu
                    open={hoveringPoint.current?.x !== undefined && hoveringPoint.current?.y !== undefined}
                    anchorDomRect={{
                        left: hoveringPoint.current?.x,
                        top: hoveringPoint.current?.y,
                        width: 0,
                        height: 0
                    }}
                >
                    {hoverNode}
                </DropdownMenu>
            }
        </>
    )
}

function createCircles(ctx: CanvasRenderingContext2D, points: Point[], radius: number, lineWidth?: number, strokeStyle?: string | CanvasGradient | CanvasPattern, fillStyle?: string | CanvasGradient | CanvasPattern, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number): Circle[] {
    return points.map(p => new Circle(p.x, p.y, radius, lineWidth, strokeStyle, fillStyle, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY))
}

function distribute(values: number[], range: number, mode: DistributionMode) {
    if (mode === 'absolute') {
        const valuesMax = values.reduce((p, c, i) => c > p ? c : p, values[0])
        const valuesMin = values.reduce((p, c, i) => c < p ? c : p, values[0])

        const valuesRange = valuesMax - valuesMin
        return values.map(v => ((v - valuesMin) / valuesRange) * range)
    }

    if (mode === 'even') {
        const eachValueWidth = range / (values.length - 1)
        return values.map((v, i) => i * eachValueWidth)
    }

    throw new Error('Invalid mode provided for distribute function in Chart component.')
}

function bezierCurve(ctx: CanvasRenderingContext2D, points: Point[], f = 0.3, t = 0.6) {
    ctx.moveTo(points[0].x, points[0].y);

    let m = 0, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0, preP = points[0]

    for (let i = 1; i < points.length; i++) {
        let curP = points[i], nexP = points[i + 1];
        if (nexP) {
            m = (nexP.y - preP.y) / (nexP.x - preP.x);
            dx2 = (nexP.x - curP.x) * -f;
            dy2 = dx2 * m * t;
        } else {
            dx2 = 0;
            dy2 = 0;
        }

        ctx.bezierCurveTo(
            preP.x - dx1, preP.y - dy1,
            curP.x + dx2, curP.y + dy2,
            curP.x, curP.y
        );

        dx1 = dx2;
        dy1 = dy2;
        preP = curP;
    }
}

function drawGraphFill(ctx: CanvasRenderingContext2D, points: Point[], canvasHeight: number, offset: number, styleOptions: StyleOptions, f = 0.5, t = 0.1) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    bezierCurve(ctx, points, f, t)
    ctx.lineTo(points[points.length - 1].x, canvasHeight - offset)
    ctx.lineTo(points[0].x, canvasHeight - offset)
    ctx.lineTo(points[0].x, points[0].y)

    ctx.fill()
}

function drawGraph(ctx: CanvasRenderingContext2D, points: Point[], bgColor: string, styleOptions: StyleOptions, f = 0.5, t = 0.1) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])
    ctx.strokeStyle = bgColor

    bezierCurve(ctx, points, f, t)

    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = styleOptions.strokeStyle ?? 'blue'

    bezierCurve(ctx, points, f, t)

    ctx.stroke()
}

function drawGridHorizontalLines(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: StyleOptions) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, canvasHeight - offset)
    ctx.lineTo(canvasWidth - offset, canvasHeight - offset)

    ctx.stroke()
}

function drawGridVerticalLines(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: StyleOptions) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, canvasHeight - offset)
    ctx.lineTo(offset, offset)

    ctx.stroke()
}

function drawXAxis(ctx: CanvasRenderingContext2D, count: number, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: StyleOptions) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(canvasWidth - offset, canvasHeight - offset)
    ctx.lineTo(canvasWidth - offset, offset)

    let width = canvasWidth - (2 * offset)
    let segments = count - 2 + 1
    for (let i = 0; i < segments; i++) {
        ctx.moveTo(offset + ((i + 1) * width / segments), canvasHeight - offset)
        ctx.lineTo(offset + ((i + 1) * width / segments), offset)
    }

    ctx.stroke()
}

function drawYAxis(ctx: CanvasRenderingContext2D, count: number, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: StyleOptions) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, offset)
    ctx.lineTo(canvasWidth - offset, offset)

    let height = canvasHeight - (2 * offset)
    let segments = count - 2 + 1
    for (let i = 0; i < segments; i++) {
        ctx.moveTo(offset, offset + ((i + 1) * height / segments))
        ctx.lineTo(canvasWidth - offset, offset + ((i + 1) * height / segments))
    }

    ctx.stroke()
}
