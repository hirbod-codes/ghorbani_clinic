import { cn } from "@/src/react/shadcn/lib/utils"
import { ComponentProps, ReactNode, useRef } from "react"
import { AnimatedSlide } from "../../Animations/AnimatedSlide"
import { motion, MotionProps } from "framer-motion"
import { usePointerOutside } from "../PointerOutside"

export type DrawerProps = {
    children?: ReactNode
    animatedSlideProps?: Omit<ComponentProps<typeof AnimatedSlide>, 'children'>
    onClose?: () => void | Promise<void>
}

export function Drawer({ children, animatedSlideProps,  onClose }: DrawerProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    usePointerOutside(containerRef, async (isOutside) => {
        if (isOutside && onClose)
            await onClose()
    }, [animatedSlideProps?.open])

    return (
        // <motion.div layout ref={containerRef}  {...containerProps} className={cn(['h-full overflow-auto absolute top-0 left-0 pointer-events-none *:pointer-events-auto border border-green-500'], containerProps?.className)}>
        <AnimatedSlide
            {...animatedSlideProps}
            layout={true}
            containerRef={containerRef}
            inSource={animatedSlideProps?.inSource ?? 'left'}
            outSource={animatedSlideProps?.outSource ?? 'left'}
            fullWidth={animatedSlideProps?.fullWidth ?? false}
        >
            {/* <div ref={containerRef} {...containerProps} className={cn(['h-full overflow-auto absolute top-0 left-0 pointer-events-none *:pointer-events-auto border border-green-500'], containerProps?.className)}> */}
            {children}
            {/* </div> */}
        </AnimatedSlide>
        // </motion.div>
    )
}

