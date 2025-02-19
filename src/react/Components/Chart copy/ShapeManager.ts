interface AnimationControls {
    initial?: number
    passed?: number
    previousDx?: number
    control?: number | boolean[]
    duration?: number
    delay?: number
    stop?: boolean
    runCounts?: number
    offscreenCanvas: HTMLCanvasElement
    offscreenCanvasCoords: { x: number, y: number, width: number, height: number }
    draw: (dx: number, ctx: CanvasRenderingContext2D) => void
}

export class ShapeManager {
    private static animations: { [k: string]: AnimationControls[] }
    private static groupsContext: { [k: string]: CanvasRenderingContext2D } = {}
    private static requestAnimationFrameId: number | undefined = undefined

    static addShapeGroup(key: string, animations: AnimationControls[], ctx: CanvasRenderingContext2D): void {
        ShapeManager.animations[key] = animations
        ShapeManager.groupsContext[key] = ctx
    }

    static pauseAnimations() {
        if (cancelAnimationFrame === undefined)
            throw new Error('cancelAnimationFrame function is undefined')

        if (ShapeManager.requestAnimationFrameId !== undefined) {
            cancelAnimationFrame(ShapeManager.requestAnimationFrameId)
            ShapeManager.requestAnimationFrameId = undefined
        }
    }

    /**
     * 
     * @param endAnimations stop calling painting shapes if there is no running animation
     */
    static runAnimations(endAnimations = true) {
        if (requestAnimationFrame === undefined)
            throw new Error('requestAnimationFrame function is undefined')

        if (ShapeManager.requestAnimationFrameId === undefined)
            requestAnimationFrame((t) => ShapeManager.animate(t, endAnimations))
    }

    private static animate(t: DOMHighResTimeStamp, endAnimations = true) {
        let draw = false
        for (const groupKey in ShapeManager.animations)
            if (Object.prototype.hasOwnProperty.call(ShapeManager.animations, groupKey))
                for (const animation of ShapeManager.animations[groupKey]) {
                    let useCache = false

                    if (!animation.initial)
                        animation.initial = t

                    animation.passed = t - animation.initial

                    if (animation.passed <= (animation.delay ?? 0))
                        continue

                    if (animation.duration === undefined || animation.duration <= 0) {
                        if (typeof animation.control === 'number' && animation.control >= 0)
                            useCache = true
                        else if (Array.isArray(animation.control) && animation.control.length > 0)
                            useCache = true
                    } else if (animation.stop === true) {
                        animation.draw(animation.previousDx ?? 0, ShapeManager.groupsContext[groupKey])
                        draw = true
                    } else {
                        let dx = (animation.passed % animation.duration) / animation.duration

                        let i = Math.floor(animation.passed / animation.duration)

                        let tmp = this.shouldAnimate(animation.control ?? 0 as any, (animation.previousDx ?? 0) > dx ? (animation.runCounts ?? 1) + 1 : (animation.runCounts ?? 1), i, dx)
                        if (tmp === false)
                            continue

                        if (tmp === true)
                            useCache = true
                        else {
                            if ((animation.previousDx ?? 0) > dx)
                                if (animation.runCounts !== undefined)
                                    animation.runCounts += 1
                                else
                                    animation.runCounts = 2
                            animation.previousDx = dx

                            animation.draw(tmp, ShapeManager.groupsContext[groupKey])

                            draw = true
                        }
                    }

                    if (useCache === true)
                        ShapeManager.animateFromCache(animation, ShapeManager.groupsContext[groupKey])
                }

        if (draw === true && endAnimations === true)
            requestAnimationFrame((t) => ShapeManager.animate(t, endAnimations))
    }

    private static animateFromCache(animation: AnimationControls, ctx: CanvasRenderingContext2D) {
        if (animation.offscreenCanvas === undefined) {
            let canvas = document.createElement('canvas')
            canvas.width = animation.offscreenCanvasCoords.width;
            canvas.height = animation.offscreenCanvasCoords.height;
            animation.draw(1, canvas.getContext('2d')!)
            animation.offscreenCanvas = canvas
        } else
            ctx.drawImage(animation.offscreenCanvas, animation.offscreenCanvasCoords.x, animation.offscreenCanvasCoords.y)
    }

    private static shouldAnimate(animation: AnimationControls, animationRunsCount: number, animationRunIndex: number, dx: number): number | boolean {
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
