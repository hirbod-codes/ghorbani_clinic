import { useEffect } from "react";
import { Draw } from "../types";

export function RectangleOptions({ setOnDraw, canvasBackground }: { setOnDraw: (onDraw: (draw: Draw) => void) => void, canvasBackground: string }) {
    const onDraw = (draw: Draw) => {
        let color = 'red', lineWidth = 1.2

        if (!draw)
            return

        const { prevPoint, currentPoint, ctx } = draw
        if (!prevPoint || !currentPoint || !ctx)
            return

        const { x: currX, y: currY } = currentPoint
        const lineColor = color

        let startPoint = prevPoint ?? currentPoint

        ctx.beginPath()

        ctx.lineWidth = Number(lineWidth)
        ctx.strokeStyle = lineColor

        // ctx.moveTo(startPoint.x, startPoint.y)
        ctx.strokeRect(startPoint.x, startPoint.y, 10, 10)
    }

    useEffect(() => {
        setOnDraw(() => onDraw)
    }, [])

    return (
        <>
            {/*  */}
        </>
    )
}

