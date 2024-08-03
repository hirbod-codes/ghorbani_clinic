import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { Draw, Point } from './types'

export const useDraw = (draw: ({ ctx, currentPoint, prevPoint }: Draw) => void, canvasRef: MutableRefObject<HTMLCanvasElement>, onChange?: (empty?: boolean) => void | Promise<void>) => {
    const [empty, setEmpty] = useState(true)
    const [mouseDown, setMouseDown] = useState(false)

    const prevPoint = useRef<null | Point>(null)

    const onDown = () => setMouseDown(true)

    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        if (!ctx)
            return

        if (!empty)
            if (onChange)
                onChange(true)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!empty)
            setEmpty(true)
    }


    const move = (point: Point) => {
        if (!point)
            return

        if (onChange)
            onChange(empty)

        draw({ ctx, currentPoint: point, prevPoint: prevPoint.current })
        prevPoint.current = point

        if (empty)
            setEmpty(false)
    }

    const onMouseMove = (e: TouchEvent) => onMove(e)

    const onTouchMove = (e: TouchEvent) => onMove(e, false)

    const onMove = (e: MouseEvent | TouchEvent, isMousePointer = true) => {
        if (!mouseDown)
            return
        if (!ctx)
            return

        if (isMousePointer)
            move(computePointInCanvas((e as MouseEvent).clientX, (e as MouseEvent).clientY))
        else
            for (const touch of (e as TouchEvent).touches)
                move(computePointInCanvas(touch.clientX, touch.clientY))
    }

    const computePointInCanvas = (x: number, y: number): Point => {
        const canvas = canvasRef.current

        const rect = canvas.getBoundingClientRect()

        y = y - rect.top
        x = x - rect.left

        return { x, y }
    }

    const onUp = () => {
        setMouseDown(false)
        prevPoint.current = null
    }

    useEffect(() => {
        // Add event listeners
        canvasRef.current?.addEventListener('mousemove', onMouseMove)
        canvasRef.current?.addEventListener('touchmove', onTouchMove)
        window.addEventListener('mouseup', onUp)
        window.addEventListener('touchend', onUp)

        // Remove event listeners
        return () => {
            canvasRef.current?.removeEventListener('mousemove', onMouseMove)
            canvasRef.current?.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('mouseup', onUp)
            window.removeEventListener('touchend', onUp)
        }
    }, [draw])

    return { onDown, clear, empty }
}
