import { animated, useSpring } from "@react-spring/web"

export function AnimatedCounter({ countTo }: { countTo: number }) {
    const { number } = useSpring({
        from: { number: 0 },
        number: countTo,
        config: {
            mass: 1,
            tension: 20,
            friction: 10,
        }
    })

    return (
        <animated.div>
            {number.to((n) => n.toFixed(0))}
        </animated.div>
    )
}