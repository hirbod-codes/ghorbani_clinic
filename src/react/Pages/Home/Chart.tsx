import { ReactNode, useContext, useEffect, useRef, useState } from "react"
import { Point } from "../../Lib/Math"
import { Circle } from "../../Components/Base/Canvas/Shapes/Circle"
import { DropdownMenu } from "../../Components/Base/DropdownMenu"
import { EasingName, getEasingFunction } from "../../Components/Animations/easings"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { Bezier } from "bezier-js";

export type DistributionMode = 'absolute' | 'even'

export type ChartOptions = {
    bgColor?: string
    width: number
    height: number
    offset: number
    xAxisOffset: number
    yAxisOffset: number
    hoverNode?: ReactNode
    hoverRadius?: number
}

export type CanvasStyleOptions = {
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

export type DrawOptions = {
    ease?: EasingName
    animateStyles?: (ctx: CanvasRenderingContext2D, points: Point[], styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => CanvasStyleOptions
    styles?: CanvasStyleOptions
    animateDraw?: (ctx: CanvasRenderingContext2D, points: Point[], styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => void
}

class Shape {
    private points: Point[]
    private xLabels?: ReactNode[]
    private yLabels?: ReactNode[]
    private chartOptions: ChartOptions
    private animationDuration?: number
    private fillOptions: DrawOptions
    private strokeOptions: DrawOptions
    private animationHandleId: number
    private stop = false

    constructor(
        x: number[],
        y: number[],
        fillOptions: DrawOptions,
        strokeOptions: DrawOptions,
        xLabels?: ReactNode[],
        yLabels?: ReactNode[],
        chartOptions?: ChartOptions,
        animationDuration?: number,
    ) {
        if (!chartOptions)
            chartOptions = {
                width: 800,
                height: 400,
                offset: 30,
                xAxisOffset: 15,
                yAxisOffset: 15,
                hoverRadius: 20,
            }

        let xs = this.distribute(x, chartOptions.width - 2 * chartOptions.offset).map(v => v + chartOptions.offset).map(v => ({ x: v }))
        let ys = this.distribute(y, chartOptions.width - 2 * chartOptions.offset)
            .map(v => chartOptions.height - (chartOptions.offset * 2) - v)
            .map(v => v + chartOptions.offset).map(v => ({ y: v }))

        this.points = xs.map((v, i) => ({ x: v.x, y: ys[i].y }))
        this.xLabels = xLabels
        this.yLabels = yLabels
        this.chartOptions = chartOptions
        this.animationDuration = animationDuration
        this.fillOptions = fillOptions
        this.strokeOptions = strokeOptions
    }

    setChartOptions(chartOptions: ChartOptions) {
        this.chartOptions = chartOptions
    }

    play(ctx: CanvasRenderingContext2D) {
        this.stop = false
        this.animationHandleId = requestAnimationFrame(t => this.animate(ctx, t))
    }

    pause() {
        this.stop = true
    }

    animate(ctx: CanvasRenderingContext2D, t: DOMHighResTimeStamp) {
        this.animateStroke(ctx, t)
        this.animateFill(ctx, t)

        if (this.stop && this.animationHandleId)
            cancelAnimationFrame(this.animationHandleId)
        else
            requestAnimationFrame(t => this.animate(ctx, t))
    }

    stroke(ctx: CanvasRenderingContext2D) {
        return this.animateStroke(ctx, 1)
    }

    animateStroke(ctx: CanvasRenderingContext2D, t: DOMHighResTimeStamp) {
        if (this.strokeOptions.animateStyles)
            this.strokeOptions.animateStyles(ctx, this.points, this.strokeOptions.styles, this.chartOptions, t)

        if (this.strokeOptions.animateDraw) {
            this.strokeOptions.animateDraw(ctx, this.points, this.strokeOptions.styles, this.chartOptions, t)
            return
        }

        if (!this.animationDuration || !this.strokeOptions.styles || Object.keys(this.strokeOptions.styles).length === 0)
            return

        let drawPoints = this.bezierCurve(this.points, this.animationDuration)

        ctx.beginPath()
        Object.keys(this.strokeOptions.styles).forEach(k => ctx[k] = this.strokeOptions.styles![k])

        ctx.beginPath()
        ctx.strokeStyle = this.strokeOptions.styles.strokeStyle ?? 'blue'

        ctx.moveTo(drawPoints[0].x, drawPoints[0].y)
        for (let i = 1; i < drawPoints.length * t; i++)
            ctx.lineTo(drawPoints[i].x, drawPoints[i].y)

        ctx.stroke()
    }

    fill(ctx: CanvasRenderingContext2D) {
        return this.animateFill(ctx, 1)
    }

    animateFill(ctx: CanvasRenderingContext2D, t: DOMHighResTimeStamp) {
        if (this.fillOptions.animateStyles)
            this.fillOptions.animateStyles(ctx, this.points, this.fillOptions.styles, this.chartOptions, t)

        if (this.fillOptions.animateDraw) {
            this.fillOptions.animateDraw(ctx, this.points, this.fillOptions.styles, this.chartOptions, t)
            return
        }

        if (!this.animationDuration || !this.fillOptions.styles || Object.keys(this.fillOptions.styles).length === 0)
            return

        ctx.beginPath()
        Object.keys(this.fillOptions.styles).forEach(k => ctx[k] = this.fillOptions.styles![k])

        ctx.moveTo(this.points[0].x, this.points[0].y + (this.fillOptions.styles.lineWidth ?? 0))

        this.calculateControlPoints(this.points, (c, i) => {
            (new Bezier(...c).offset(this.fillOptions.styles!.lineWidth ?? 0) as Bezier[])
                .forEach(b => {
                    ctx.bezierCurveTo(b.points[1].x, b.points[1].y, b.points[2].x, b.points[2].y, b.points[3].x, b.points[3].y)
                })
        })

        ctx.stroke()

        ctx.lineTo(this.points[this.points.length - 1].x, this.chartOptions.height - this.chartOptions.offset)
        ctx.lineTo(this.points[0].x, this.chartOptions.height - this.chartOptions.offset)
        ctx.lineTo(this.points[0].x, this.points[0].y)

        ctx.fill()
    }

    distribute(values: number[], range: number) {
        const valuesMax = values.reduce((p, c, i) => c > p ? c : p, values[0])
        const valuesMin = values.reduce((p, c, i) => c < p ? c : p, values[0])

        const valuesRange = valuesMax - valuesMin
        return values.map(v => ((v - valuesMin) / valuesRange) * range)
    }

    calculateControlPoints(dataPoints: Point[], loopCallback?: (controls: [Point, Point, Point, Point], index: number) => any): [Point, Point, Point, Point][] {
        let points: [Point, Point, Point, Point][] = []
        for (let i = 0; i <= dataPoints.length - 2; i++) {
            let p = dataPoints[i]
            let np = dataPoints[i + 1]
            let cp1 = { x: p.x + ((np.x - p.x) / 2), y: p.y }
            let cp2 = { x: np.x - ((np.x - p.x) / 2), y: np.y }

            points.push([p, cp1, cp2, np])

            if (loopCallback)
                loopCallback([p, cp1, cp2, np], i)
        }

        return points

    }

    bezierCurve(dataPoints: Point[], animationDuration: undefined, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Bezier[]
    bezierCurve(dataPoints: Point[], animationDuration: number, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Point[]
    bezierCurve(dataPoints: Point[], animationDuration?: number, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Point[] | Bezier[] {
        let length: number = 0
        let curves: Bezier[] = []

        this.calculateControlPoints(dataPoints, (c, i) => {
            let curve = new Bezier(...c)
            length += curve.length()
            curves.push(curve)

            if (drawLine)
                drawLine(curve, c, i)
        })

        if (animationDuration !== undefined) {
            let pointCount = animationDuration * 0.06 // FPS
            return curves.reduce<Point[]>((p, c) => p.concat(c.getLUT((c.length() / length) * pointCount)), [])
        } else
            return curves
    }
}

export type ChartProps = {
    chartOptions?: ChartOptions
    shapes?: Shape[]
    // chartBgColor: string
    // canvasWidth?: number
    // canvasHeight?: number
    // chartOffset?: number
    // xAxisOffset?: number
    // yAxisOffset?: number
    // hoverNode?: ReactNode
    // hoverRadius?: number
    // x: number[]
    // y: number[]
    // xLabels?: ReactNode[]
    // yLabels?: ReactNode[]
    // points?: Point[]
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
    // chartBgColor,
    // canvasWidth = 800,
    // canvasHeight = 400,
    // chartOffset = 30,
    // xAxisOffset = 15,
    // yAxisOffset = 15,
    // hoverNode,
    // hoverRadius = 20,
    // x,
    // y,
    // xLabels,
    // yLabels,
    // points: inputPoints,
    // graphFill = {},
    // graph = {},
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
    const xLabelPositions = useRef<Point[]>()
    const yLabelPositions = useRef<Point[]>()

    const hoverHelpers = useRef<Circle[]>()
    const hoveringPoint = useRef<Point>()

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

        // ctx.beginPath()
        // ctx.strokeStyle = 'transparent'
        // ctx.fillStyle = 'transparent'
        // ctx.rect(chartOffset - 1, chartOffset - 1, canvasWidth - 2 * chartOffset + 2, canvasHeight - 2 * chartOffset + 2)
        // ctx.stroke()
        // ctx.clip()

        // let graphFillFraction = getEasingFunction(graphFill.ease ?? 'easeInSine')(dx)
        // getEasingFunction(graphFill.ease ?? 'easeInSine')(dx)
        // graphFill.styles = {
        //     fillStyle: 'transparent',
        //     strokeStyle: 'transparent',
        //     lineWidth: 20,
        //     lineCap: 'butt',
        //     ...graphFill?.animateStyles ? graphFill.animateStyles(ctx, points, { ...graphFill.styles }, graphFillFraction) : graphFill?.styles
        // }
        // graphFill?.animateDraw
        //     ? graphFill.animateDraw(
        //         ctx,
        //         points,
        //         graphFill.styles,
        //         graphFillFraction
        //     )
        //     : drawGraphFill(
        //         ctx,
        //         points,
        //         canvasHeight,
        //         chartOffset,
        //         graphFill.styles,
        //         graphFillFraction,
        //         animationDuration
        //     )

        // let graphFraction = getEasingFunction(graph?.ease ?? 'easeOutExpo')(dx)
        // if (!graph)
        //     graph = {}
        // graph.styles = {
        //     strokeStyle: themeOptions.colors.surface[themeOptions.mode].foreground,
        //     lineWidth: 20,
        //     lineCap: 'round',
        //     ...graph?.animateStyles ? graph.animateStyles(ctx, points, { ...graph.styles }, graphFraction) : graph?.styles
        // }
        // graph?.animateDraw
        //     ? graph.animateDraw(
        //         ctx,
        //         points,
        //         graph.styles,
        //         graphFraction
        //     )
        //     : drawGraph(
        //         ctx,
        //         points,
        //         graph.styles,
        //         graphFraction,
        //         animationDuration
        //     )

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

        hoverHelpers.current = createCircles(ctx, points, chartOptions.hoverRadius ?? 5, 0, 'transparent', 'transparent')

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

            canvasRef.current.style.width = rect.width + "px";
            canvasRef.current.style.height = rect.height + "px";

            let scale = window.devicePixelRatio
            canvasRef.current.width = rect.width * scale
            canvasRef.current.height = rect.height * scale
            ctx.current.scale(scale, scale);

            animationId.current = requestAnimationFrame((t) => animate(ctx.current!, points.current!, canvasWidth.current!, canvasHeight.current!, t))

            shapes.forEach(s => {
                s.setChartOptions({ ...chartOptions, width: rect.width, height: rect.height })
                s.play(ctx.current!)
            })
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

            {/* {xLabels && xLabelPositions &&
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
            } */}
        </div>
    )
}

function createCircles(ctx: CanvasRenderingContext2D, points: Point[], radius: number, lineWidth?: number, strokeStyle?: string | CanvasGradient | CanvasPattern, fillStyle?: string | CanvasGradient | CanvasPattern, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number): Circle[] {
    return points.map(p => new Circle(p.x, p.y, radius, lineWidth, strokeStyle, fillStyle, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY))
}

function distribute(values: number[], range: number) {
    const valuesMax = values.reduce((p, c, i) => c > p ? c : p, values[0])
    const valuesMin = values.reduce((p, c, i) => c < p ? c : p, values[0])

    const valuesRange = valuesMax - valuesMin
    return values.map(v => ((v - valuesMin) / valuesRange) * range)
}

// function calculateControlPoints(dataPoints: Point[], loopCallback?: (controls: [Point, Point, Point, Point], index: number) => any): [Point, Point, Point, Point][] {
//     let points: [Point, Point, Point, Point][] = []
//     for (let i = 0; i <= dataPoints.length - 2; i++) {
//         let p = dataPoints[i]
//         let np = dataPoints[i + 1]
//         let cp1 = { x: p.x + ((np.x - p.x) / 2), y: p.y }
//         let cp2 = { x: np.x - ((np.x - p.x) / 2), y: np.y }

//         points.push([p, cp1, cp2, np])

//         if (loopCallback)
//             loopCallback([p, cp1, cp2, np], i)
//     }

//     return points

// }

// function bezierCurve(ctx: CanvasRenderingContext2D, dataPoints: Point[], animationDuration: undefined, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Bezier[]
// function bezierCurve(ctx: CanvasRenderingContext2D, dataPoints: Point[], animationDuration: number, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Point[]
// function bezierCurve(ctx: CanvasRenderingContext2D, dataPoints: Point[], animationDuration?: number, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Point[] | Bezier[] {
//     let length: number = 0
//     let curves: Bezier[] = []

//     calculateControlPoints(dataPoints, (c, i) => {
//         let curve = new Bezier(...c)
//         length += curve.length()
//         curves.push(curve)

//         if (drawLine)
//             drawLine(curve, c, i)
//     })

//     if (animationDuration !== undefined) {
//         let pointCount = animationDuration * 0.06 // FPS
//         return curves.reduce<Point[]>((p, c) => p.concat(c.getLUT((c.length() / length) * pointCount)), [])
//     } else
//         return curves
// }

// function drawGraphFill(ctx: CanvasRenderingContext2D, points: Point[], canvasHeight: number, offset: number, styleOptions: StyleOptions, fraction: number, animationDuration: number) {
//     ctx.beginPath()
//     Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

//     ctx.moveTo(points[0].x, points[0].y + (styleOptions.lineWidth ?? 0))

//     calculateControlPoints(points, (c, i) => {
//         (new Bezier(...c).offset(styleOptions.lineWidth ?? 0) as Bezier[])
//             .forEach(b => {
//                 ctx.bezierCurveTo(b.points[1].x, b.points[1].y, b.points[2].x, b.points[2].y, b.points[3].x, b.points[3].y)
//             })
//     })

//     ctx.stroke()

//     ctx.lineTo(points[points.length - 1].x, canvasHeight - offset)
//     ctx.lineTo(points[0].x, canvasHeight - offset)
//     ctx.lineTo(points[0].x, points[0].y)

//     ctx.fill()
// }

// function drawGraph(ctx: CanvasRenderingContext2D, points: Point[], styleOptions: StyleOptions, fraction: number, animationDuration: number) {
//     let drawPoints = bezierCurve(ctx, points, animationDuration)

//     ctx.beginPath()
//     Object.keys(styleOptions).forEach(k => ctx[k] = styleOptions[k])

//     ctx.beginPath()
//     ctx.strokeStyle = styleOptions.strokeStyle ?? 'blue'

//     ctx.moveTo(drawPoints[0].x, drawPoints[0].y)
//     for (let i = 1; i < drawPoints.length * fraction; i++)
//         ctx.lineTo(drawPoints[i].x, drawPoints[i].y)

//     ctx.stroke()
// }

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
