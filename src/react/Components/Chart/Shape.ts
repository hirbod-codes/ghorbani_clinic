export class Shape {
    private lock: boolean = false
    /**
     * for value:
     * 
     * if number, if -1, shape is not drawn, otherwise it's animated as many time as it's value
     * 
     * if array, if the value of animation run index in this array is true it will animate and if false it will be drawn only (not animated), and for any value other than boolean it will not be drawn
     * 
     * @default 0
     */
    animationsController: { [k: string | number]: number | any[] } = {}
    animationsDuration: { [k: string | number]: number } = {}
    animationsRunCounts: { [k: string | number]: number } = {}
    private animationsPreviousDx: { [k: string | number]: number } = {}
    private animationsStop: { [k: string | number]: boolean } = {}
    private animationsPassed: { [k: string | number]: number } = {}
    private animationsFirstTimestamp: { [k: string | number]: number } = {}

    protected setDefaults(key: number | string) {
        while (this.lock === true)
            continue

        this.lock = true
        if (this.animationsController[key] === undefined)
            this.animationsController[key] = 0

        if (this.animationsRunCounts[key] === undefined)
            this.animationsRunCounts[key] = 1

        if (this.animationsPreviousDx[key] === undefined)
            this.animationsPreviousDx[key] = 0

        if (this.animationsDuration[key] === undefined)
            this.animationsDuration[key] = 0

        if (this.animationsStop[key] === undefined)
            this.animationsStop[key] = false

        if (this.animationsPassed[key] === undefined)
            this.animationsPassed[key] = 0

        if (this.animationsFirstTimestamp[key] === undefined)
            this.animationsFirstTimestamp[key] = 0

        this.lock = false
    }

    resetAnimation(key: string | number) {
        while (this.lock === true)
            continue

        this.lock = true

        this.animationsRunCounts[key] = 1
        this.animationsPreviousDx[key] = 0
        this.animationsStop[key] = false
        this.animationsPassed[key] = 0
        this.animationsFirstTimestamp[key] = 0
        this.lock = false
    }

    play(key: number | string) {
        if (key !== undefined)
            this.animationsStop[key] = false
    }

    pause(key?: number | string) {
        if (key === undefined)
            Object.keys(this.animationsStop).forEach(e => this.animationsStop[e] = true)
        else
            this.animationsStop[key] = true
    }

    animate(t: DOMHighResTimeStamp, animationKey: number | string, animationCallback: (dx: number) => void) {
        this.setDefaults(animationKey)

        if (this.animationsDuration[animationKey] === undefined || this.animationsDuration[animationKey] <= 0)
            return

        if (this.animationsFirstTimestamp[animationKey] === 0)
            this.animationsFirstTimestamp[animationKey] = t

        this.animationsPassed[animationKey] = t - this.animationsFirstTimestamp[animationKey]

        let dx = this.animationsPreviousDx[animationKey]

        if (!this.animationsStop[animationKey]) {
            dx = (this.animationsPassed[animationKey] % this.animationsDuration[animationKey]) / this.animationsDuration[animationKey]

            if (this.animationsPreviousDx[animationKey] > dx)
                this.animationsRunCounts[animationKey] += 1
            this.animationsPreviousDx[animationKey] = dx

            let i = Math.floor(this.animationsPassed[animationKey] / this.animationsDuration[animationKey])

            let tmp = this.shouldAnimate(this.animationsController[animationKey], this.animationsRunCounts[animationKey], i, dx)
            if (tmp === undefined)
                return

            dx = tmp
        }

        animationCallback(dx)
    }

    private shouldAnimate(controller: number | any[], animationRunsCount: number, animationRunIndex: number, dx: number): number | undefined {
        if (typeof controller === 'number')
            if (controller < 0)
                return
            else if (controller === 0)
                return 1
            else if (animationRunsCount <= controller)
                return dx
            else
                return 1
        else if (Array.isArray(controller))
            if (controller[animationRunIndex] === true)
                return dx
            else if (controller[animationRunIndex] === false)
                return 1
            else
                return
    }
}
