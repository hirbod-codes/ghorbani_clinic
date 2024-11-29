import { memo, useContext, useEffect, useRef } from 'react';
import { animate, AnimatePresence, motion, useMotionTemplate, useMotionValue, ValueAnimationTransition } from 'framer-motion';
import { gradientBackgroundTransitions, mainTransition } from '../Styles/animations';
import { ConfigurationContext } from '../Contexts/ConfigurationContext';
import { Box, alpha, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';

import './G/index.css';

export const GradientBackground = memo(function GradientBackground() {
    const c = useContext(ConfigurationContext)
    const theme = useTheme()
    const location = useLocation();

    const backDropColor = alpha(theme.palette.mode === 'dark' ? '#000' : '#fff', 0.3)

    console.log('GradientBackground', { location, c })

    const position1X = useMotionValue(Math.random() * 100);
    const position1Y = useMotionValue(Math.random() * 100);

    const position2X = useMotionValue(Math.random() * 100);
    const position2Y = useMotionValue(Math.random() * 100);

    const position3X = useMotionValue(Math.random() * 100);
    const position3Y = useMotionValue(Math.random() * 100);

    const r1 = useMotionValue(Math.random() * 225);
    const g1 = useMotionValue(Math.random() * 225);
    const b1 = useMotionValue(Math.random() * 225);

    const r2 = useMotionValue(Math.random() * 225);
    const g2 = useMotionValue(Math.random() * 225);
    const b2 = useMotionValue(Math.random() * 225);

    const r3 = useMotionValue(Math.random() * 225);
    const g3 = useMotionValue(Math.random() * 225);
    const b3 = useMotionValue(Math.random() * 225);

    console.log('GradientBackground', { location, c }, { position1X, position1Y, position2X, position2Y, position3X, position3Y, r1, g1, b1, r2, g2, b2, r3, g3, b3 })

    const background = useMotionTemplate`
                radial-gradient(circle at ${position1X}% ${position1Y}%, rgba(${r1}, ${g1}, ${b1}, 1), 30%, transparent),
                radial-gradient(circle at ${position2X}% ${position2Y}%, rgba(${r2}, ${g2}, ${b2}, 1), 30%, transparent),
                radial-gradient(circle at ${position3X}% ${position3Y}%, rgba(${r3}, ${g3}, ${b3}, 1), 30%, transparent)`

    const scale = (number: number, inMin: number, inMax: number, outMin: number, outMax: number) => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
    const toSafeInteger = (num: number) => Math.round(Math.max(Number.MIN_SAFE_INTEGER, Math.min(num, Number.MAX_SAFE_INTEGER)))

    const scales = useRef<{ r1: number; g1: number; b1: number; r2: number; g2: number; b2: number; r3: number; g3: number; b3: number; }>()
    const positions = useRef<{ position1X: number; position2X: number; position3X: number; position1Y: number; position2Y: number; position3Y: number; }>()

    const calculateValues = () => {
        console.log('GradientBackground calculate')

        scales.current = {
            r1: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            g1: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            b1: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            r2: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            g2: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            b2: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            r3: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            g3: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            b3: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
        }
        console.log(scales.current)

        positions.current = {
            position1X: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
            position2X: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
            position3X: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
            position1Y: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
            position2Y: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
            position3Y: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
        }
        console.log(positions.current)
    }

    useEffect(() => {
        calculateValues()
    }, [])

    useEffect(() => {
        console.log('GradientBackground useEffect')

        const t: ValueAnimationTransition<number> = { ...mainTransition as ValueAnimationTransition<number> }
        t.damping = 50

        // Performance!!!

        const animations = [
            animate(position1X, positions.current.position1X, t),
            animate(position2X, positions.current.position2X, t),
            animate(position3X, positions.current.position3X, t),
            animate(position1Y, positions.current.position1Y, t),
            animate(position2Y, positions.current.position2Y, t),
            animate(position3Y, positions.current.position3Y, t),
            animate(r1, scales.current.r1, t),
            animate(g1, scales.current.g1, t),
            animate(b1, scales.current.b1, t),
            animate(r2, scales.current.r2, t),
            animate(g2, scales.current.g2, t),
            animate(b2, scales.current.b2, t),
            animate(r3, scales.current.r3, t),
            animate(g3, scales.current.g3, t),
            animate(b3, scales.current.b3, t),
        ]

        console.log('stop')
        animations.forEach(a => a.pause())

        setTimeout(() => {
            console.log('play')
            animations.forEach(a => a.play())
        }, 100)

        calculateValues()
    }, [location]);

    return (
        <>
            {c.get.showGradientBackground &&
                <>
                    <div id='test' />
                    {/* <Box sx={{ backgroundColor: backDropColor, position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }} /> */}
                </>
            }
            {/* <AnimatePresence>
                {c.get.showGradientBackground &&
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }}
                    >
                        <motion.div
                            key={location.pathname}
                            transition={gradientBackgroundTransitions}
                            style={{
                                width: '100%',
                                height: '100%',
                                background
                            }} />
                        <Box sx={{ backgroundColor: backDropColor, position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }} />
                    </motion.div>
                }
            </AnimatePresence> */}
        </>
    );
})
