import { cn } from "@/src/react/shadcn/lib/utils"
import { ComponentProps, ReactNode, useRef } from "react"
import { AnimatedSlide } from "../../Animations/AnimatedSlide"
import { motion, MotionProps } from "framer-motion"
import { usePointerOutside } from "../PointerOutside"

export type DrawerProps = {
    children?: ReactNode
    animatedSlideProps?: Omit<ComponentProps<typeof AnimatedSlide>, 'children'>
    containerProps?: MotionProps & ComponentProps<'div'>
    onClose?: () => void | Promise<void>
}

export function Drawer({ children, animatedSlideProps, containerProps, onClose }: DrawerProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    usePointerOutside(containerRef, async (isOutside) => {
        if (isOutside && onClose)
            await onClose()
    }, [animatedSlideProps?.open])

    return (
        <motion.div layout ref={containerRef}  {...containerProps} className={cn(['h-full overflow-auto absolute top-0 left-0'], containerProps?.className)}>
            <AnimatedSlide
                {...animatedSlideProps}
                layout={true}
                inSource={animatedSlideProps?.inSource ?? 'left'}
                outSource={animatedSlideProps?.outSource ?? 'left'}
                fullWidth={animatedSlideProps?.fullWidth ?? false}
            >
                {children}
            </AnimatedSlide>
        </motion.div>
    )
}

