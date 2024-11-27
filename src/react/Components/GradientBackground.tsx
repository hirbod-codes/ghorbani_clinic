import { memo, useContext } from 'react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { gradientBackgroundTransitions } from '../Styles/animations';
import { ConfigurationContext } from '../Contexts/ConfigurationContext';
import { Box, alpha, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';

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

    const background = useMotionTemplate`
                radial-gradient(circle at ${position1X}% ${position1Y}%, rgba(${r1}, ${g1}, ${b1}, 1), 30%, transparent),
                radial-gradient(circle at ${position2X}% ${position2Y}%, rgba(${r2}, ${g2}, ${b2}, 1), 30%, transparent),
                radial-gradient(circle at ${position3X}% ${position3Y}%, rgba(${r3}, ${g3}, ${b3}, 1), 30%, transparent)`

    // const scale = (number: number, inMin: number, inMax: number, outMin: number, outMax: number) => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
    // const toSafeInteger = (num: number) => Math.round(Math.max(Math.min(num, Number.MAX_SAFE_INTEGER), Number.MIN_SAFE_INTEGER))

    // useEffect(() => {
    //     const t = mainTransition as ValueAnimationTransition<number>
    //     // console.log(Math.random() * 100, scale(toSafeInteger(Math.random() * 100), 0, 100, 10, 90))
    //     // Performance!!!
    //     // animate(position1X, scale(toSafeInteger(Math.random() * 100), 0, 100, 10, 90), t);
    //     // animate(position2X, scale(toSafeInteger(Math.random() * 100), 0, 100, 10, 90), t);
    //     // animate(position3X, scale(toSafeInteger(Math.random() * 100), 0, 100, 10, 90), t);
    //     // animate(position1Y, scale(toSafeInteger(Math.random() * 100), 0, 100, 10, 90), t);
    //     // animate(position2Y, scale(toSafeInteger(Math.random() * 100), 0, 100, 10, 90), t);
    //     // animate(position3Y, scale(toSafeInteger(Math.random() * 100), 0, 100, 10, 90), t);
    //     animate(r1, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    //     animate(g1, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    //     animate(b1, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    //     animate(r2, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    //     animate(g2, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    //     animate(b2, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    //     animate(r3, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    //     animate(g3, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    //     animate(b3, scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225), t);
    // }, [location]);

    return (
        <>
            <AnimatePresence>
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
            </AnimatePresence>
        </>
    );
})
