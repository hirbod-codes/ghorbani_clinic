import { memo, PointerEvent, ReactNode, useCallback, useContext, useEffect, useReducer, useRef } from "react"
import { EasingName, getEasingFunction } from "../../Components/Animations/easings"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { DrawOptions, ChartOptions, CanvasStyleOptions, DimensionsOptional } from "./index.d"
import { LineChart } from "../../Components/Chart/LineChart"
import { DropdownMenu } from "../Base/DropdownMenu"
import { cn } from "../../shadcn/lib/utils"
import { ShapeManager } from "./ShapeManager"
import { Dimensions } from './index.d'
import { IShape } from "./IShape"

export type ChartProps = {
    chartKey: string
    bgColor?: string
    dimensions?: DimensionsOptional
    shapes?: IShape[]
    xAxis?: IShape
    yAxis?: IShape
    afterChartOptionsSet?: (chartOptions: ChartOptions) => void
}

export function Chart({
    chartKey,
    bgColor,
    dimensions: dimensionsInput,
    shapes = [],
    xAxis = Chart.XAxis,
    yAxis = Chart.YAxis,
    afterChartOptionsSet,
}: ChartProps) {
    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    if (!bgColor)
        bgColor = themeOptions.colors.surface[themeOptions.mode].main

    const dimensions = useRef<Dimensions>()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctx = useRef<CanvasRenderingContext2D>()

    const containerRef = useRef<HTMLDivElement>(null)

    const [, rerender] = useReducer(x => x + 1, 0)

    console.log('Chart', { dimensions, canvasRef, ctx, containerRef, shapes, xAxis, yAxis });

    useEffect(() => {
        if (canvasRef.current && containerRef.current) {
            console.log('Chart', 'useEffect')
            const rect = containerRef.current.getBoundingClientRect()

            ctx.current = canvasRef.current.getContext('2d')!

            canvasRef.current.style.width = rect.width + "px"
            canvasRef.current.style.height = rect.height + "px"

            let scale = window.devicePixelRatio
            canvasRef.current.width = rect.width * scale
            canvasRef.current.height = rect.height * scale
            ctx.current.scale(scale, scale)

            dimensions.current = {
                width: dimensionsInput?.width ?? rect.width,
                height: dimensionsInput?.height ?? rect.height,
                offset: dimensionsInput?.offset ?? { top: 20, right: 20, left: 60, bottom: 60 },
            }

            if (!xAxis)
                xAxis = Chart.XAxis
            xAxis.canvasCoords = {
                width: rect.width,
                height: rect.height,
                offset: dimensions.current.offset!
            }
            if (!xAxis.styleOptions)
                xAxis.styleOptions = {}
            xAxis.styleOptions.strokeStyle = themeOptions.colors.surface[themeOptions.mode].foreground

            if (!yAxis)
                yAxis = Chart.YAxis
            yAxis.canvasCoords = {
                width: rect.width,
                height: rect.height,
                offset: dimensions.current.offset!
            }
            if (!yAxis.styleOptions)
                yAxis.styleOptions = {}
            yAxis.styleOptions.strokeStyle = themeOptions.colors.surface[themeOptions.mode].foreground
        }
    }, [canvasRef?.current, containerRef?.current])

    useEffect(() => {
        if (ctx.current && dimensions.current) {
            console.log('Chart', 'useEffect2')

            ShapeManager.addShapeGroup(
                chartKey,
                // Note: Do not use the shorter syntax for map method because s might be a class instance(the short syntax will omit function properties like 'draw')
                [{
                    control: 0,
                    doNotCache: true,
                    draw(dx, ctx, shape) {
                        let path = new Path2D()
                        path.rect(
                            dimensions.current!.offset!.left - (yAxis?.styleOptions?.lineWidth ?? 0) / 2,
                            dimensions.current!.offset!.top - 5,
                            dimensions.current!.width - dimensions.current!.offset!.left - dimensions.current!.offset!.right + (yAxis?.styleOptions?.lineWidth ?? 0) / 2,
                            dimensions.current!.height - dimensions.current!.offset!.top - dimensions.current!.offset!.bottom + (xAxis?.styleOptions?.lineWidth ?? 0) / 2 + 5
                        )
                        ctx.clip(path)
                    },
                } as IShape].concat(shapes).concat([xAxis, yAxis]).map(s => {
                    if (!dimensions.current)
                        return s

                    if (!s.canvasCoords)
                        s.canvasCoords = dimensions.current
                    else
                        s.canvasCoords = { ...dimensions.current, ...s.canvasCoords }

                    if (s.onCanvasCoordsChange)
                        s.onCanvasCoordsChange(s.canvasCoords)

                    return s
                }),
                ctx.current,
                dimensions.current
            )

            if (afterChartOptionsSet)
                afterChartOptionsSet({ ...dimensions.current, width: dimensions.current.width, height: dimensions.current.height })

            // rerender()

            ShapeManager.runAnimations()
        }
    }, [dimensions?.current, ctx?.current])

    return (
        <div dir="ltr" className="size-full overflow-hidden" ref={containerRef}>
            <canvas
                ref={canvasRef}
                className="size-full"
            />
        </div>
    )
}

Chart.XAxis = {
    control: 0,
    styleOptions: {
        lineCap: 'square'
    },
    draw(dx, ctx, shape) {
        if (!shape.canvasCoords)
            return

        ctx.save()

        ctx.beginPath()

        if (shape.styleOptions)
            Object.keys(shape.styleOptions).forEach(k => ctx[k] = shape.styleOptions![k])

        ctx.moveTo(shape.canvasCoords.offset.left, shape.canvasCoords.height - shape.canvasCoords.offset.bottom)
        ctx.lineTo(shape.canvasCoords.width - shape.canvasCoords.offset.right, shape.canvasCoords.height - shape.canvasCoords.offset.bottom)

        ctx.stroke()

        ctx.restore()
    },
} as IShape

Chart.YAxis = {
    control: 0,
    styleOptions: {
        lineCap: 'square'
    },
    draw(dx, ctx, shape) {
        if (!shape.canvasCoords)
            return

        ctx.save()

        ctx.beginPath()

        if (shape.styleOptions)
            Object.keys(shape.styleOptions).forEach(k => ctx[k] = shape.styleOptions![k])

        ctx.moveTo(shape.canvasCoords.offset.left, shape.canvasCoords.height - shape.canvasCoords.offset.bottom)
        ctx.lineTo(shape.canvasCoords.offset.left, shape.canvasCoords.offset.top)

        ctx.stroke()

        ctx.restore()
    },
} as IShape
