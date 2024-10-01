import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { mainTransition } from '../Styles/animations';
import { useLocation } from 'react-router-dom';
import { publish } from '../Lib/Events';

export const PAGE_SLIDER_ANIMATION_END_EVENT_NAME = 'pageSliderAnimationEnd'

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

export function AnimatedLayout({ children }: { children: ReactNode }): JSX.Element {
    console.log('AnimatedLayout');

    const location = useLocation();

    return (
        <motion.div
            initial='enter'
            animate='active'
            exit='exit'
            variants={variants}
            transition={mainTransition}
            style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'absolute' }}
            onAnimationComplete={(definition) => {
                if (definition === 'active')
                    publish(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, location.pathname)
            }}
        >
            {children}
        </motion.div>
    );
}
