import { ReactNode, useContext, useEffect, useRef, useState } from "react"
import { Point } from "../../Lib/Math"
import { Circle } from "../../Components/Base/Canvas/Shapes/Circle"
import { DropdownMenu } from "../../Components/Base/DropdownMenu"
import { EasingName, getEasingFunction } from "../../Components/Animations/easings"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"

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
    draw?: (ctx: CanvasRenderingContext2D, points: Point[], styleOptions: StyleOptions, fraction: number) => void
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
    gridHorizontalLines?: ShapeProps & { count?: number }
    gridVerticalLines?: ShapeProps & { count?: number }
    xAxis?: ShapeProps
    yAxis?: ShapeProps
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
    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    const isDrawn = useRef<boolean>(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const ctx = useRef<CanvasRenderingContext2D>()

    const points = useRef<Point[]>()
    const xLabelPositions = useRef<Point[]>()
    const yLabelPositions = useRef<Point[]>()

    const hoverHelpers = useRef<Circle[]>()
    const hoveringPoint = useRef<Point>()

    const animationId = useRef<number>()

    if (!graph)
        graph = {}
    graph.draw = (ctx, points, styles, f) => {
        let drawPoints = bezierCurve(ctx, points)

        ctx.beginPath()
        Object.keys(styles).forEach(k => ctx[k] = styles[k])
        ctx.strokeStyle = chartBgColor

        ctx.moveTo(drawPoints[0].x, drawPoints[0].y)
        for (let i = 0; i < drawPoints.length * f; i++)
            ctx.lineTo(drawPoints[i].x, drawPoints[i].y)

        ctx.stroke()

        ctx.beginPath()
        ctx.strokeStyle = styles.strokeStyle ?? 'blue'

        ctx.moveTo(drawPoints[0].x, drawPoints[0].y)
        for (let i = 0; i < drawPoints.length * f; i++)
            ctx.lineTo(drawPoints[i].x, drawPoints[i].y)


        ctx.stroke()
    }

    let oldT = 0
    let passed = 0

    let duration = 5000

    const animate = (ctx: CanvasRenderingContext2D, points: Point[], t: DOMHighResTimeStamp) => {
        if (oldT === 0)
            oldT = t
        passed = t - oldT
        let dx = (passed % duration) / duration

        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        // xAxis?.draw
        //     ? xAxis.draw(
        //         ctx,
        //         points,
        //         {
        //             strokeStyle: themeOptions.colors.surface[themeOptions.mode].foreground,
        //             lineWidth: 2,
        //             ...xAxis?.animateStyles ? xAxis.animateStyles(ctx, points, { ...xAxis.styles }, getEasingFunction(xAxis.ease ?? 'easeInSine')(dx)) : xAxis?.styles
        //         },
        //         getEasingFunction(xAxis.ease ?? 'easeInSine')(dx)
        //     )
        //     : 
        drawXAxis(
            ctx,
            canvasWidth,
            canvasHeight,
            chartOffset,
            {
                strokeStyle: themeOptions.colors.surface[themeOptions.mode].foreground,
                lineWidth: 2,
                ...xAxis?.animateStyles ? xAxis.animateStyles(ctx, points, { ...xAxis.styles }, getEasingFunction(xAxis.ease ?? 'easeInSine')(dx)) : xAxis?.styles
            },
        )

        drawYAxis(
            ctx,
            canvasWidth,
            canvasHeight,
            chartOffset,
            {
                strokeStyle: themeOptions.colors.surface[themeOptions.mode].foreground,
                lineWidth: 2,
                ...yAxis?.animateStyles ? yAxis.animateStyles(ctx, points, { ...yAxis.styles }, getEasingFunction(yAxis.ease ?? 'easeInSine')(dx)) : yAxis?.styles
            },
        )

        drawGridHorizontalLines(
            ctx,
            gridHorizontalLines?.count ?? x.length,
            canvasWidth,
            canvasHeight,
            chartOffset,
            {
                strokeStyle: themeOptions.colors.outline[themeOptions.mode].main,
                lineWidth: 0.5,
                ...gridHorizontalLines?.animateStyles ? gridHorizontalLines.animateStyles(ctx, points, { ...gridHorizontalLines.styles }, getEasingFunction(gridHorizontalLines.ease ?? 'easeInSine')(dx)) : gridHorizontalLines?.styles
            },
        )

        drawGridVerticalLines(
            ctx,
            gridVerticalLines?.count ?? x.length,
            canvasWidth,
            canvasHeight,
            chartOffset,
            {
                strokeStyle: themeOptions.colors.outline[themeOptions.mode].main,
                lineWidth: 0.5,
                ...gridVerticalLines?.animateStyles ? gridVerticalLines.animateStyles(ctx, points, { ...gridVerticalLines.styles }, getEasingFunction(gridVerticalLines.ease ?? 'easeInSine')(dx)) : gridVerticalLines?.styles
            },
        )

        drawGraphFill(
            ctx,
            points,
            canvasHeight,
            chartOffset,
            {
                fillStyle: 'transparent',
                ...graphFill?.animateStyles ? graphFill.animateStyles(ctx, points, { ...graphFill.styles }, getEasingFunction(graphFill.ease ?? 'easeInSine')(dx)) : graphFill?.styles
            },
            graph?.f,
            graph?.tension
        )

        graph?.draw
            ? graph.draw(
                ctx,
                points,
                {
                    strokeStyle: themeOptions.colors.surface[themeOptions.mode].foreground,
                    lineWidth: 4,
                    lineCap: 'round',
                    ...graph?.animateStyles ? graph.animateStyles(ctx, points, { ...graph.styles }, getEasingFunction(graph.ease ?? 'easeOutExpo')(dx)) : graph?.styles
                },
                getEasingFunction(graph.ease ?? 'easeOutExpo')(dx)
            )
            : drawGraph(
                ctx,
                points,
                chartBgColor,
                {
                    strokeStyle: themeOptions.colors.surface[themeOptions.mode].foreground,
                    lineWidth: 4,
                    lineCap: 'round',
                    ...graph?.animateStyles ? graph.animateStyles(ctx, points, { ...graph.styles }, getEasingFunction(graph.ease ?? 'easeOutExpo')(dx)) : graph?.styles
                },
                graph?.f,
                graph?.tension
            )

        hoverHelpers.current = createCircles(ctx, points, hoverRadius, 0, 'transparent', 'transparent')

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

function bezierCurve(ctx: CanvasRenderingContext2D, points: Point[], drawLine?: (from: Point, to: Point) => void, f = 0.3, t = 0.6): Point[] {
    // ctx.moveTo(points[0].x, points[0].y);

    let m = 0, dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0, preP = points[0]

    let drawnPoints = [points[0]]

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

        let ttt = drawCurve([
            preP,
            { x: preP.x - dx1, y: preP.y - dy1 },
            { x: curP.x + dx2, y: curP.y + dy2 },
            { x: curP.x, y: curP.y }
        ], drawLine)

        drawnPoints = drawnPoints.concat(ttt)

        // ctx.bezierCurveTo(
        //     preP.x - dx1, preP.y - dy1,
        //     curP.x + dx2, curP.y + dy2,
        //     curP.x, curP.y
        // )

        dx1 = dx2;
        dy1 = dy2;
        preP = curP;
    }

    return drawnPoints
}

function drawCurve(curve: [Point, Point, Point, Point], drawLine?: (from: Point, to: Point) => void): Point[] {
    let prev = calcBezierAtT(curve, 0)
    let points = [prev]
    for (let t = 0; t <= 1.0; t += 0.01) {
        const curr = calcBezierAtT(curve, t)

        if (drawLine)
            drawLine(prev, curr)

        prev = curr
        points.push(curr)
    }

    return points
}

function calcBezierAtT(p, t) {
    const x = (1 - t) * (1 - t) * (1 - t) * p[0].x
        + 3 * (1 - t) * (1 - t) * t * p[1].x
        + 3 * (1 - t) * t * t * p[2].x
        + t * t * t * p[3].x;
    const y = (1 - t) * (1 - t) * (1 - t) * p[0].y
        + 3 * (1 - t) * (1 - t) * t * p[1].y
        + 3 * (1 - t) * t * t * p[2].y
        + t * t * t * p[3].y;
    return { x, y }
}

function drawGraphFill(ctx: CanvasRenderingContext2D, points: Point[], canvasHeight: number, offset: number, styleOptions: StyleOptions, f = 0.5, t = 0.1) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    bezierCurve(ctx, points, undefined, f, t)
    ctx.lineTo(points[points.length - 1].x, canvasHeight - offset)
    ctx.lineTo(points[0].x, canvasHeight - offset)
    ctx.lineTo(points[0].x, points[0].y)

    ctx.fill()
}

function drawGraph(ctx: CanvasRenderingContext2D, points: Point[], bgColor: string, styleOptions: StyleOptions, f = 0.5, t = 0.1) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])
    ctx.strokeStyle = bgColor

    bezierCurve(ctx, points, undefined, f, t)

    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = styleOptions.strokeStyle ?? 'blue'

    bezierCurve(ctx, points, undefined, f, t)

    ctx.stroke()
}

function drawXAxis(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: StyleOptions) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, canvasHeight - offset)
    ctx.lineTo(canvasWidth - offset, canvasHeight - offset)

    ctx.stroke()
}

function drawYAxis(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: StyleOptions) {
    ctx.beginPath()
    Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

    ctx.moveTo(offset, canvasHeight - offset)
    ctx.lineTo(offset, offset)

    ctx.stroke()
}

function drawGridHorizontalLines(ctx: CanvasRenderingContext2D, count: number, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: StyleOptions) {
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

function drawGridVerticalLines(ctx: CanvasRenderingContext2D, count: number, canvasWidth: number, canvasHeight: number, offset: number, styleOptions: StyleOptions) {
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
