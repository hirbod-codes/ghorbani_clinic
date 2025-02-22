import { ComponentProps, memo, ReactNode, useContext } from "react"
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from "@/src/react/shadcn/lib/utils"
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext"

export const AnimatedCard = memo(function AnimatedCard({ animationKey, open, children, props }: { animationKey: string | number, open: boolean, children?: ReactNode, props?: ComponentProps<'div'> }) {
    const local = useContext(ConfigurationContext)!.local

    return (
        <AnimatePresence mode='sync'>
            {open &&
                <motion.div
                    key={animationKey}
                    variants={{
                        exit: () => {
                            if (local.direction === 'ltr')
                                return {
                                    left: '70%',
                                    opacity: 0
                                }
                            else
                                return {
                                    right: '70%',
                                    opacity: 0
                                }
                        },
                        animate: () => {
                            if (local.direction === 'ltr')
                                return {
                                    left: '105%',
                                    opacity: 1
                                }
                            else
                                return {
                                    right: '105%',
                                    opacity: 1
                                }
                        },
                    }}
                    initial='exit'
                    animate='animate'
                    exit='exit'
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
