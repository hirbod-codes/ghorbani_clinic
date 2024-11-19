import { Matrix } from "transformation-matrix";
import { Point, Draw, Boundary } from "../types";

export interface Shape {
    transformArgs: DOMMatrix | Matrix;
    isInside(ctx: CanvasRenderingContext2D, point: Point): boolean;
    getBoundary(): Boundary;
    draw(d: Draw): void;
    redraw(d: Draw): void;
}
