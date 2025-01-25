import { Bezier } from "bezier-js"
import { Point } from "../../Lib/Math"
import { ReactNode } from "react"
import { ChartOptions, DrawOptions } from "./index.d"
import { Circle } from "../Base/Canvas/Shapes/Circle"

function createCircles(ctx: CanvasRenderingContext2D, points: Point[], radius: number, lineWidth?: number, strokeStyle?: string | CanvasGradient | CanvasPattern, fillStyle?: string | CanvasGradient | CanvasPattern, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number): Circle[] {
    return points.map(p => new Circle(p.x, p.y, radius, lineWidth, strokeStyle, fillStyle, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY))
}

export class LineChart {
    private x: number[]
    private y: number[]
    private points: Point[]
    private xLabels?: ReactNode[]
    private yLabels?: ReactNode[]
    private chartOptions: ChartOptions
    private animationDuration?: number
    fillOptions: DrawOptions
    strokeOptions: DrawOptions

    constructor(
        options: {
            x: number[],
            y: number[],
            fillOptions: DrawOptions,
            strokeOptions: DrawOptions,
            xLabels?: ReactNode[],
            yLabels?: ReactNode[],
            chartOptions?: ChartOptions,
            animationDuration?: number,
        }
    ) {
        if (!options.chartOptions)
            options.chartOptions = {
                width: 800,
                height: 400,
                offset: 30,
                xAxisOffset: 15,
                yAxisOffset: 15,
                hoverRadius: 20,
            }

        this.x = options.x
        this.y = options.y
        this.points = this.getDistributedPoints(options.x, options.y, options.chartOptions.width, options.chartOptions.height, options.chartOptions.offset)
        this.xLabels = options.xLabels
        this.yLabels = options.yLabels
        this.chartOptions = options.chartOptions
        this.animationDuration = options.animationDuration
        this.fillOptions = options.fillOptions
        this.strokeOptions = options.strokeOptions
    }

    setChartOptions(chartOptions: ChartOptions) {
        this.chartOptions = chartOptions
        this.points = this.getDistributedPoints(this.x, this.y, chartOptions.width, chartOptions.height, chartOptions.offset)
    }

    stroke(ctx: CanvasRenderingContext2D, t = 1) {
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
        let count = drawPoints.length * t
        for (let i = 1; i < count; i++)
            if (drawPoints[i] || drawPoints[i]?.x || drawPoints[i]?.y)
                ctx.lineTo(drawPoints[i].x, drawPoints[i].y)

        ctx.stroke()
    }

    fill(ctx: CanvasRenderingContext2D, t = 1) {
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

    private getDistributedPoints(x: number[], y: number[], width: number, height: number, offset: number) {
        let xs = this.distribute(x, width - 2 * offset).map(v => v + offset).map(v => ({ x: v }))
        let ys = this.distribute(y, width - 2 * offset)
            .map(v => height - (offset * 2) - v)
            .map(v => v + offset).map(v => ({ y: v }))

        return xs.map((v, i) => ({ x: v.x, y: ys[i].y }))
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
}
