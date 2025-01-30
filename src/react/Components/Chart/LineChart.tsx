import { Bezier } from "bezier-js"
import { Point } from "../../Lib/Math"
import { PointerEvent, ReactNode } from "react"
import { ChartOptions, DrawOnHoverOptions, DrawShapeOptions } from "./index.d"
import { Circle } from "../Base/Canvas/Shapes/Circle"
import { getEasingFunction } from "../Animations/easings"

function createCircles(ctx: CanvasRenderingContext2D, points: Point[], radius: number, lineWidth?: number, strokeStyle?: string | CanvasGradient | CanvasPattern, fillStyle?: string | CanvasGradient | CanvasPattern, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number): Circle[] {
    return points.map(p => new Circle(p.x, p.y, radius, lineWidth, strokeStyle, fillStyle, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY))
}

export class LineChart {
    rawX: number[]
    rawY: number[]
    x: number[]
    y: number[]
    points: Point[]
    private xLabels?: ReactNode[]
    private yLabels?: ReactNode[]
    private chartOptions: ChartOptions
    hoverOptions: DrawOnHoverOptions
    fillOptions: DrawShapeOptions
    strokeOptions: DrawShapeOptions

    private onHoverCallback?: (ctx: CanvasRenderingContext2D, e: PointerEvent, dataPoints: Point[], dataPointIndex: number, chartOptions: ChartOptions, hoverOptions: DrawShapeOptions, t?: DOMHighResTimeStamp) => void

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
            onHover?: (ctx: CanvasRenderingContext2D, e: PointerEvent, dataPoints: Point[], dataPointIndex: number, chartOptions: ChartOptions, hoverOptions: DrawShapeOptions, t?: DOMHighResTimeStamp) => void
        }
    ) {
        if (!options.chartOptions)
            options.chartOptions = {
                width: 800,
                height: 400,
                offset: 30,
                xAxisOffset: 15,
                yAxisOffset: 15,
            }

        this.rawX = [...options.x]
        this.rawY = [...options.y]
        this.setDistributedPoints(options.x, options.y, options.chartOptions.width!, options.chartOptions.height!, options.chartOptions.offset!)
        this.xLabels = options.xLabels
        this.yLabels = options.yLabels
        this.chartOptions = options.chartOptions
        this.fillOptions = options.fillOptions
        this.strokeOptions = options.strokeOptions
        this.hoverOptions = options.hoverOptions
        this.onHoverCallback = options.onHover

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

    setChartOptions(chartOptions: ChartOptions) {
        this.chartOptions = chartOptions
        this.setDistributedPoints(this.rawX, this.rawY, chartOptions.width!, chartOptions.height!, chartOptions.offset!)
    }

    getChartOptions() {
        return this.chartOptions
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
     * 
     * @param ctx 
     * @param e 
     * @param dataPointIndex 
     * @param dx by default, 1
     * @returns 
     */
    onHover(ctx: CanvasRenderingContext2D, e: PointerEvent, dataPointIndex: number, dx: number = 1) {
        if (this.hoverOptions.animate) {
            this.hoverOptions.animate(ctx, e, this.points, dataPointIndex, this.chartOptions, this.hoverOptions, dx)
            return
        }
    }

    findHoveringDataPoint(p: Point, callback?: (p: Point) => void): number | undefined {
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
    animate(t: DOMHighResTimeStamp, ctx: CanvasRenderingContext2D, hoverEvent?: PointerEvent) {
        this.customAnimate(t, 'stroke', (dx) => this.stroke(ctx, getEasingFunction(this.strokeOptions.ease ?? 'easeInSine')(dx)))
        this.customAnimate(t, 'fill', (dx) => this.fill(ctx, getEasingFunction(this.fillOptions.ease ?? 'easeInSine')(dx)))
        this.customAnimate(t, 'hover', (dx) => {
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

    private lock: boolean = false
    /**
     * for value:
     * 
     * if number, if -1, shape is not drawn, otherwise it's animated as many time as it's value
     * 
     * if array, if the value of animation run index in this array is true it will animate and if false it will be drawn only (not animated), and for any value other than boolean it will not be drawn
     * 
     * @default 0
     */
    animationsController: { [k: string | number]: number | any[] } = {}
    animationsDuration: { [k: string | number]: number } = {}
    animationsRunCounts: { [k: string | number]: number } = {}
    private animationsPreviousDx: { [k: string | number]: number } = {}
    private animationsStop: { [k: string | number]: boolean } = {}
    private animationsPassed: { [k: string | number]: number } = {}
    private animationsFirstTimestamp: { [k: string | number]: number } = {}

    private setDefaults(key: number | string) {
        while (this.lock === true)
            continue

        this.lock = true
        if (this.animationsController[key] === undefined)
            this.animationsController[key] = 0

        if (this.animationsRunCounts[key] === undefined)
            this.animationsRunCounts[key] = 1

        if (this.animationsPreviousDx[key] === undefined)
            this.animationsPreviousDx[key] = 0

        if (this.animationsDuration[key] === undefined)
            this.animationsDuration[key] = 0

        if (this.animationsStop[key] === undefined)
            this.animationsStop[key] = false

        if (this.animationsPassed[key] === undefined)
            this.animationsPassed[key] = 0

        if (this.animationsFirstTimestamp[key] === undefined)
            this.animationsFirstTimestamp[key] = 0

        this.lock = false
    }

    resetAnimation(key: string | number) {
        while (this.lock === true)
            continue

        this.lock = true

        this.animationsRunCounts[key] = 1
        this.animationsPreviousDx[key] = 0
        this.animationsStop[key] = false
        this.animationsPassed[key] = 0
        this.animationsFirstTimestamp[key] = 0
        this.lock = false
    }

    play(key: number | string) {
        if (key !== undefined)
            this.animationsStop[key] = false
    }

    pause(key?: number | string) {
        if (key === undefined)
            Object.keys(this.animationsStop).forEach(e => this.animationsStop[e] = true)
        else
            this.animationsStop[key] = true
    }

    customAnimate(t: DOMHighResTimeStamp, animationKey: number | string, animationCallback: (dx: number) => void) {
        this.setDefaults(animationKey)

        if (this.animationsDuration[animationKey] === undefined || this.animationsDuration[animationKey] <= 0)
            return

        if (this.animationsFirstTimestamp[animationKey] === 0)
            this.animationsFirstTimestamp[animationKey] = t

        this.animationsPassed[animationKey] = t - this.animationsFirstTimestamp[animationKey]

        let dx = this.animationsPreviousDx[animationKey]

        if (!this.animationsStop[animationKey]) {
            dx = (this.animationsPassed[animationKey] % this.animationsDuration[animationKey]) / this.animationsDuration[animationKey]

            if (this.animationsPreviousDx[animationKey] > dx)
                this.animationsRunCounts[animationKey] += 1
            this.animationsPreviousDx[animationKey] = dx

            let i = Math.floor(this.animationsPassed[animationKey] / this.animationsDuration[animationKey])

            let tmp = this.shouldAnimate(this.animationsController[animationKey], this.animationsRunCounts[animationKey], i, dx)
            if (tmp === undefined)
                return

            dx = tmp
        }

        animationCallback(dx)
    }

    private shouldAnimate(controller: number | any[], animationRunsCount: number, animationRunIndex: number, dx: number): number | undefined {
        if (typeof controller === 'number')
            if (controller < 0)
                return
            else if (controller === 0)
                return 1
            else if (animationRunsCount <= controller)
                return dx
            else
                return 1
        else if (Array.isArray(controller))
            if (controller[animationRunIndex] === true)
                return dx
            else if (controller[animationRunIndex] === false)
                return 1
            else
                return
    }
}

