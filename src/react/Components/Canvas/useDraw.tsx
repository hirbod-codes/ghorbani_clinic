import { MouseEvent, MutableRefObject, TouchEvent, useEffect, useRef, useState } from 'react'
import { Draw, Point } from './types'
import { isCanvasEmpty } from './helpers'

export const useDraw = (draw: ({ ctx, currentPoint, prevPoint }: Draw) => void, canvasRef: MutableRefObject<HTMLCanvasElement>, onChange?: (empty?: boolean) => void | Promise<void>) => {
    const [empty, setEmpty] = useState(true)
    const [mouseDown, setMouseDown] = useState(false)

    const prevPoint = useRef<null | Point>(null)

    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })

    const onDown = () => setMouseDown(true)

    const onUp = () => {
        setMouseDown(false)
        prevPoint.current = null
    }

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        if (!ctx)
            return

        const shouldCallOnChange = !isCanvasEmpty(canvasRef)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (shouldCallOnChange && onChange)
            onChange(true)

        if (shouldCallOnChange)
            setEmpty(true)
    }

    const onMouseMove = (e: MouseEvent) => onMove(e)

    const onTouchMove = (e: TouchEvent) => onMove(e, false)

    const onMove = (e: MouseEvent | TouchEvent, isMousePointer = true) => {
        if (!mouseDown)
            return
        if (!ctx)
            return

        if (isMousePointer)
            move(computePointInCanvas((e as MouseEvent).clientX, (e as MouseEvent).clientY))
        else
            for (let i = 0; i < (e as TouchEvent).touches.length; i++) {
                const touch = (e as TouchEvent).touches[i]
                move(computePointInCanvas(touch.clientX, touch.clientY))
            }
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

    const computePointInCanvas = (x: number, y: number): Point => {
        const rect = canvasRef.current.getBoundingClientRect()

        x = x - rect.left
        y = y - rect.top

        return { x, y }
    }

    // useEffect(() => {
    //     // Add event listeners
    //     canvasRef.current?.addEventListener('mousemove', onMouseMove)
    //     canvasRef.current?.addEventListener('touchmove', onTouchMove)
    //     window.addEventListener('mouseup', onUp)
    //     window.addEventListener('touchend', onUp)

    //     // Remove event listeners
    //     return () => {
    //         canvasRef.current?.removeEventListener('mousemove', onMouseMove)
    //         canvasRef.current?.removeEventListener('touchmove', onTouchMove)
    //         window.removeEventListener('mouseup', onUp)
    //         window.removeEventListener('touchend', onUp)
    //     }
    // }, [draw])

    return { onDown, clear, empty, onUp, onMouseMove, onTouchMove }
}
