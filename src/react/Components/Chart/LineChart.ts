import { Bezier } from "bezier-js"
import { Point } from "../../Lib/Math"
import { ComponentProps, PointerEvent, ReactNode } from "react"
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
    xLabels: { value?: number, node?: ReactNode, options?: ComponentProps<'div'> }[] = []
    yLabels: { value?: number, node?: ReactNode, options?: ComponentProps<'div'> }[] = []
    xRange: [number | undefined, number | undefined]
    yRange: [number | undefined, number | undefined]
    private chartOptions?: ChartOptions
    hoverOptions: DrawOnHoverOptions
    fillOptions: DrawShapeOptions
    strokeOptions: DrawShapeOptions
    verticalLinesOptions: DrawShapeOptions
    horizontalLinesOptions: DrawShapeOptions
    calculateExtremes: boolean

    constructor(
        options: {
            calculateExtremes?: boolean,
            x: number[],
            y: number[],
            xLabels?: { value?: number, node?: ReactNode, options?: ComponentProps<'div'> }[],
            yLabels?: { value?: number, node?: ReactNode, options?: ComponentProps<'div'> }[],
            xRange?: [number | undefined, number | undefined],
            yRange?: [number | undefined, number | undefined],
            fillOptions?: DrawShapeOptions,
            strokeOptions?: DrawShapeOptions,
            hoverOptions?: DrawOnHoverOptions,
            verticalLinesOptions?: DrawShapeOptions,
            horizontalLinesOptions?: DrawShapeOptions,
            chartOptions?: ChartOptions,
            animationDuration?: number,
        }
    ) {
        super()

        if (options.chartOptions !== undefined) {
            this.setDistributedPoints(options.x, options.y, options.chartOptions.width!, options.chartOptions.height!, options.chartOptions.offset!)
            this.chartOptions = options.chartOptions
        }

        this.calculateExtremes = options.calculateExtremes ?? false
        this.rawX = [...options.x]
        this.rawY = [...options.y]
        this.xLabels = options.xLabels ?? []
        this.yLabels = options.yLabels ?? []
        this.xRange = [...(options.xRange ?? [undefined, undefined])]
        this.yRange = [...(options.yRange ?? [undefined, undefined])]
        this.fillOptions = options.fillOptions ?? {}
        this.strokeOptions = options.strokeOptions ?? {}
        this.hoverOptions = options.hoverOptions ?? {}
        this.verticalLinesOptions = options.verticalLinesOptions ?? {}
        this.horizontalLinesOptions = options.horizontalLinesOptions ?? {}

        this.setDefaults('stroke')
        this.setDefaults('fill')
        this.setDefaults('hover')

        this.animationsController.horizontalLines = this.horizontalLinesOptions.controller ?? 0
        this.animationsDuration.horizontalLines = this.horizontalLinesOptions.duration ?? 0

        this.animationsController.verticalLines = this.verticalLinesOptions.controller ?? 0
        this.animationsDuration.verticalLines = this.verticalLinesOptions.duration ?? 0

        this.animationsController.stroke = this.strokeOptions.controller ?? 0
        this.animationsDuration.stroke = this.strokeOptions.duration ?? 0

        this.animationsController.fill = this.fillOptions.controller ?? 0
        this.animationsDuration.fill = this.fillOptions.duration ?? 0

        this.animationsController.hover = this.hoverOptions.controller ?? 0
        this.animationsDuration.hover = this.hoverOptions.duration ?? 0
    }

    getChartOptions() {
        return this.chartOptions
    }

    setChartOptions(chartOptions: ChartOptions) {
        this.chartOptions = chartOptions
        this.setDistributedPoints(this.rawX, this.rawY, chartOptions.width!, chartOptions.height!, chartOptions.offset!)
    }

    private setDistributedPoints(x: number[], y: number[], width: number, height: number, offset: ChartOptions['offset']) {
        if (this.calculateExtremes) {
            let ps = this.calculateExtremePoints(x.map((m, i) => ({ x: m, y: y[i] })))
            x = ps.map(v => v.x)
            y = ps.map(v => v.y)
        }

        this.x = this.linearInterpolation(x, width, this.xRange).map(v => v + offset!.left)
        this.y = this.linearInterpolation(y, height, this.yRange)
            .map(v => height - v)
            .map(v => v + offset!.top)

        this.points = this.x.map((v, i) => ({ x: v, y: this.y[i] }))


        this.xLabels = this.linearInterpolation(this.xLabels.map((l, i) => l.value).filter(f => f !== undefined && f !== null), width, this.xRange)
            .map(v => v + offset!.left)
            .map((value, i) => ({ ...this.xLabels[i], value }))

        this.yLabels = this.linearInterpolation(this.yLabels.map((l, i) => l.value).filter(f => f !== undefined && f !== null), height, this.yRange)
            .map(v => height - v)
            .map(v => v + offset!.top)
            .map((value, i) => ({ ...this.yLabels[i], value }))
    }

    private linearInterpolation(values: number[], range: number, valuesRange?: [number | undefined, number | undefined]) {
        if (valuesRange === undefined || valuesRange[0] === undefined || valuesRange[1] === undefined) {
            let valuesMax = -Infinity, valuesMin = Infinity
            for (let i = 0; i < values.length; i++) {
                if (values[i] > valuesMax)
                    valuesMax = values[i]
                if (values[i] < valuesMin)
                    valuesMin = values[i]
            }
            valuesRange = [valuesMin, valuesMax]
        }

        return values.map(v => ((v - valuesRange[0]!) / (valuesRange[1]! - valuesRange[0]!)) * range)
    }

    private calculateExtremePoints(points: Point[]): Point[] {
        let extremePoints: Point[] = [points[0]]

        let previousDirection: 1 | 0 | -1 | undefined = undefined, direction: 1 | 0 | -1 | undefined = undefined
        for (let i = 1; i < points.length; i++) {
            // Invalid data
            if (points[i].x <= points[i - 1].x)
                throw new Error('invalid data provided to calculateExtremePoints method')

            if (points[i].y - points[i - 1].y > 0)
                direction = 1
            else if (points[i].y - points[i - 1].y < 0)
                direction = -1
            else
                direction = 0

            if (direction !== previousDirection || i === points.length - 1)
                extremePoints.push(points[i - 1])

            previousDirection = direction
        }

        return extremePoints
    }

    /**
     * @param ctx 
     * @param dx by default, 1
     * @returns 
     */
    stroke(ctx: CanvasRenderingContext2D, dx: number = 1) {
        if (this.strokeOptions.animateStyles)
            this.strokeOptions.styles = this.strokeOptions.animateStyles(ctx, this.points, this.strokeOptions.styles, this.chartOptions, dx)

        if (this.strokeOptions.animateDraw) {
            this.strokeOptions.animateDraw(ctx, this.points, this.strokeOptions.styles, this.chartOptions, dx)
            return
        }

        if (!this.strokeOptions.styles || Object.keys(this.strokeOptions.styles).length === 0)
            return

        Object.keys(this.strokeOptions.styles).forEach(k => ctx[k] = this.strokeOptions.styles![k])

        let drawPoints = this.bezierCurve(this.points, this.strokeOptions.duration ?? 0)

        ctx.beginPath()

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
            this.fillOptions.styles = this.fillOptions.animateStyles(ctx, this.points, this.fillOptions.styles, this.chartOptions, dx)

        if (this.fillOptions.animateDraw) {
            this.fillOptions.animateDraw(ctx, this.points, this.fillOptions.styles, this.chartOptions, dx)
            return
        }

        if (!this.fillOptions.styles || Object.keys(this.fillOptions.styles).length === 0)
            return

        ctx.beginPath()
        Object.keys(this.fillOptions.styles).forEach(k => ctx[k] = this.fillOptions.styles![k])

        let firstPoint: Point | undefined = undefined
        this.calculateControlPoints(this.points, (c, i) => {
            let curves = (new Bezier(...c).offset((this.strokeOptions.styles!.lineWidth ?? 0) / 2) as Bezier[])
            if (firstPoint === undefined) {
                firstPoint = curves[0].points[0]
                ctx.moveTo(firstPoint.x, firstPoint.y)
            }
            curves.forEach((b, j) => {
                // ctx.moveTo(firstPoint!.x, firstPoint!.y)
                ctx.bezierCurveTo(b.points[1].x, b.points[1].y, b.points[2].x, b.points[2].y, b.points[3].x, b.points[3].y)
                firstPoint = b.points[b.points.length - 1]
            })
        })

        ctx.stroke()

        ctx.lineTo(this.points[this.points.length - 1].x, this.chartOptions.height! + this.chartOptions.offset!.top)
        ctx.lineTo(this.points[0].x, this.chartOptions.height! + this.chartOptions.offset!.top)
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

    /**
     * @param ctx 
     * @param e 
     * @param dataPointIndex 
     * @param dx by default, 1
     * @returns 
     */
    strokeVerticalLines(ctx: CanvasRenderingContext2D, dx: number = 1) {
        if (this.verticalLinesOptions.animateStyles)
            this.verticalLinesOptions.styles = this.verticalLinesOptions.animateStyles(ctx, this.points, this.verticalLinesOptions.styles, this.chartOptions, dx)

        if (this.verticalLinesOptions.animateDraw)
            this.verticalLinesOptions.animateDraw(ctx, this.points, this.verticalLinesOptions.styles, this.chartOptions, dx)
    }

    /**
     * @param ctx 
     * @param e 
     * @param dataPointIndex 
     * @param dx by default, 1
     * @returns 
     */
    strokeHorizontalLines(ctx: CanvasRenderingContext2D, dx: number = 1) {
        if (this.horizontalLinesOptions.animateStyles)
            this.horizontalLinesOptions.styles = this.horizontalLinesOptions.animateStyles(ctx, this.points, this.horizontalLinesOptions.styles, this.chartOptions, dx)

        if (this.horizontalLinesOptions.animateDraw) {
            this.horizontalLinesOptions.animateDraw(ctx, this.points, this.horizontalLinesOptions.styles, this.chartOptions, dx)
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

    bezierCurve(dataPoints: Point[], animationDuration?: undefined, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Bezier[]
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

        if (animationDuration !== undefined)
            return curves.reduce<Point[]>((p, c, i) => p.concat(c.getLUT(c.length() * 4)), [])
        else
            return curves
    }

    private previousIndex: number | undefined = undefined
    animateDefaults(t: DOMHighResTimeStamp, ctx: CanvasRenderingContext2D, hoverEvent?: PointerEvent) {
        this.animate(t, 'verticalLines', (dx) => this.strokeVerticalLines(ctx, getEasingFunction(this.verticalLinesOptions.ease ?? 'easeInSine')(dx)))
        this.animate(t, 'horizontalLines', (dx) => this.strokeHorizontalLines(ctx, getEasingFunction(this.horizontalLinesOptions.ease ?? 'easeInSine')(dx)))
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

