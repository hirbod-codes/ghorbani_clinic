import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mainTransition } from "../../../Styles/animations";
import { Stack } from "@mui/material";

export const AnimatedList = memo(function AnimatedList({ collection, source = 'right', withDelay = false, mode = 'sync' }: { collection: { key: string, elm: any }[], source?: 'left' | 'right' | 'up' | 'down', withDelay?: boolean, mode?: 'sync' | 'wait' | 'popLayout' }) {
    return (
        <>
            <Stack direction='column' sx={{ height: '100%', width: '100%', overflowX: 'hidden' }}>
                <div style={{ height: '100%', position: 'relative', overflowX: 'hidden' }}>
                    <AnimatePresence mode={mode}>
                        {collection.map((c, i) => {
                            const delay = withDelay ? 0.1 * i : undefined
                            const transition = {
                                opacity: { ease: [1, 0, 1, 0.5], delay },
                                left: { ...mainTransition, delay },
                                right: { ...mainTransition, delay },
                                top: { ...mainTransition, delay },
                                bottom: { ...mainTransition, delay },
                            }
                            switch (source) {
                                case 'left':
                                    return (
                                        <motion.div
                                            key={c.key}
                                            transition={transition}
                                            initial={{ opacity: 0, left: '-100%' }}
                                            animate={{ opacity: 1, left: 0 }}
                                            exit={{ opacity: 0, left: '-100%' }}
                                            style={{ position: 'relative' }}
                                            layout='position'
                                        >
                                            {c.elm}
                                        </motion.div>
                                    )
                                case 'right':
                                    return (
                                        <motion.div
                                            key={c.key}
                                            transition={transition}
                                            initial={{ opacity: 0, right: '-100%' }}
                                            animate={{ opacity: 1, right: 0 }}
                                            exit={{ opacity: 0, right: '-100%' }}
                                            style={{ position: 'relative' }}
                                            layout='position'
                                        >
                                            {c.elm}
                                        </motion.div>
                                    )
                                case 'up':
                                    return (
                                        <motion.div
                                            key={c.key}
                                            transition={transition}
                                            initial={{ opacity: 0, top: '-100%' }}
                                            animate={{ opacity: 1, top: 0 }}
                                            exit={{ opacity: 0, top: '-100%' }}
                                            style={{ position: 'relative' }}
                                            layout='position'
                                        >
                                            {c.elm}
                                        </motion.div>
                                    )
                                case 'down':
                                    return (
                                        <motion.div
                                            key={c.key}
                                            transition={transition}
                                            initial={{ opacity: 0, bottom: '-100%' }}
                                            animate={{ opacity: 1, bottom: 0 }}
                                            exit={{ opacity: 0, bottom: '-100%' }}
                                            style={{ position: 'relative' }}
                                            layout='position'
                                        >
                                            {c.elm}
                                        </motion.div>
                                    )
                            }
                        })}
                    </AnimatePresence >
                </div >
            </Stack>
        </>
    )
})

