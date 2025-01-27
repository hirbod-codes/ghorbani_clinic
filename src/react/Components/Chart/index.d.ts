import { ReactNode } from "react"
import { EasingName } from "../Animations/easings"
import { Point } from "../../Lib/Math"

export type ChartOptions = {
    bgColor?: string
    width?: number
    height?: number
    offset?: number
    xAxisOffset?: number
    yAxisOffset?: number
    getHoverNode?: (dataPoints: Point[], hoveringPointIndex: number) => ReactNode
    hoverRadius?: number
    hoverWidth?: number
    hoverHeight?: number
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

export type DrawShapeOptions = {
    ease?: EasingName
    animateStyles?: (ctx: CanvasRenderingContext2D, dataPoints: Point[], styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => CanvasStyleOptions
    styles?: CanvasStyleOptions
    animateDraw?: (ctx: CanvasRenderingContext2D, dataPoints: Point[], styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => void
}

export type DrawOptions = {
    ease?: EasingName
    animateStyles?: (ctx: CanvasRenderingContext2D, styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => CanvasStyleOptions
    styles?: CanvasStyleOptions
    animateDraw?: (ctx: CanvasRenderingContext2D, styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => void
}
