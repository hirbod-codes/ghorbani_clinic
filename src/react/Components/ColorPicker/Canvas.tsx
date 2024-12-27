import { PointerEvent, useEffect, useRef, useState } from "react";
import { Color } from "../../Lib/Colors/index.d";
import { Point } from "../../Lib/Math";
import { toHsv } from "../../Lib/Colors";

export function Canvas({ hue, color, onColorChange }: { hue: number, color?: Color, onColorChange?: (color: Color) => void | Promise<void> }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [pointerDown, setPointerDown] = useState<boolean>(false)

    console.log('Canvas', { hue, color, onColorChange, pointerDown })

    const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
        setPointerDown(true)

        if (!canvasRef.current || !containerRef.current)
            return

        const c = canvasRef.current!.getContext('2d', { willReadFrequently: true })
        if (!c)
            return

        const b = canvasRef.current!.getBoundingClientRect()

        updateColor(c, { x: e.clientX - b.left, y: e.clientY - b.top })
    }

    const onPointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
        setPointerDown(false)
    }

    const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
        if (!pointerDown || !canvasRef.current || !containerRef.current)
            return

        const c = canvasRef.current!.getContext('2d', { willReadFrequently: true })
        if (!c)
            return

        const b = canvasRef.current!.getBoundingClientRect()

        updateColor(c, { x: e.clientX - b.left, y: e.clientY - b.top })
    }

    const updateColor = (c: CanvasRenderingContext2D, p: Point) => {
        movePointer(c, p)

        const b = canvasRef.current!.getBoundingClientRect()

        console.log(canvasRef.current!.clientWidth, p, [hue, 100 * (p.x / b.width), 100 * Math.abs(1 - (p.y / b.height))])

        if (onColorChange)
            onColorChange({ type: 'hsv', value: [hue, 100 * (p.x / b.width), 100 * (1 - Math.abs(p.y / b.height))] })
    }

    const movePointer = (c: CanvasRenderingContext2D, point: Point) => {
        c.clearRect(0, 0, canvasRef.current!.clientWidth, canvasRef.current!.clientHeight)

        c.beginPath()
        c.strokeStyle = 'white'
        c.lineWidth = 2
        c.ellipse(point.x, point.y, 12, 12, 0, 0, 2 * Math.PI)
        c.stroke()

        c.beginPath()
        c.fillStyle = 'grey'
        c.ellipse(point.x, point.y, 2, 2, 0, 0, 2 * Math.PI)
        c.fill()
    }

    useEffect(() => {
        if (canvasRef.current && containerRef.current) {
            canvasRef.current.width = canvasRef.current.clientWidth
            canvasRef.current.height = canvasRef.current.clientHeight
            const ctx = canvasRef.current.getContext('2d')
            ctx?.scale(1, 1)
        }
    }, [canvasRef.current, containerRef.current])

    useEffect(() => {
        if (color && canvasRef.current) {
            const c = canvasRef.current!.getContext('2d', { willReadFrequently: true })
            const b = canvasRef.current!.getBoundingClientRect()

            console.log('aaaaaaaaaaaaaaaaa', toHsv(color))
            if (c)
                updateColor(c, { x: b.width * toHsv(color).value[1], y: b.height * (1 - (toHsv(color).value[2] / 100)) })
        }
    }, [canvasRef.current])

    return (
        <div id="canvas-container" className="size-full" ref={containerRef}>
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

