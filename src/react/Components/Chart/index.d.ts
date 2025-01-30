import { PointerEvent, ReactNode } from "react"
import { EasingName } from "../Animations/easings"
import { Point } from "../../Lib/Math"

export type ChartOptions = {
    bgColor?: string
    width?: number
    height?: number
    offset?: number
    xAxisOffset?: number
    yAxisOffset?: number
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
    /**
     * for value:
     * 
     * if number, if -1, shape is not drawn, otherwise it's animated as many time as it's value
     * 
     * if array, if the value of animation run index in this array is true it will animate and if false it will be drawn only (not animated), and for any value other than boolean it will not be drawn
     * 
     * @default 0
     */
    controller?: number | any[]
    duration?: number
    ease?: EasingName
    animateStyles?: (ctx: CanvasRenderingContext2D, dataPoints: Point[], styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => CanvasStyleOptions
    styles?: CanvasStyleOptions
    animateDraw?: (ctx: CanvasRenderingContext2D, dataPoints: Point[], styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => void
}

export type DrawOnHoverOptions = Omit<DrawShapeOptions, 'animateStyles' | 'animateDraw' | 'styles'> &
{
    getHoverNode?: (dataPoints: Point[], hoveringPointIndex: number) => ReactNode
    hoverRadius?: number
    hoverWidth?: number
    hoverHeight?: number
    animate?: (ctx: CanvasRenderingContext2D, e: PointerEvent, dataPoints: Point[], dataPointIndex: number, chartOptions: ChartOptions, hoverOptions: DrawShapeOptions, dx: number) => void
}

export type DrawOptions = {
    ease?: EasingName
    styles?: CanvasStyleOptions
    animateStyles?: (ctx: CanvasRenderingContext2D, styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => CanvasStyleOptions
    animateDraw?: (ctx: CanvasRenderingContext2D, styleOptions?: CanvasStyleOptions, chartOptions?: ChartOptions, fraction?: number) => void
}
