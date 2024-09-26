import { useEffect } from 'react';
import { ValueAnimationTransition, animate, motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { circularProgressBarVariantsTransition } from '../Components/ProgressBars/AnimatedCircularProgressBar';

export function GradientBackground({ name }: { name?: string }) {
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

    useEffect(() => {
        // const t = { ease: 'anticipate', duration: 1.3 } as ValueAnimationTransition<number>
        const t = circularProgressBarVariantsTransition as ValueAnimationTransition<number>
        animate(position1X, Math.random() * 100, t);
        animate(position2X, Math.random() * 100, t);
        animate(position3X, Math.random() * 100, t);
        animate(position1Y, Math.random() * 100, t);
        animate(position2Y, Math.random() * 100, t);
        animate(position3Y, Math.random() * 100, t);
        animate(r1, Math.random() * 225, t);
        animate(g1, Math.random() * 225, t);
        animate(b1, Math.random() * 225, t);
        animate(r2, Math.random() * 225, t);
        animate(g2, Math.random() * 225, t);
        animate(b2, Math.random() * 225, t);
        animate(r3, Math.random() * 225, t);
        animate(g3, Math.random() * 225, t);
        animate(b3, Math.random() * 225, t);
    }, [name]);

    return (
        <motion.div
            style={{
                width: '100%',
                height: '100%',
                background: useMotionTemplate`
                radial-gradient(circle at ${position1X}% ${position1Y}%, rgba(${r1}, ${g1}, ${b1}, 1), 30%, transparent),
                radial-gradient(circle at ${position2X}% ${position2Y}%, rgba(${r2}, ${g2}, ${b2}, 1), 30%, transparent),
                radial-gradient(circle at ${position3X}% ${position3Y}%, rgba(${r3}, ${g3}, ${b3}, 1), 30%, transparent)`
            }} />
    );
}
