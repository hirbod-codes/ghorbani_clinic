import { Point, Draw, Boundary } from "../types";

export interface Shape {
    transformArgs: [number, number, number, number, number, number]
    rotationDegree: number;
    isInside(ctx: CanvasRenderingContext2D, point: Point): boolean;
    getBoundary(): Boundary;
    draw(d: Draw): void;
    redraw(d: Draw): void;
}
