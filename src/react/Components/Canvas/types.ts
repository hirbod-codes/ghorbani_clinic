import { MutableRefObject, PointerEvent } from "react";

export type Point = { x: number; y: number }

export type Draw = {
    ctx: CanvasRenderingContext2D
    currentPoint: Point
    prevPoint?: Point
    e?: PointerEvent<HTMLCanvasElement>
    canvasRef: MutableRefObject<HTMLCanvasElement | null>
}

export type Position = 'topLeft' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left'

export type Boundary = { [key in Position]: Point };

export type Boundaries = { [key in Position]: Boundary };
