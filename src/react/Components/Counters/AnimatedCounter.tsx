import { useSpring, animated } from 'react-spring';

export function AnimatedCounter({ start, end }: { start: number; end: number; }) {
    const progress = useSpring({
        from: { percentComplete: start },
        to: { percentComplete: end },
        config: { mass: 3, tension: 30, friction: 30 }
    });

    return (
        <animated.div>
            {progress.percentComplete.to((e) => e.toFixed(0))}
        </animated.div>
    );
}
