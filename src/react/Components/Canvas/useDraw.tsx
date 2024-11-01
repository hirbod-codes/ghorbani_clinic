import { MutableRefObject, PointerEvent, useEffect, useRef, useState } from 'react'
import { Draw, Point } from './types'
import { isCanvasEmpty } from './helpers'

export const useDraw = (
    canvasRef: MutableRefObject<HTMLCanvasElement | undefined>,
    onChange?: (empty?: boolean) => void | Promise<void>,
    onMoveHook?: (draw: Draw) => void,
    onPointerDownHook?: (draw: Draw) => void,
    onPointerUpHook?: (draw: Draw) => void,
) => {
    const [empty, setEmpty] = useState(true)
    const [pointerDown, setPointerDown] = useState(false)

    const prevPoint = useRef<null | Point>(null)

    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })

    const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setPointerDown(true)

        if (onPointerDownHook) {
            const point = computePointInCanvas(e.clientX, e.clientY)
            onPointerDownHook({ ctx, currentPoint: point, prevPoint: prevPoint.current, e })
        }
    }

    const onUp = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()
        prevPoint.current = null
        setPointerDown(false)

        if (onPointerUpHook) {
            const point = computePointInCanvas(e.clientX, e.clientY)
            onPointerUpHook({ ctx, currentPoint: point, prevPoint: prevPoint.current, e })
        }
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

    const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!pointerDown)
            return
        if (!ctx)
            return

        const point = computePointInCanvas(e.clientX, e.clientY)

        if (!point || !ctx || !onMoveHook)
            return

        if (onChange)
            onChange(empty)

        onMoveHook({ ctx, currentPoint: point, prevPoint: prevPoint.current, e })
        prevPoint.current = point

        if (empty)
            setEmpty(false)
    }

    const computePointInCanvas = (x: number, y: number): Point | null => {
        if (!canvasRef.current)
            return null

        const rect = canvasRef.current.getBoundingClientRect()

        x = x - rect.left
        y = y - rect.top

        return { x, y }
    }

    const preventDefault = (e: PointerEvent | MouseEvent | TouchEvent) => { e.preventDefault(); e.stopPropagation() }

    // useEffect(() => {
    //     console.log('useDraw', 'useEffect1');

    //     canvasRef.current?.addEventListener('mousedown', preventDefault, { passive: false })
    //     canvasRef.current?.addEventListener('touchstart', preventDefault, { passive: false })
    //     canvasRef.current?.addEventListener('pointerdown', onDown)

    //     canvasRef.current?.addEventListener('pointermove', onMove)
    //     canvasRef.current?.addEventListener('mousemove', preventDefault)
    //     canvasRef.current?.addEventListener('touchmove', preventDefault)

    //     canvasRef.current?.addEventListener('mouseup', preventDefault, { passive: false })
    //     canvasRef.current?.addEventListener('touchend', preventDefault, { passive: false })
    //     canvasRef.current?.addEventListener('pointerup', onUp)

    //     return () => {
    //         canvasRef.current?.removeEventListener('mousedown', preventDefault)
    //         canvasRef.current?.removeEventListener('touchstart', preventDefault)
    //         canvasRef.current?.removeEventListener('pointerdown', onDown)

    //         canvasRef.current?.removeEventListener('pointermove', onMove)
    //         canvasRef.current?.removeEventListener('mousemove', preventDefault)
    //         canvasRef.current?.removeEventListener('touchmove', preventDefault)

    //         canvasRef.current?.removeEventListener('mouseup', preventDefault)
    //         canvasRef.current?.removeEventListener('touchend', preventDefault)
    //         canvasRef.current?.removeEventListener('pointerup', onUp)
    //     }
    // }, [draw, canvasRef, canvasRef.current])

    return { onDown, clear, empty, onUp, onMove, pointerDown }
}
