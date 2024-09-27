import { AnimatePresence, motion } from 'framer-motion';
import { publish } from '../Lib/Events';
import { mainTransition } from '../Styles/animations';

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

export function PageSlider({ page }: { page: JSX.Element; }) {
    return (
        <div style={{ overflow: 'hidden', position: 'relative', height: '100%' }}>
            <AnimatePresence mode='sync' initial={false}>
                <motion.div
                    layoutScroll
                    key={page.type.name}
                    style={{ overflow: 'hidden', height: '100%', width: '100%', position: 'absolute' }}
                    variants={variants}
                    initial='enter'
                    animate='active'
                    exit='exit'
                    onAnimationComplete={(definition) => {
                        console.log('ON_ANIMATION_COMPLETE------------------------------------------------------------------------------------', { definition })
                        if (definition === 'active')
                            publish(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, page.type.name)
                    }}
                >
                    {page}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
