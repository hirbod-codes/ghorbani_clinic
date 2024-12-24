import { motion, MotionProps } from 'framer-motion'
import { variants as SlideVariants } from './variants'
import { getTransitions as slideGetTransitions } from './transitions'
import { AnimatedSlideProps } from '.'
import { ComponentProps, useEffect } from 'react'
import { cn } from '@/src/react/shadcn/lib/utils'

export type SlideMotionProps = Omit<AnimatedSlideProps & { layout?: boolean | "position" | "size" | "preserve-aspect" | undefined }, 'open' | 'presenceMode'>

export function SlideMotion({ children, containerRef, motionKey, delay, inSource, outSource, disappear, variants, transition, fullWidth, fullHeight, layout, containerProps }: SlideMotionProps) {
    variants = variants ?? SlideVariants
    transition = transition ?? slideGetTransitions(delay ?? 0)

    useEffect(() => {
        transition = transition ?? slideGetTransitions(delay ?? 0)
    }, [delay])

    console.log('SlideMotion', { children, containerRef, motionKey, delay, inSource, outSource, disappear, variants, transition, fullWidth, fullHeight, layout, containerProps })

    return (
        <motion.div
            ref={containerRef}
            key={motionKey}
            initial='enter'
            animate='active'
            exit='exit'
            custom={{ inSource, outSource, disappear }}
            variants={variants}
            transition={transition}
            layout={layout}
            {...containerProps}
            className={cn(`${fullWidth === true ? 'w-full' : ''} ${fullHeight === true ? 'h-full' : ''}`, containerProps?.className)}
        >
            {children}
        </motion.div>
    )
}
