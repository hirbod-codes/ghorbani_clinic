import { Stack } from "@mui/material";
import { ReactNode } from 'react';
import { useSpring, animated } from 'react-spring';
import { CircularProgressBar } from "./CircularProgressBar";

export function AnimatedCircularProgressBar({ start, end, children }: { start: number; end: number; children?: ReactNode; }) {
    const progress = useSpring({
        from: { percentComplete: start },
        to: { percentComplete: end },
        config: { mass: 1, tension: 1000, friction: 1000 }
    });

    const AnimatedCircularProgress = animated((props) => (<CircularProgressBar {...{ ...props, percentComplete: props.percentComplete }} />));

    return (
        <AnimatedCircularProgress size={200} percentComplete={progress.percentComplete}>
            <Stack justifyContent='center' direction='row'>
                {children}
            </Stack>
        </AnimatedCircularProgress>
    );
}
