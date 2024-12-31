import { memo, PointerEvent, useEffect, useReducer, useRef, useState } from "react";
import { Point } from "../../Lib/Math";
import { Shapes } from "../Base/Canvas/Shapes/Shapes";
import { Circle } from "../Base/Canvas/Shapes/Circle";
import { Shape } from "../Base/Canvas/Shapes/Shape";
import { HSV } from "../../Lib/Colors/HSV";

export type CanvasProps = {
    controlledColor?: HSV
    onColorChanged?: (color: HSV) => void | Promise<void>
    onColorChanging?: (color: HSV) => void | Promise<void>
    showValidZone?: boolean
}

export const Canvas = memo(function Canvas({ controlledColor, onColorChanged, onColorChanging, showValidZone = false }: CanvasProps) {
    const [, rerender] = useReducer(x => x + 1, 0)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D>()
    const [hue, setHue] = useState<number>(controlledColor?.getHue() ?? 0)

    const [pointerDown, setPointerDown] = useState<boolean>(false)
    const previousPoint = useRef<Point>()

    const [shapes,] = useState(new Shapes([]))
    const [validatorCircle, setValidatorCircle] = useState<Shape>()
    const [innerCircle, setInnerCircle] = useState<Shape>()
    const [outerCircle, setOuterCircle] = useState<Shape>()

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

        if (validatorCircle) {
            const distanceLimit = (validatorCircle as Circle).r
            if (Math.sqrt(Math.pow(Math.abs(p.x - canvasRef.current!.clientWidth / 2), 2) + Math.pow(Math.abs(p.y - canvasRef.current!.clientHeight / 2), 2)) > distanceLimit)
                return
        }

        if (!previousPoint.current)
            previousPoint.current = p

        movePointer(ctx!, p)

        previousPoint.current = p

        const b = canvasRef.current!.getBoundingClientRect()

        const hsva = [hue ?? 0, 100 * (p.x / b.width), 100 * (1 - (p.y / b.height))]

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

        return { x: b.width * color.getSaturation() / 100, y: b.height * (1 - (color.getValue() / 100)) }
    }

    const createValidatorCircle = () => {
        if (!showValidZone)
            return
        const b = canvasRef.current!.getBoundingClientRect()
        const vc = new Circle(b.width / 2, b.height / 2, b.width / 4, 2, 'green', undefined, 10, 'black')
        setValidatorCircle(vc)
        shapes.push(vc)

        shapes.draw({ canvasRef, ctx: ctx!, currentPoint: { x: 0, y: 0 } })
    }

    const createPointer = () => {
        const b = canvasRef.current!.getBoundingClientRect()
        const oc = new Circle(b.width / 2, b.height / 2, 12, 2, 'white', undefined)
        const ic = new Circle(b.width / 2, b.height / 2, 2, 2, 'black', 'black')
        setOuterCircle(oc)
        setInnerCircle(ic)
        shapes.push(oc)
        shapes.push(ic)

        shapes.draw({ canvasRef, ctx: ctx!, currentPoint: { x: 0, y: 0 } })
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
        setHue(controlledColor?.getHue() ?? 0)
    }, [controlledColor?.getHue()])

    useEffect(() => {
        console.log('useEffect', ctx, controlledColor, outerCircle, innerCircle)
        if (ctx && controlledColor && outerCircle && innerCircle) {
            movePointer(ctx, calculateColorPosition(controlledColor))
            rerender()
        }
    }, [controlledColor, ctx, outerCircle, innerCircle])

    return (
        <div className="size-full" style={{ backgroundColor: `hsl(${hue ?? 0}, 100%, 50%)` }}>
            <div className="size-full bg-gradient-to-r from-[#ffffff]">
                <div className="size-full bg-gradient-to-t from-[#000000] ">
                    <canvas
                        ref={canvasRef}
                        className="size-full touch-none select-none"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                    />
                </div>
            </div>
        </div>
    )
})
