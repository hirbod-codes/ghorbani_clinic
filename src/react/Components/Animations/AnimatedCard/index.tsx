import { ComponentProps, memo, ReactNode } from "react"
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from "@/src/react/shadcn/lib/utils"

export const AnimatedCard = memo(function AnimatedCard({ animationKey, open, children, props }: { animationKey: string | number, open: boolean, children?: ReactNode, props?: ComponentProps<'div'> }) {
    return (
        <AnimatePresence mode='sync'>
            {open &&
                <motion.div
                    key={animationKey}
                    initial={{
                        left: '70%',
                        opacity: 0
                    }}
                    animate={{
                        left: '105%',
                        opacity: 1
                    }}
                    exit={{
                        left: '70%',
                        opacity: 0
                    }}
                    layout='position'
                    style={{ top: '0', overflow: 'hidden', position: 'absolute' }}
                >
                    <div {...props} className={cn(["p-1"], props?.className)}>
                        {children}
                    </div>
                </motion.div>
            }
        </AnimatePresence>
    )
})
