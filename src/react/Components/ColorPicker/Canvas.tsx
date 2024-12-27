import { PointerEvent, useEffect, useRef, useState } from "react";
import { Color } from "../../Lib/Colors/index.d";
import { Point } from "../../Lib/Math";
import { toHsv } from "../../Lib/Colors";
import { Shapes } from "../Base/Canvas/Shapes/Shapes";
import { Circle } from "../Base/Canvas/Shapes/Circle";
import { Shape } from "../Base/Canvas/Shapes/Shape";

export function Canvas({ hue, color, onColorChange }: { hue: number, color?: Color, onColorChange?: (color: Color) => void | Promise<void> }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })

    const [pointerDown, setPointerDown] = useState<boolean>(false)
    // const [previousPoint, setPreviousPoint] = useState<Point>()
    const previousPoint = useRef<Point>()

    const [shapes,] = useState(new Shapes([]))
    const [validatorCircle, setValidatorCircle] = useState<Shape>()
    const [innerCircle, setInnerCircle] = useState<Shape>()
    const [outerCircle, setOuterCircle] = useState<Shape>()

    console.log('Canvas', { canvasRef: canvasRef.current, hue, color, onColorChange, previousPoint: previousPoint.current, shapes: shapes.shapes, outerCircle, innerCircle, pointerDown })

    const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()

        setPointerDown(true)

        if (!canvasRef.current)
            return

        const c = canvasRef.current!.getContext('2d', { willReadFrequently: true })
        if (!c)
            return

        const b = canvasRef.current!.getBoundingClientRect()
        const p = { x: e.clientX - b.left, y: e.clientY - b.top }

        previousPoint.current = p
        updateColor(c, p)
    }

    const onPointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()

        setPointerDown(false)
    }

    const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!ctx || !pointerDown || !canvasRef.current)
            return

        const b = canvasRef.current.getBoundingClientRect()
        const p = { x: e.clientX - b.left, y: e.clientY - b.top }

        updateColor(ctx, p)

        previousPoint.current = p
    }

    const updateColor = (c: CanvasRenderingContext2D, p: Point) => {
        movePointer(c, p)

        const b = canvasRef.current!.getBoundingClientRect()

        if (onColorChange)
            onColorChange({ type: 'hsv', value: [hue, 100 * (p.x / b.width), 100 * (1 - Math.abs(p.y / b.height))] })
    }

    const movePointer = (c: CanvasRenderingContext2D, point: Point) => {
        // outerCircle!.translate(previousPoint.current ?? point, point)
        // innerCircle!.translate(previousPoint.current ?? point, point)

        (innerCircle as Circle).x = point.x;
        (innerCircle as Circle).y = point.y;

        (outerCircle as Circle).x = point.x;
        (outerCircle as Circle).y = point.y;

        shapes.draw({ canvasRef, ctx: c, prevPoint: previousPoint.current ?? point, currentPoint: point })
    }

    const createValidatorCircle = () => {
        if (!ctx || !canvasRef.current || validatorCircle)
            return

        const b = canvasRef.current.getBoundingClientRect()

        const vc = new Circle(b.width / 2, b.height / 2, 40, 2, 'green', undefined, 10, 'black')
        setValidatorCircle(vc)
        shapes.push(vc)

        shapes.draw({ canvasRef, ctx, currentPoint: { x: 0, y: 0 } })
    }

    const createPointer = () => {
        if (!ctx || !canvasRef.current || outerCircle || innerCircle)
            return

        const center = { x: canvasRef.current.clientWidth / 2, y: canvasRef.current.clientHeight / 2 }
        const oc = new Circle(center.x, center.y, 12, 2, 'white', undefined)
        const ic = new Circle(center.x, center.y, 2, 2, 'black', 'black')
        setOuterCircle(oc)
        setInnerCircle(ic)
        shapes.push(oc)
        shapes.push(ic)

        shapes.draw({ canvasRef, ctx, currentPoint: { x: 0, y: 0 } })
    }

    const initColor = () => {
        if (!ctx || !canvasRef.current || !color)
            return

        const b = canvasRef.current.getBoundingClientRect()

        updateColor(ctx, { x: b.width * toHsv(color).value[1], y: b.height * (1 - (toHsv(color).value[2] / 100)) })
    }

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = canvasRef.current.clientWidth
            canvasRef.current.height = canvasRef.current.clientHeight
            const ctx = canvasRef.current.getContext('2d')
            ctx?.scale(1, 1)
        }

        createValidatorCircle()
        createPointer()
    }, [canvasRef.current])

    useEffect(() => {
        if (outerCircle && innerCircle)
            initColor()
    }, [outerCircle, innerCircle])

    return (
        <div id="canvas-container" className="size-full">
            <canvas
                ref={canvasRef}
                className="size-full"
                style={{ width: '100%', height: '100%', touchAction: 'none', userSelect: 'none', backgroundColor: `hsl(${hue}, 100%, 50%)`, backgroundImage: 'linear-gradient(to top, #000, rgba(0, 0, 0, 0)), linear-gradient(to right, #fff, rgba(255, 255, 255, 0))' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            />
        </div>
    )
}

