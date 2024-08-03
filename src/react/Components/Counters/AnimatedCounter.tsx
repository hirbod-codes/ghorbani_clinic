import { useSpring, animated, easings } from 'react-spring';

export function AnimatedCounter({ start, end }: { start: number; end: number; }) {
    const progress = useSpring({
        from: { percentComplete: start },
        to: { percentComplete: end },
        config: { easing: easings.easeInBack }
    });

    return (
        <animated.div>
            {progress.percentComplete.to((e) => e.toFixed(0))}
        </animated.div>
    );
}
