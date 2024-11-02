import { Draw } from "../types";
import { SelectionBox } from "./SelectionBox";
import { Shape } from "./Shape";

export class Shapes {
    helper: Shape = undefined
    selectionBox: Shape = undefined
    shapes: Shape[]
    private selectionIndex: number

    constructor(shapes: Shape[] = []) {
        this.shapes = shapes
    }

    at(index: number): Shape {
        return this.shapes.at(index)
    }

    push(shape: Shape): void {
        if (this.selectionIndex !== undefined && this.shapes[this.shapes.length - 1] instanceof SelectionBox && shape instanceof SelectionBox)
            return

        this.shapes.push(shape)
    }

    pop(): void {
        this.shapes.pop()
    }

    removeAt(index: number): void {
        this.shapes = this.shapes.slice(0, index).concat(this.shapes.slice(index + 1))
    }

    hasSelection(): boolean {
        return this.selectionIndex != undefined
    }

    select(d: Draw): void {
        if (this.hasSelection())
            return

        let i = this.shapes.length - 1
        for (; i >= 0; i--) {
            const shape = this.shapes[i];

            if (shape.isSelected(d.currentPoint)) {
                break
            }
        }

        if (i < 0)
            return

        this.selectionIndex = i
    }

    deselect() {
        this.selectionIndex = undefined
        if (this.shapes[this.shapes.length - 1] instanceof SelectionBox)
            this.shapes.pop()
    }

    draw(draw: Draw) {
        draw.ctx.clearRect(0, 0, draw.canvasRef.current.width, draw.canvasRef.current.height)

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i]

            shape.redraw(draw)
        }

        if (this.helper)
            this.helper.redraw(draw)

        if (this.selectionBox)
            this.selectionBox.redraw(draw)
    }
}
