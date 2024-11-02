import { Point, Draw, Boundary } from "../types";

export interface Shape {
    isSelected(point: Point): boolean;
    draw(d: Draw): void;
    redraw(d: Draw): void;
    getBoundary(): Boundary;
}
