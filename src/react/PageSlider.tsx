import { AnimatePresence, motion } from 'framer-motion';

const xOffset = 100;
const variants = {
    enter: {
        left: -xOffset,
        opacity: 0,
    },
    active: {
        left: 0,
        opacity: 1,
        transition: { delay: 0.2 }
    },
    exit: {
        left: xOffset,
        opacity: 0,
    }
};

export function PageSlider({ page }: { page: JSX.Element; }) {
    return (
        <div style={{ overflow: 'hidden', position: 'relative', height: '100%' }}>
            <AnimatePresence>
                <motion.div
                    layout
                    key={page.type.name}
                    style={{ overflow: 'hidden', height: '100%', width: '100%', position: 'absolute' }}
                    variants={variants}
                    initial='enter'
                    animate='active'
                    exit='exit'
                >
                    {page}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
