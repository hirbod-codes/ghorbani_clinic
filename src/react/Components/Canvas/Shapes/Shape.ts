import { Matrix } from "transformation-matrix";
import { Draw, Boundary } from "../types";
import { Point } from "../../../Lib/Math";
import { SelectionBox } from "./SelectionBox";

export interface Shape {
    getCenterPoint(): Point;
    updateWidth(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): void;
    updateHeight(prevPoint: Point, currentPoint: Point, selectionBox: SelectionBox, selectedHandler: string): void;
    translate(previousPoint: Point, currentPoint: Point): void;
    rotate(previousPoint: Point, currentPoint: Point): void;
    transformArgs: DOMMatrix | Matrix;
    isInside(ctx: CanvasRenderingContext2D, point: Point): boolean;
    getBoundary(): Boundary;
    draw(d: Draw): void;
    redraw(d: Draw): void;
}
