import { AnimatePresence, MotionProps, Transition, Variants } from 'framer-motion'
import { ComponentProps, memo, ReactNode, RefObject } from 'react'
import { SlideMotion } from './SlideMotion';
import { variants as SlideVariants } from './variants'
import { getTransitions as slideGetTransitions } from './transitions'

export type AnimatedSlideProps = {
    children: ReactNode
    containerRef?: RefObject<HTMLDivElement>
    containerProps?: MotionProps & ComponentProps<'div'>
    motionKey?: string | number
    layout?: boolean | "position" | "size" | "preserve-aspect" | undefined
    delay?: number
    disappear?: boolean
    inSource?: 'left' | 'top' | 'bottom' | 'right'
    outSource?: 'left' | 'top' | 'bottom' | 'right'
    open?: boolean
    presenceMode?: 'sync' | 'wait' | 'popLayout' | undefined
    fullHeight?: boolean
    fullWidth?: boolean
    variants?: Variants
    transition?: Transition
}

export const AnimatedSlide = memo(function AnimatedSlide({ children, containerRef, containerProps, motionKey, layout, delay = 0, disappear = true, inSource = 'left', outSource = 'right', open = true, presenceMode = 'sync', fullHeight = true, fullWidth = true, variants, transition }: AnimatedSlideProps) {
    delay = delay ?? 0
    disappear = disappear ?? true
    inSource = inSource ?? 'left'
    outSource = outSource ?? 'right'
    open = open ?? true
    presenceMode = presenceMode ?? 'sync'
    fullHeight = fullHeight ?? true
    fullWidth = fullWidth ?? true
    variants = variants ?? SlideVariants
    transition = transition ?? slideGetTransitions(delay)

    return (
        <AnimatePresence mode={presenceMode}>
            {open &&
                <SlideMotion {...{ motionKey, layout, containerRef, containerProps, inSource, outSource, disappear, variants, transition, fullWidth, fullHeight }}>
                    {children}
                </SlideMotion>
            }
        </AnimatePresence>
    )
})
