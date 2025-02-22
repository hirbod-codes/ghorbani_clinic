import { AnimatePresence, motion } from "framer-motion";
import { SlideMotion, SlideMotionProps } from "../AnimatedSlide/SlideMotion";

export type AnimatedListProps = Omit<SlideMotionProps, 'children' | 'fullHeight' | 'open'> & {
    collection: { key: string, elm: any }[],
    presenceMode?: 'sync' | 'wait' | 'popLayout' | undefined
    withDelay?: boolean,
}

export function AnimatedList({ collection, withDelay = false, presenceMode = 'sync', ...slideMotionProps }: AnimatedListProps) {
    slideMotionProps.delay = slideMotionProps.delay ?? 0
    slideMotionProps.disappear = slideMotionProps.disappear ?? true
    slideMotionProps.inSource = slideMotionProps.inSource ?? 'left'
    slideMotionProps.outSource = slideMotionProps.outSource ?? 'right'

    // console.log('AnimatedList', { collection, withDelay, ...slideMotionProps })

    return (
        <motion.div layout className="flex flex-col h-full w-full relative overflow-hidden">
            <AnimatePresence mode={presenceMode}>
                {collection.map((c, i) =>
                    <SlideMotion
                        key={c.key}
                        motionKey={c.key}
                        delay={withDelay ? (slideMotionProps.delay ?? 0) + (0.1 * i) : 0}
                        disappear={slideMotionProps.disappear}
                        inSource={slideMotionProps.inSource}
                        outSource={slideMotionProps.outSource}
                        layout='position'
                        {...slideMotionProps}
                    >
                        {c.elm}
                    </SlideMotion>
                )}
            </AnimatePresence>
        </motion.div >
    )
}
