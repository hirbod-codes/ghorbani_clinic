import { PointerEvent, ReactNode, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { ChartOptions, DimensionsOptional } from "./index.d"
import { DropdownMenu } from "../Base/DropdownMenu"
import { cn } from "../../shadcn/lib/utils"
import { ShapeManager } from "./ShapeManager"
import { Dimensions } from './index.d'
import { IShape } from "./IShape"
import { CircularLoading } from "../Base/CircularLoading"

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

    const hover = useRef<{ [k: number]: { open?: boolean, top?: number, left?: number, node?: ReactNode } }>({})
    const hoverEvent = useRef<PointerEvent>()

    const hasInit = useRef<boolean>(false)

    const [ready, setReady] = useState<boolean>(false)

    const [, rerender] = useReducer(x => x + 1, 0)

    console.log('Chart', { dimensions, canvasRef, ctx, containerRef, shapes, xAxis, yAxis });

    useEffect(() => {
        initCanvasSize()

        window.addEventListener('resize', initCanvasSize)

        return () => window.removeEventListener('resize', initCanvasSize)
    }, [canvasRef?.current, containerRef?.current])

    const initCanvasSize = () => {
        if (canvasRef.current && containerRef.current) {
            console.log('Chart', 'useEffect')
            const rect = containerRef.current.getBoundingClientRect()
            rect.width = Math.round(rect.width)
            rect.height = Math.round(rect.height)

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
                xAxisOffset: dimensionsInput?.xAxisOffset ?? 15,
                yAxisOffset: dimensionsInput?.yAxisOffset ?? 15,
            }

            if (xAxis) {
                xAxis.canvasCoords = {
                    width: rect.width,
                    height: rect.height,
                    offset: dimensions.current.offset!,
                    xAxisOffset: dimensions.current!.xAxisOffset,
                    yAxisOffset: dimensions.current!.yAxisOffset,
                }
                if (!xAxis.styleOptions)
                    xAxis.styleOptions = {}
                if (!xAxis.styleOptions.strokeStyle)
                    xAxis.styleOptions.strokeStyle = themeOptions.colors.surface[themeOptions.mode].foreground
            }

            if (yAxis) {
                yAxis.canvasCoords = {
                    width: rect.width,
                    height: rect.height,
                    offset: dimensions.current.offset!,
                    xAxisOffset: dimensions.current!.xAxisOffset,
                    yAxisOffset: dimensions.current!.yAxisOffset,
                }
                if (!yAxis.styleOptions)
                    yAxis.styleOptions = {}
                if (!yAxis.styleOptions.strokeStyle)
                    yAxis.styleOptions.strokeStyle = themeOptions.colors.surface[themeOptions.mode].foreground
            }
        }
    }

    useEffect(() => {
        initAnimations()
    }, [dimensions?.current, ctx?.current, shapes])

    const initAnimations = () => {
        if (ctx.current && dimensions.current && hasInit.current === false) {
            console.log('Chart', 'useEffect2', chartKey, shapes)

            hasInit.current = true

            let allShapesPromises = ([] as IShape[])
                .concat([
                    {
                        control: 0,
                        doNotCache: true,
                        draw(dx, ctx, shape) {
                            ctx.lineWidth = 0
                            let path = new Path2D()
                            path.rect(
                                dimensions.current!.offset!.left,
                                dimensions.current!.offset!.top - 5,
                                dimensions.current!.width - dimensions.current!.offset!.left - dimensions.current!.offset!.right,
                                dimensions.current!.height - dimensions.current!.offset!.top - dimensions.current!.offset!.bottom + 5
                            )
                            ctx.clip(path)
                        },
                    }
                ])
                .concat(shapes)
                .concat([xAxis, yAxis])
                // Note: Do not use the shorter syntax for map method because s might be a class instance(the short syntax will omit function properties like 'draw')
                .map(async s => {
                    if (!dimensions.current)
                        return s

                    if (!s.canvasCoords)
                        s.canvasCoords = dimensions.current
                    else
                        s.canvasCoords = { ...dimensions.current, ...s.canvasCoords }

                    if (s.onCanvasCoordsChange)
                        await s.onCanvasCoordsChange(s)

                    return s
                })

            Promise.all(allShapesPromises)
                .then(allShapes => {
                    setReady(true)

                    ShapeManager.addShapeGroup(chartKey, allShapes, ctx.current!, dimensions.current!)

                    if (afterChartOptionsSet)
                        afterChartOptionsSet(dimensions.current!)

                    console.log('runAnimations')
                    ShapeManager.runAnimations(chartKey)
                })

        }
    }

    const onPointerOver = useCallback(function onPointerOver(e: PointerEvent) {
        hoverEvent.current = e

        if (shapes)
            for (let i = 0; i < shapes.length; i++) {
                let shape = shapes[i]

                if (shape.hoverOptions === undefined)
                    continue

                let shouldRerender = false

                let point = shape.hoverOptions.getDataPointOnHover({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }, shape.hoverOptions)

                if (
                    (hover.current[i]?.open === true && point === undefined) ||
                    (hover.current[i]?.open === false && point !== undefined)
                )
                    shouldRerender = true

                if (hover.current[i] === undefined)
                    hover.current[i] = {}

                if (point === undefined)
                    hover.current[i].open = false
                else {
                    const canvasDomRect = canvasRef.current?.getBoundingClientRect()
                    hover.current[i] = {
                        open: true,
                        top: (canvasDomRect?.top ?? 0) + point?.y,
                        left: (canvasDomRect?.left ?? 0) + point?.x,
                        node: shape.hoverOptions.getHoverNode !== undefined ? shape.hoverOptions.getHoverNode!(point.index) : ''
                    }
                }

                if (shouldRerender)
                    rerender()
            }
    }, [shapes])

    return (
        <div dir="ltr" className="relative size-full border rounded-lg overflow-hidden" ref={containerRef}>
            {!ready && <CircularLoading containerProps={{ className: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' }} />}

            <canvas
                ref={canvasRef}
                className="size-full"
                onPointerMove={onPointerOver}
                onPointerLeave={() => {
                    hoverEvent.current = undefined
                    hover.current = {}
                    rerender()
                }}
            />

            {shapes.map((s, i) =>
                <DropdownMenu
                    key={i}
                    open={hover.current[i]?.open ?? false}
                    verticalPosition="top"
                    containerProps={{
                        className: 'pointer-events-none select-none',
                        style: { zIndex: 50 }
                    }}
                    anchorDomRect={{
                        width: 10,
                        height: 10,
                        top: hover.current[i]?.top,
                        left: hover.current[i]?.left,
                    }}
                >
                    {hover.current[i]?.node}
                </DropdownMenu>
            )}

            {(shapes.map(s =>
                s.canvasCoords && s.xLabels && s.xLabels.map((l, i) =>
                    l.value !== undefined && l.node !== undefined && l.value! >= s.canvasCoords!.offset?.left && l.value! <= (s.canvasCoords!.width - s.canvasCoords!.offset?.right)
                        ? <div key={i} {...l.options} className={cn("absolute", l?.options?.className)} style={{ ...l?.options?.style, top: `${s.canvasCoords!.height - s.canvasCoords!.offset!.bottom + s.canvasCoords!.xAxisOffset}px`, left: l.value }}>
                            <div className="relative -translate-x-1/2">
                                {l.node}
                            </div>
                        </div>
                        : undefined
                )
            ))}

            {(shapes.map(s =>
                s.canvasCoords && s.yLabels && s.yLabels.map((l, i) =>
                    l.value !== undefined && l.node !== undefined && l.value! >= s.canvasCoords!.offset?.top && l.value! <= (s.canvasCoords!.height - s.canvasCoords!.offset?.bottom)
                        ? <div key={i} {...l.options} className={cn("absolute", l?.options?.className)} style={{ ...l?.options?.style, top: l.value, left: `${s.canvasCoords!.offset!.left - s.canvasCoords!.yAxisOffset}px` }}>
                            <div className="relative -translate-x-full">
                                {l.node}
                            </div>
                        </div>
                        : undefined
                )
            ))}
        </div>
    )
}

Chart.XAxis = {
    control: 0,
    styleOptions: {
        lineCap: 'square',
        lineWidth: 2
    },
    draw(dx, ctx, shape) {
        if (!shape.canvasCoords)
            return

        ctx.save()

        ctx.beginPath()

        if (shape.styleOptions)
            Object.keys(shape.styleOptions).forEach(k => ctx[k] = shape.styleOptions![k])

        let y = shape.canvasCoords.height - shape.canvasCoords.offset.bottom + (shape.styleOptions?.lineWidth ?? 0) / 2
        ctx.moveTo(shape.canvasCoords.offset.left, y)
        ctx.lineTo(shape.canvasCoords.width - shape.canvasCoords.offset.right, y)

        ctx.stroke()

        ctx.restore()
    },
} as IShape

Chart.YAxis = {
    control: 0,
    styleOptions: {
        lineCap: 'square',
        lineWidth: 2
    },
    draw(dx, ctx, shape) {
        if (!shape.canvasCoords)
            return

        ctx.save()

        ctx.beginPath()

        if (shape.styleOptions)
            Object.keys(shape.styleOptions).forEach(k => ctx[k] = shape.styleOptions![k])

        let x = shape.canvasCoords.offset.left + (shape.styleOptions?.lineWidth ?? 0) / 2
        ctx.moveTo(x, shape.canvasCoords.height - shape.canvasCoords.offset.bottom)
        ctx.lineTo(x, shape.canvasCoords.offset.top)

        ctx.stroke()

        ctx.restore()
    },
} as IShape
