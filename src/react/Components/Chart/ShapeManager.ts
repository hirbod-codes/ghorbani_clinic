import { Dimensions } from "./index.d"
import { getEasingFunction } from "../Animations/easings"
import { IShape } from "./IShape"

export class ShapeManager {
    private static shapes: { [k: string]: IShape[] } = {}
    private static canvases: { [k: string]: { ctx: CanvasRenderingContext2D, dimensions: Dimensions } } = {}
    private static requestAnimationFrameId: number | undefined = undefined

    private static playingAnimationGroups: string[] = []

    static addShapeGroup(key: string, animations: IShape[], ctx: CanvasRenderingContext2D, dimensions: Dimensions): void {
        ShapeManager.shapes[key] = animations
        ShapeManager.canvases[key] = { ctx, dimensions }
    }

    static pauseAnimations(groupKey: string) {
        if (cancelAnimationFrame === undefined)
            throw new Error('cancelAnimationFrame function is undefined')

        if (groupKey.trim() === 'all' || groupKey.trim() === '*') {
            if (ShapeManager.requestAnimationFrameId !== undefined) {
                cancelAnimationFrame(ShapeManager.requestAnimationFrameId)
                ShapeManager.requestAnimationFrameId = undefined
            }
        } else if (this.playingAnimationGroups.includes(groupKey.trim()))
            this.playingAnimationGroups = this.playingAnimationGroups.filter(f => f !== groupKey)
    }

    /**
     * 
     * @param endAnimations stop calling painting shapes if there is no running animation
     */
    static runAnimations(groupKey: string, endAnimations = true) {
        console.log('runAnimations', ShapeManager.requestAnimationFrameId, groupKey, endAnimations)

        if (requestAnimationFrame === undefined)
            throw new Error('requestAnimationFrame function is undefined')

        if (groupKey.trim() === 'all' || groupKey.trim() === '*') {
            for (const key in this.shapes)
                if (Object.prototype.hasOwnProperty.call(this.shapes, key))
                    if (!this.playingAnimationGroups.includes(groupKey))
                        this.playingAnimationGroups.push(key)
        } else if (!this.playingAnimationGroups.includes(groupKey.trim()))
            this.playingAnimationGroups.push(groupKey)

        if (ShapeManager.requestAnimationFrameId === undefined)
            ShapeManager.requestAnimationFrameId = requestAnimationFrame((t) => ShapeManager.animate(t, endAnimations))
    }

    private static animate(t: DOMHighResTimeStamp, endAnimations = true) {
        console.log('animate', this.playingAnimationGroups)

        let draw = false
        for (const groupKey in ShapeManager.shapes)
            if (Object.prototype.hasOwnProperty.call(ShapeManager.shapes, groupKey)) {
                console.log('groupKey', { [groupKey]: ShapeManager.shapes[groupKey] })
                console.log('groupKey', { [groupKey]: ShapeManager.canvases[groupKey] })

                if (!this.playingAnimationGroups.includes(groupKey))
                    continue

                ShapeManager.canvases[groupKey].ctx.clearRect(0, 0, ShapeManager.canvases[groupKey].dimensions.width, ShapeManager.canvases[groupKey].dimensions.height)

                for (const animation of ShapeManager.shapes[groupKey]) {
                    console.log({ animation })

                    let useCache: boolean = false
                    let dx: number | undefined = undefined

                    if (animation.passed && animation.passed <= (animation.delay ?? 0))
                        continue

                    if (animation.initial === undefined)
                        animation.initial = t

                    animation.passed = t - animation.initial

                    if (animation.duration === undefined || animation.duration <= 0) {
                        if (typeof animation.control === 'number' && animation.control >= 0)
                            useCache = true
                        else if (Array.isArray(animation.control) && animation.control.length > 0)
                            useCache = true
                    } else if (animation.stop === true) {
                        dx = animation.previousDx ?? 0
                        draw = true
                    } else {
                        dx = (animation.passed % animation.duration) / animation.duration

                        let i = Math.floor(animation.passed / animation.duration)

                        let tmp = this.shouldAnimate(animation, (animation.previousDx ?? 0) > dx ? (animation.runCounts ?? 1) + 1 : (animation.runCounts ?? 1), i, dx)
                        if (tmp === false)
                            continue

                        if (tmp === true)
                            useCache = true
                        else {
                            dx = tmp

                            if ((animation.previousDx ?? 0) > dx)
                                if (animation.runCounts !== undefined)
                                    animation.runCounts += 1
                                else
                                    animation.runCounts = 2
                            animation.previousDx = dx

                            draw = true
                        }
                    }

                    if (useCache === true) {
                        if (animation.doNotCache === true)
                            animation.draw(1, ShapeManager.canvases[groupKey].ctx, animation)
                        else
                            ShapeManager.animateFromCache(animation, ShapeManager.canvases[groupKey].ctx, ShapeManager.canvases[groupKey].dimensions)
                    } else if (dx !== undefined)
                        animation.draw(getEasingFunction(animation.ease ?? 'easeInSine')(dx), ShapeManager.canvases[groupKey].ctx, animation)
                }
            }

        if (draw === true && endAnimations === true)
            ShapeManager.requestAnimationFrameId = requestAnimationFrame((t) => ShapeManager.animate(t, endAnimations))
        else
            ShapeManager.requestAnimationFrameId = undefined
    }

    private static animateFromCache(animation: IShape, ctx: CanvasRenderingContext2D, dimensions: Dimensions) {
        console.log('animateFromCache')

        if (animation.offscreenCanvas === undefined) {
            let canvas = document.createElement('canvas')
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            animation.draw(1, canvas.getContext('2d')!, animation)
            animation.offscreenCanvas = canvas
        }

        ctx.drawImage(animation.offscreenCanvas, 0, 0)
    }

    private static shouldAnimate(animation: IShape, animationRunsCount: number, animationRunIndex: number, dx: number): number | boolean {
        console.log('shouldAnimate')

        if (typeof animation.control === 'number')
            if (animation.control < 0)
                return false
            else if (animation.control === 0)
                return true
            else if (animationRunsCount <= animation.control)
                return dx
            else
                return true
        else if (Array.isArray(animation.control))
            if (animation.control[animationRunIndex] === true)
                return dx
            else if (animation.control[animationRunIndex] === false)
                return true
            else
                return false
        else
            throw new Error('Invalid controller provided for chart animations!')
    }
}
