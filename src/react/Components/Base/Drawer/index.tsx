import { ComponentProps, ReactNode, RefObject, useRef } from "react"
import { AnimatedSlide } from "../../Animations/AnimatedSlide"
import { usePointerOutside } from "../PointerOutside"

export type DrawerProps = {
    children?: ReactNode
    containerRef?: RefObject<HTMLDivElement>
    animatedSlideProps?: Omit<ComponentProps<typeof AnimatedSlide>, 'children'>
    onClose?: () => void | Promise<void>
}

export function Drawer({ containerRef, children, animatedSlideProps, onClose }: DrawerProps) {
    usePointerOutside(containerRef, async (isOutside) => {
        if (isOutside && onClose)
            await onClose()
    }, [animatedSlideProps?.open])

    return (
        <AnimatedSlide
            {...animatedSlideProps}
            inSource={animatedSlideProps?.inSource ?? 'left'}
            outSource={animatedSlideProps?.outSource ?? 'left'}
        >
            {children}
        </AnimatedSlide>
    )
}

