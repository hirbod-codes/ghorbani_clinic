import { AnimatePresence, Transition, Variants } from 'framer-motion'
import { memo, ReactNode } from 'react'
import { SlideMotion } from './SlideMotion';
import { variants as SlideVariants } from './variants'
import { getTransitions as slideGetTransitions } from './transitions'

export type AnimatedSlideProps = {
    children: ReactNode
    motionKey?: string | number
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

export const AnimatedSlide = memo(function AnimatedSlide({ children, motionKey, delay = 0, disappear = true, inSource = 'left', outSource = 'right', open = true, presenceMode = 'sync', fullHeight = true, fullWidth = true, variants, transition }: AnimatedSlideProps) {
    delay = 0
    disappear = true
    inSource = 'left'
    outSource = 'right'
    open = true
    presenceMode = 'sync'
    fullHeight = true
    fullWidth = true
    variants = variants ?? SlideVariants
    transition = transition ?? slideGetTransitions(delay)

    return (
        <div className={`${fullWidth ? 'w-full' : ''} ${fullHeight ? 'h-full' : ''} overflow-hidden`}>
            <div className={`relative ${fullWidth ? 'w-full' : ''} ${fullHeight ? 'h-full' : ''}`}>
                <AnimatePresence mode={presenceMode}>
                    {open &&
                        <SlideMotion {...{ motionKey, inSource, outSource, disappear, variants, transition, fullWidth, fullHeight }}>
                            {children}
                        </SlideMotion>
                    }
                </AnimatePresence>
            </div>
        </div>
    )
})
