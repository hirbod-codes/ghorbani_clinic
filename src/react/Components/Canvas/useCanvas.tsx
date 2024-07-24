import { useEffect, useRef, useState } from 'react'
import { Draw, Point } from './types'

export const useDraw = (draw: ({ ctx, currentPoint, prevPoint }: Draw) => void, onChange?: (empty?: boolean) => void | Promise<void>) => {
    const [empty, setEmpty] = useState(true)
    const [mouseDown, setMouseDown] = useState(false)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const prevPoint = useRef<null | Point>(null)

    const onMouseDown = () => setMouseDown(true)

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

    const onMouseMove = (e: MouseEvent) => {
        if (!mouseDown)
            return
        const currentPoint = computePointInCanvas(e)

        if (!ctx || !currentPoint)
            return

        if (onChange)
            onChange(empty)

        draw({ ctx, currentPoint, prevPoint: prevPoint.current })
        prevPoint.current = currentPoint

        if (empty)
            setEmpty(false)
    }

    const computePointInCanvas = (e: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas)
            return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        return { x, y }
    }

    const onMouseUp = () => {
        setMouseDown(false)
        prevPoint.current = null
    }

    useEffect(() => {
        // Add event listeners
        canvasRef.current?.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        // Remove event listeners
        return () => {
            canvasRef.current?.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [draw])

    return { canvasRef, onMouseDown, clear, empty }
}
