import { Bezier } from "bezier-js"
import { Point } from "../../Lib/Math"
import { PointerEvent, ReactNode } from "react"
import { ChartOptions, DrawOnHoverOptions, DrawShapeOptions } from "./index.d"
import { Circle } from "../Base/Canvas/Shapes/Circle"
import { getEasingFunction } from "../Animations/easings"
import { Shape } from "./Shape"

function createCircles(ctx: CanvasRenderingContext2D, points: Point[], radius: number, lineWidth?: number, strokeStyle?: string | CanvasGradient | CanvasPattern, fillStyle?: string | CanvasGradient | CanvasPattern, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number): Circle[] {
    return points.map(p => new Circle(p.x, p.y, radius, lineWidth, strokeStyle, fillStyle, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY))
}

export class LineChart extends Shape {
    rawX: number[]
    rawY: number[]
    x: number[]
    y: number[]
    points: Point[]
    private xLabels?: ReactNode[]
    private yLabels?: ReactNode[]
    private chartOptions?: ChartOptions
    hoverOptions: DrawOnHoverOptions
    fillOptions: DrawShapeOptions
    strokeOptions: DrawShapeOptions

    constructor(
        options: {
            x: number[],
            y: number[],
            fillOptions: DrawShapeOptions,
            strokeOptions: DrawShapeOptions,
            hoverOptions: DrawOnHoverOptions,
            xLabels?: ReactNode[],
            yLabels?: ReactNode[],
            chartOptions?: ChartOptions,
            animationDuration?: number,
        }
    ) {
        super()

        if (options.chartOptions !== undefined) {
            this.setDistributedPoints(options.x, options.y, options.chartOptions.width!, options.chartOptions.height!, options.chartOptions.offset!)
            this.chartOptions = options.chartOptions
        }

        this.rawX = [...options.x]
        this.rawY = [...options.y]
        this.xLabels = options.xLabels
        this.yLabels = options.yLabels
        this.fillOptions = options.fillOptions
        this.strokeOptions = options.strokeOptions
        this.hoverOptions = options.hoverOptions

        this.setDefaults('stroke')
        this.setDefaults('fill')
        this.setDefaults('hover')

        this.animationsController.stroke = this.strokeOptions.controller ?? 0
        this.animationsDuration.stroke = this.strokeOptions.duration ?? 0

        this.animationsController.fill = this.strokeOptions.controller ?? 0
        this.animationsDuration.fill = this.strokeOptions.duration ?? 0

        this.animationsController.hover = this.strokeOptions.controller ?? 0
        this.animationsDuration.hover = this.strokeOptions.duration ?? 0
    }

    getChartOptions() {
        return this.chartOptions
    }

    setChartOptions(chartOptions: ChartOptions) {
        this.chartOptions = chartOptions
        this.setDistributedPoints(this.rawX, this.rawY, chartOptions.width!, chartOptions.height!, chartOptions.offset!)
    }

    private setDistributedPoints(x: number[], y: number[], width: number, height: number, offset: number) {
        this.x = this.distribute(x, width - 2 * offset).map(v => v + offset)
        this.y = this.distribute(y, height - 2 * offset)
            .map(v => height - (offset * 2) - v)
            .map(v => v + offset)

        this.points = this.x.map((v, i) => ({ x: v, y: this.y[i] }))
    }

    private distribute(values: number[], range: number) {
        const valuesMax = values.reduce((p, c, i) => c > p ? c : p, values[0])
        const valuesMin = values.reduce((p, c, i) => c < p ? c : p, values[0])

        const valuesRange = valuesMax - valuesMin
        return values.map(v => ((v - valuesMin) / valuesRange) * range)
    }

