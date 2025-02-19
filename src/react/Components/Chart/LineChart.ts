import { Bezier } from "bezier-js"
import { Point } from "../../Lib/Math"
import { CanvasOffsets, Label } from "./index.d"

export class LineChart {
    static calculateXLabels(xLabels: Label[], xRange: [number | undefined, number | undefined], width: number, offset: CanvasOffsets): Label[] {
        width = width - offset.left - offset.right
        console.log('calculateXLabels', (xLabels), width, offset, (xRange))

        return this.linearInterpolation(xLabels.map((l, i) => l.value).filter(f => f !== undefined && f !== null), width, xRange)
            .map(v => v + offset!.left)
            .map((value, i) => ({ ...xLabels[i], value }))
    }

    static calculateYLabels(yLabels: Label[], yRange: [number | undefined, number | undefined], height: number, offset: CanvasOffsets): Label[] {
        height = height - offset.top - offset.bottom

        return this.linearInterpolation(yLabels.map((l, i) => l.value).filter(f => f !== undefined && f !== null), height, yRange)
            .map(v => height - v)
            .map(v => v + offset!.top)
            .map((value, i) => ({ ...yLabels[i], value }))
    }

    static calculateDataPoints(
        x: number[],
        y: number[],
        xRange: [number | undefined, number | undefined],
        yRange: [number | undefined, number | undefined],
        width: number,
        height: number,
        offset: CanvasOffsets,
        calculateExtremes = false
    ): Point[] {
        let localX: number[], localY: number[]
        if (calculateExtremes) {
            let ps = this.calculateExtremePoints(x.map((m, i) => ({ x: m, y: y[i] })))
            localX = ps.map(v => v.x)
            localY = ps.map(v => v.y)
        } else {
            localX = x
            localY = y
        }

        width = width - offset.left - offset.right
        height = height - offset.top - offset.bottom

        localX = this.linearInterpolation(localX, width, xRange).map(v => v + offset!.left)
        localY = this.linearInterpolation(localY, height, yRange)
            .map(v => height - v)
            .map(v => v + offset!.top)

        return localX.map((v, i) => ({ x: v, y: localY[i] }))
    }

    private static linearInterpolation(values: number[], range: number, valuesRange?: [number | undefined, number | undefined]): number[] {
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

    private static calculateExtremePoints(points: Point[]): Point[] {
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

    static calculateControlPoints(dataPoints: Point[], loopCallback?: (controls: [Point, Point, Point, Point], index: number) => any): [Point, Point, Point, Point][] {
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

    static bezierCurve(dataPoints: Point[], animationDuration?: undefined, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Bezier[]
    static bezierCurve(dataPoints: Point[], animationDuration: number, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Point[]
    static bezierCurve(dataPoints: Point[], animationDuration?: number, drawLine?: (curve: Bezier, controlPoints: [Point, Point, Point, Point], pointIndex: number) => void): Point[] | Bezier[] {
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
}

