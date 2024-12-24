import { motion } from 'framer-motion'
import { variants as SlideVariants } from './variants'
import { getTransitions as slideGetTransitions } from './transitions'
import { AnimatedSlideProps } from '.'
import { useEffect } from 'react'

export type SlideMotionProps = Omit<AnimatedSlideProps & { layout?: boolean | "position" | "size" | "preserve-aspect" | undefined }, 'open' | 'presenceMode'>

export function SlideMotion({ children, motionKey, delay, inSource, outSource, disappear, variants, transition, fullWidth, fullHeight, layout }: SlideMotionProps) {
    variants = variants ?? SlideVariants
    transition = transition ?? slideGetTransitions(delay ?? 0)

    useEffect(() => {
        transition = transition ?? slideGetTransitions(delay ?? 0)
    }, [delay])

    console.log('SlideMotion', { children, motionKey, delay, inSource, outSource, disappear, variants, transition, fullWidth, fullHeight, layout })

    return (
        <motion.div
            key={motionKey}
            initial='enter'
            animate='active'
            exit='exit'
            custom={{ inSource, outSource, disappear }}
            variants={variants}
            transition={transition}
            layout={layout}
            className={`relative overflow-hidden ${fullWidth === true ? 'w-full' : ''} ${fullHeight === true ? 'h-full' : ''}`}
        >
            {children}
        </motion.div>
    )
}
