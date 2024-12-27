import { cn } from "@/src/react/shadcn/lib/utils"
import { ComponentProps, PointerEvent, ReactNode, useEffect, useRef, useState } from "react"

export function Slider({ defaultProgress, onProgressChange, containerProps, sliderProps, children }: { defaultProgress?: number, onProgressChange?: (progress: number) => void | Promise<void>, containerProps?: ComponentProps<'div'>, sliderProps?: ComponentProps<'div'>, children?: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const sliderRef = useRef<HTMLDivElement>(null)

    const [pointerDown, setPointerDown] = useState<boolean>(false)

    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        setPointerDown(true)

        if (!pointerDown || !containerRef.current || !sliderRef.current)
            return

        const cBoundaries = containerRef.current.getBoundingClientRect()
        const sBoundaries = sliderRef.current.getBoundingClientRect()

        const progressLength = Math.min(Math.max(cBoundaries.left, e.clientX), cBoundaries.right) - cBoundaries.left
        const left = progressLength - (sBoundaries.width / 2)

        sliderRef.current.style.left = `${left}px`

        if (onProgressChange)
            onProgressChange(100 * (progressLength / cBoundaries.width))
    }

    const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!pointerDown || !containerRef.current || !sliderRef.current)
            return

        const cBoundaries = containerRef.current.getBoundingClientRect()
        const sBoundaries = sliderRef.current.getBoundingClientRect()

        const progressLength = Math.min(Math.max(cBoundaries.left, e.clientX), cBoundaries.right) - cBoundaries.left
        const left = progressLength - (sBoundaries.width / 2)

        sliderRef.current.style.left = `${left}px`

        if (onProgressChange)
            onProgressChange(100 * (progressLength / cBoundaries.width))
    }

    const onPointerUp = (e: PointerEvent<HTMLDivElement>) => setPointerDown(false)

    useEffect(() => {
        if (sliderRef.current && containerRef.current && (defaultProgress ?? 0) <= 100) {
            const cBoundaries = containerRef.current.getBoundingClientRect()
            const sBoundaries = sliderRef.current.getBoundingClientRect()

            if (!sliderRef.current.style.top || sliderRef.current.style.top === '0px')
                sliderRef.current.style.top = `${(cBoundaries.height - sBoundaries.height) / 2}px`

            sliderRef.current.style.left = `${(cBoundaries.width * ((defaultProgress ?? 0) / 100)) - (sBoundaries.width / 2)}px`
        }
    }, [sliderRef.current, containerRef.current])

    console.log('Slider', { containerRef: containerRef.current, sliderRef: sliderRef.current, pointerDown, controlledProgress: defaultProgress, containerProps, sliderProps })

    return (
        <div id="progressContainer" ref={containerRef} {...containerProps} className={cn(["w-full relative"], containerProps?.className)} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
            {children}
            <div id="thumb" ref={sliderRef} {...sliderProps} className={cn(["size-[5mm] border rounded-full absolute top-0 left-0 bg-background"], sliderProps?.className)} />
        </div>
    )
}
