import { AnimatePresence, motion } from 'framer-motion';
import { circularProgressBarVariantsTransition } from '../Components/ProgressBars/AnimatedCircularProgressBar';
import { useContext, useEffect } from 'react';
import { NavigationContext } from '../Contexts/NavigationContext';

const xOffset = 100;
const variants = {
    enter: {
        name: 'enter',
        x: -xOffset.toString() + '%',
        transition: circularProgressBarVariantsTransition
    },
    active: {
        name: 'active',
        x: 0,
        transition: { ...circularProgressBarVariantsTransition, delay: 0.5 }
    },
    exit: {
        name: 'exit',
        x: xOffset.toString() + '%',
        transition: circularProgressBarVariantsTransition
    }
};

export function PageSlider({ page }: { page: JSX.Element; }) {
    const nav = useContext(NavigationContext)

    useEffect(() => {
        nav?.setPageHasLoaded(false)
    }, [page])

    return (
        <div style={{ overflow: 'hidden', position: 'relative', height: '100%' }}>
            <AnimatePresence mode='sync' initial={false}>
                <motion.div
                    layout
                    key={page.type.name}
                    style={{ overflow: 'hidden', height: '100%', width: '100%', position: 'absolute' }}
                    variants={variants}
                    initial='enter'
                    animate='active'
                    exit='exit'
                    onAnimationComplete={(definition) => {
                        console.log('ON_ANIMATION_COMPLETE------------------------------------------------------------------------------------', { definition })
                        if (definition === 'active')
                            nav?.setPageHasLoaded(true)
                    }}
                >
                    {page}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
