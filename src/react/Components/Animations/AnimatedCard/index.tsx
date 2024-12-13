import { memo, ReactNode } from "react"
import { Paper, PaperProps } from "@mui/material"
import { AnimatePresence, motion } from 'framer-motion'

export const AnimatedCard = memo(function AnimatedCard({ animationKey, open, children, paperProps }: { animationKey: string | number, open: boolean, children?: ReactNode, paperProps?: PaperProps }) {
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
                    <Paper sx={{ p: 1 }} {...paperProps}>
                        {children}
                    </Paper>
                </motion.div>
            }
        </AnimatePresence>
    )
})
