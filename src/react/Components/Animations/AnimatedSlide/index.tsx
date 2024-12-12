import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { mainTransition } from 'src/react/Styles/animations'

const xOffset = 100;
const variants = {
    enter: {
        name: 'enter',
        x: -xOffset.toString() + '%',
        transition: mainTransition
    },
    active: {
        name: 'active',
        x: 0,
        transition: { ...mainTransition, delay: 0.5 }
    },
    exit: {
        name: 'exit',
        x: xOffset.toString() + '%',
        transition: mainTransition
    }
};

export function AnimatedSlide({ childKey, children }: { childKey: string | number, children: ReactNode }) {
    return (
        <>
            <motion.div
                key={childKey}
                initial='enter'
                animate='active'
                exit='exit'
                variants={variants}
                transition={mainTransition}
                style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'absolute' }}
            >
                {children}
            </motion.div>
        </>
    )
}

