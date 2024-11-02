import { Shapes } from "../Shapes/Shapes"
import { Draw } from "../types"

export type SelectToolProps = {
    shapes: Shapes,
    canvasBackground: string,
    setOnDraw: (onDraw: (draw: Draw) => void) => void,
    setOnUpHook: (setOnUpHook: (draw: Draw) => void) => void,
    setOnDownHook: (setOnDownHook: (draw: Draw) => void) => void,
}

export function SelectTool({ shapes, canvasBackground, setOnDraw, setOnUpHook, setOnDownHook }: SelectToolProps) {
    return (
        <>
        </>
    )
}

