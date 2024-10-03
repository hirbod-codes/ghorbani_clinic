import { animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { numericCounterTransitions } from "../../Styles/animations";

export function AnimatedCounter({ start = 0, end }: { start?: number; end: number; }) {
    const nodeRef = useRef<HTMLParagraphElement>();

    useEffect(() => {
        const controls = animate(start, end, {
            ...(numericCounterTransitions as any),
            onUpdate(value) {
                if (nodeRef.current)
                    nodeRef.current.textContent = value.toFixed(0);
            },
        });

        return () => controls.stop()
    }, [])

    return (
        <div ref={nodeRef} />
    )
}

