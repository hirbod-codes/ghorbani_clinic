import { useRef } from "react"

export function useAnimate() {
    const animation = useRef<{ id?: number, stop?: boolean }>()

    const animate = (t: DOMHighResTimeStamp, animationCallback?: (t: DOMHighResTimeStamp) => void) => {
        if (animation.current === undefined)
            return

        if (animationCallback)
            animationCallback(t)

        if (animation.current.stop === true && animation.current.id !== undefined)
            cancelAnimationFrame(animation.current.id)
        else
            animation.current!.id = requestAnimationFrame((t) => animate(t, animationCallback))
    }

    const stop = () => animation.current !== undefined ? animation.current.stop = true : undefined

    const play = (animationCallback?: (dx: number) => void) => {
        if (animation.current?.stop === false)
            return

        if (animation.current === undefined)
            animation.current = {
                stop: false
            }

        animation.current!.id = requestAnimationFrame((t) => animate(t, animationCallback))
    }

    return { play, stop }
}
