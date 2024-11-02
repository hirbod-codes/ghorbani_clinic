import { MutableRefObject, PointerEvent } from "react";

export type Point = { x: number; y: number }

export type Draw = {
    ctx: CanvasRenderingContext2D
    currentPoint: Point
    prevPoint?: Point
    e: PointerEvent<HTMLCanvasElement>
    canvasRef: MutableRefObject<HTMLCanvasElement | undefined>
}

export type Boundary = Point[]

export enum Position {
    TOP,
    RIGHT,
    BOTTOM,
    LEFT,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT,
}

export type PositionKeys = keyof typeof Position
