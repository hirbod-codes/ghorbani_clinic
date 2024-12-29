import { memo, PointerEvent, useEffect, useReducer, useRef, useState } from "react";
import { Point } from "../../Lib/Math";
import { Shapes } from "../Base/Canvas/Shapes/Shapes";
import { Circle } from "../Base/Canvas/Shapes/Circle";
import { Shape } from "../Base/Canvas/Shapes/Shape";
import { HSV } from "../../Lib/Colors/HSV";

export const Canvas = memo(function Canvas({ hue, defaultColor, controlledColor, onColorChanged, onColorChanging }: { hue: number, defaultColor?: HSV, controlledColor?: HSV, onColorChanged?: (color: HSV) => void | Promise<void>, onColorChanging?: (color: HSV) => void | Promise<void> }) {
    const [, rerender] = useReducer(x => x + 1, 0)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>()

    const [pointerDown, setPointerDown] = useState<boolean>(false)
    const previousPoint = useRef<Point>()

    const [shapes,] = useState(new Shapes([]))
    const [validatorCircle, setValidatorCircle] = useState<Shape>()
    const [innerCircle, setInnerCircle] = useState<Shape>()
    const [outerCircle, setOuterCircle] = useState<Shape>()

    console.log('Canvas', { canvasRef: canvasRef.current, hue, color: defaultColor, onColorChanged, previousPoint: previousPoint.current, validatorCircle, shapes: shapes.shapes, outerCircle, innerCircle, pointerDown })

    const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()

        setPointerDown(true)

        const b = canvasRef.current!.getBoundingClientRect()
        const newColor = updateColor({ x: e.clientX - b.left, y: e.clientY - b.top })

        if (onColorChanging && newColor)
            onColorChanging(newColor)
    }

    const onPointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()

        const b = canvasRef.current!.getBoundingClientRect()
        const newColor = updateColor({ x: e.clientX - b.left, y: e.clientY - b.top })

        if (onColorChanged && newColor)
            onColorChanged(newColor)

        setPointerDown(false)
    }

    const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!pointerDown)
            return

        const b = canvasRef.current!.getBoundingClientRect()
        const newColor = updateColor({ x: e.clientX - b.left, y: e.clientY - b.top })

        if (onColorChanging && newColor)
            onColorChanging(newColor)
    }

    const updateColor = (p: Point): HSV | undefined => {
        if (!canvasRef.current)
            return

        const distanceLimit = (validatorCircle as Circle).r
        if (Math.sqrt(Math.pow(Math.abs(p.x - canvasRef.current!.clientWidth / 2), 2) + Math.pow(Math.abs(p.y - canvasRef.current!.clientHeight / 2), 2)) > distanceLimit)
            return;

        if (!previousPoint.current)
            previousPoint.current = p

        movePointer(ctx!, p)

        previousPoint.current = p

        const b = canvasRef.current!.getBoundingClientRect()

        const hsva = [hue, 100 * (p.x / b.width), 100 * (1 - Math.abs(p.y / b.height))]

        return new HSV(hsva[0], hsva[1], hsva[2], 1)
    }

    const movePointer = (c: CanvasRenderingContext2D, point: Point) => {
        (innerCircle as Circle).x = point.x;
        (innerCircle as Circle).y = point.y;

        (outerCircle as Circle).x = point.x;
        (outerCircle as Circle).y = point.y;

        shapes.draw({ canvasRef, ctx: c, prevPoint: previousPoint.current ?? point, currentPoint: point })
    }

    const calculateColorPosition = (color: HSV): Point => {
        const b = canvasRef.current!.getBoundingClientRect()

        return { x: b.width * defaultColor!.getSaturation(), y: b.height * (1 - (defaultColor!.getValue() / 100)) }
    }

    const createValidatorCircle = () => {
        const b = canvasRef.current!.getBoundingClientRect()

        const vc = new Circle(b.width / 2, b.height / 2, 40, 2, 'green', undefined, 10, 'black')
        setValidatorCircle(vc)
        shapes.push(vc)

        shapes.draw({ canvasRef, ctx: ctx!, currentPoint: { x: 0, y: 0 } })
    }

    const createPointer = () => {
        const center = { x: canvasRef.current!.clientWidth / 2, y: canvasRef.current!.clientHeight / 2 }
        const oc = new Circle(center.x, center.y, 12, 2, 'white', undefined)
        const ic = new Circle(center.x, center.y, 2, 2, 'black', 'black')
        setOuterCircle(oc)
        setInnerCircle(ic)
        shapes.push(oc)
        shapes.push(ic)

        shapes.draw({ canvasRef, ctx: ctx!, currentPoint: { x: 0, y: 0 } })
    }

    const initColor = () => {
        movePointer(ctx!, calculateColorPosition(defaultColor!));
        hue = defaultColor!.getHue()
        rerender()
    }

    useEffect(() => {
        if (canvasRef.current) {
            let c = canvasRef.current.getContext('2d', { willReadFrequently: true })!
            setCtx(c)

            canvasRef.current.width = canvasRef.current.clientWidth
            canvasRef.current.height = canvasRef.current.clientHeight
            c.scale(1, 1)
        }
    }, [canvasRef.current])

    useEffect(() => {
        if (ctx) {
            createValidatorCircle()
            createPointer()
        }
    }, [ctx])

    useEffect(() => {
        if (outerCircle && innerCircle && validatorCircle && defaultColor)
            initColor()
    }, [outerCircle, innerCircle, validatorCircle])

    useEffect(() => {
        if (ctx && controlledColor) {
            movePointer(ctx, calculateColorPosition(controlledColor!))
            hue = controlledColor.getHue()
            rerender()
        }
    }, [controlledColor])

    return (
        <div className="size-full" style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}>
            <div className="size-full bg-gradient-to-r from-[#ffffff]">
                <div className="size-full bg-gradient-to-t from-[#000000] ">
                    <canvas
                        ref={canvasRef}
                        className="size-full touch-none select-none"
                        // bg-[linear-gradient(to top, #000, rgba(0, 0, 0, 0)), linear-gradient(to right, #fff, rgba(255, 255, 255, 0))]
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                    />
                </div>
            </div>
        </div>
    )
})
