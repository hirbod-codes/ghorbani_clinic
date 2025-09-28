import { Draw, Point } from "../types";
import { SelectionBox } from "./SelectionBox";
import { IShape } from "./IShape";

export class Shapes {
    helper: IShape | undefined = undefined
    shapes: IShape[]
    private selectionIndex: number | undefined

    constructor(shapes: IShape[] = []) {
        this.shapes = shapes
    }

    at(index: number): IShape | undefined {
        return this.shapes.at(index)
    }

    push(shape: IShape): void {
        this.shapes.push(shape)
    }

    pop(): void {
        this.shapes.pop()
    }

    removeAt(index: number): void {
        this.shapes = this.shapes.slice(0, index).concat(this.shapes.slice(index + 1))
    }

    hasSelection(): boolean {
        return this.selectionIndex != undefined && this.selectionIndex >= 0
    }

    select(ctx: CanvasRenderingContext2D, point: Point): void {
        const i = this.findSelectedIndex(ctx, point)
        if (i < 0) {
            this.deselect()
            return
        }

        if (this.selectionIndex !== i)
            this.setSelectionIndex(i)
    }

    private findSelectedIndex(ctx: CanvasRenderingContext2D, point: Point): number {
        const selectionBox = this.getSelectionBox()
        if (selectionBox !== undefined && selectionBox.isInside(ctx, point))
            return this.selectionIndex ?? -1

        for (let i = this.shapes.length - 1; i >= 0; i--)
            if (this.shapes[i].isInside(ctx, point))
                return i

        return -1
    }

    getSelectedShape(): IShape | undefined {
        if (this.selectionIndex === undefined || this.selectionIndex < 0)
            return

        return this.shapes[this.selectionIndex]
    }

    getSelectionIndex(): number | undefined {
        return this.selectionIndex
    }

    private setSelectionIndex(i: number) {
        this.selectionIndex = i
    }

    getSelectionBox(): SelectionBox | undefined {
        if (this.selectionIndex !== undefined && this.shapes[this.selectionIndex] !== undefined)
            return new SelectionBox(this.shapes[this.selectionIndex])
    }

    deselect() {
        this.selectionIndex = undefined
    }

    draw(draw: Draw) {
        if (!draw.canvasRef.current || !draw.ctx)
            throw new Error('Invalid argument provided for draw method of Shapes class.')

        draw.ctx.clearRect(0, 0, draw.canvasRef.current.width, draw.canvasRef.current.height)

        for (let i = 0; i < this.shapes.length; i++) {
            const shape = this.shapes[i]

            shape.redraw(draw)
        }

        if (this.helper)
            this.helper.redraw(draw)

        const selectionBox = this.getSelectionBox()
        if (selectionBox)
            selectionBox.redraw(draw)
    }

    deleteSelectedShape() {
        this.shapes = this.shapes.filter((f, i) => i !== this.selectionIndex)
        this.deselect()
    }
}
