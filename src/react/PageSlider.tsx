import { useTheme } from '@mui/material';
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
        transition: { delay: 0.8, ease: 'easeIn' }
    },
    exit: {
        left: xOffset,
        opacity: 0,
        transition: { delay: 0, ease: 'easeIn' }
    }
};

export function PageSlider({ page }: { page: JSX.Element; }) {
    const theme = useTheme()

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
                >
                    {page}
                </motion.div>
                <motion.div
                    layout
                    key={page.type.name + '1'}
                    style={{ overflow: 'hidden', backgroundColor: theme.palette.primary[theme.palette.mode], height: '100%', left: '-100%', width: '100%', position: 'absolute' }}
                    initial={false}
                    animate={false}
                    exit={{ left: '500%', scaleX: 5 }}
                    transition={{ delay: 0.2, duration: 1, ease: 'easeIn' }}
                />
            </AnimatePresence>
        </div>
    );
}
