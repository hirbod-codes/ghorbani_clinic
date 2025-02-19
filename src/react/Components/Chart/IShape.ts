import { CanvasStyleOptions, HoverOptions, Label } from "./index.d";
import { EasingName } from "../Animations/easings";
import { Dimensions } from "./index.d";
import { Point } from "../../Lib/Math";
import { ComponentProps, ReactNode } from "react";

export interface IShape {
    initial?: number
    passed?: number
    previousDx?: number
    control?: number | boolean[]
    ease?: EasingName
    duration?: number
    delay?: number
    stop?: boolean
    runCounts?: number
    offscreenCanvas?: HTMLCanvasElement
    styleOptions?: CanvasStyleOptions
    canvasCoords?: Dimensions
    onCanvasCoordsChange?: (canvasCoords: Dimensions) => void
    draw: (dx: number, ctx: CanvasRenderingContext2D, shape: IShape) => void
    doNotCache?: boolean
    hoverOptions?: HoverOptions
    xLabels?: Label[]
    yLabels?: Label[]
}