    /**
     * @param ctx 
     * @param dx by default, 1
     * @returns 
     */
    stroke(ctx: CanvasRenderingContext2D, dx: number = 1) {
        if (this.strokeOptions.animateStyles)
            this.strokeOptions.animateStyles(ctx, this.points, this.strokeOptions.styles, this.chartOptions, dx)

        if (this.strokeOptions.animateDraw) {
            this.strokeOptions.animateDraw(ctx, this.points, this.strokeOptions.styles, this.chartOptions, dx)
            return
        }

        if (!this.strokeOptions.styles || Object.keys(this.strokeOptions.styles).length === 0)
            return

        let drawPoints = this.bezierCurve(this.points, this.strokeOptions.duration ?? 0)

        ctx.beginPath()
        Object.keys(this.strokeOptions.styles).forEach(k => ctx[k] = this.strokeOptions.styles![k])

        ctx.moveTo(drawPoints[0].x, drawPoints[0].y)
        let count = drawPoints.length * dx
        for (let i = 1; i < count; i++)
            if (drawPoints[i] || drawPoints[i]?.x || drawPoints[i]?.y)
                ctx.lineTo(drawPoints[i].x, drawPoints[i].y)

        ctx.stroke()
    }

    /**
     * @param ctx 
     * @param dx by default, 1
     * @returns 
     */
    fill(ctx: CanvasRenderingContext2D, dx: number = 1) {
        if (!this.chartOptions)
            return

        if (this.fillOptions.animateStyles)
            this.fillOptions.animateStyles(ctx, this.points, this.fillOptions.styles, this.chartOptions, dx)

        if (this.fillOptions.animateDraw) {
            this.fillOptions.animateDraw(ctx, this.points, this.fillOptions.styles, this.chartOptions, dx)
            return
        }

        if (!this.fillOptions.styles || Object.keys(this.fillOptions.styles).length === 0)
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

        ctx.lineTo(this.points[this.points.length - 1].x, this.chartOptions.height! - this.chartOptions.offset!)
        ctx.lineTo(this.points[0].x, this.chartOptions.height! - this.chartOptions.offset!)
        ctx.lineTo(this.points[0].x, this.points[0].y)

        ctx.fill()
    }

    /**
     * @param ctx 
     * @param e 
     * @param dataPointIndex 
     * @param dx by default, 1
     * @returns 
     */
    onHover(ctx: CanvasRenderingContext2D, e: PointerEvent, dataPointIndex: number, dx: number = 1) {
        if (this.hoverOptions.animate && this.chartOptions) {
            this.hoverOptions.animate(ctx, e, this.points, dataPointIndex, this.chartOptions, this.hoverOptions, dx)
            return
        }
    }

    findHoveringDataPoint(p: Point): number | undefined {
        if (this.hoverOptions.hoverRadius === undefined)
            return undefined

        let r = this.hoverOptions.hoverRadius!

        for (let i = 0; i < this.points.length; i++)
            if (
                p.x <= this.points[i].x + r &&
                p.x >= this.points[i].x - r &&
                p.y <= this.points[i].y + r &&
                p.y >= this.points[i].y - r
            )
                return i

        return undefined
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

    private previousIndex: number | undefined = undefined
    animateDefaults(t: DOMHighResTimeStamp, ctx: CanvasRenderingContext2D, hoverEvent?: PointerEvent) {
        this.animate(t, 'stroke', (dx) => this.stroke(ctx, getEasingFunction(this.strokeOptions.ease ?? 'easeInSine')(dx)))
        this.animate(t, 'fill', (dx) => this.fill(ctx, getEasingFunction(this.fillOptions.ease ?? 'easeInSine')(dx)))
        this.animate(t, 'hover', (dx) => {
            if (!hoverEvent)
                return

            let index = this.findHoveringDataPoint({ x: hoverEvent.nativeEvent.offsetX, y: hoverEvent.nativeEvent.offsetY })

            if (this.previousIndex === undefined && index !== undefined) {
                this.resetAnimation('hover')
                dx = 0
            }

            this.previousIndex = index

            if (index === undefined)
                return

            this.onHover(ctx, hoverEvent!, index, getEasingFunction(this.hoverOptions.ease ?? 'easeInSine')(dx))
        })
    }
}

