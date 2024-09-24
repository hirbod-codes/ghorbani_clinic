import { Box, Stack, useTheme } from "@mui/material";
import { ReactNode } from 'react';
import { Transition, Variants, motion } from "framer-motion";

export const circularProgressBarVariantsTransition: Transition = {
    type: 'spring',
    bounce: 0.4,
    damping: 50
}

type circularProgressBarVariantsCustomProps = { start?: number, end: number, circumference: number, transition?: Transition; }

export const circularProgressBarVariants: Variants = {
    initial: ({ start }: circularProgressBarVariantsCustomProps) => ({
        pathLength: start ?? 0,
        strokeDashoffset: start ?? 0
    }),
    progress: ({ end, circumference, transition }: circularProgressBarVariantsCustomProps) => ({
        pathLength: end / 100,
        strokeDashoffset: circumference - (circumference * end / 100),
        transition: transition ?? circularProgressBarVariantsTransition
    })
}

export type AnimatedCircularProgressBarProps = {
    end: number;
    start?: number;
    size?: number;
    strokeWidth?: number;
    colors?: { progress: string; base: string; };
    transition?: Transition;
    children?: ReactNode;
}

export function AnimatedCircularProgressBar({ end, start = 0, size = 50, transition, strokeWidth = 5, colors, children }: AnimatedCircularProgressBarProps) {
    const theme = useTheme();

    if (!colors)
        colors = {
            progress: theme.palette.primary[theme.palette.mode],
            base: theme.palette.background.default,
        };
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    return (
        <>
            <Box width={size + 'px'} height={size + 'px'} overflow={'visible'}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    width={size + 'px'}
                    height={size + 'px'}
                    style={{
                        transform: 'rotate(145deg)',
                        position: 'absolute'
                    }}
                >
                    <circle
                        strokeWidth={strokeWidth}
                        r={radius}
                        cx={'50%'}
                        cy={'50%'}
                        strokeDasharray={circumference}
                        strokeDashoffset={0}
                        fill="transparent"
                        stroke={colors.base}
                    />
                    <motion.circle
                        variants={circularProgressBarVariants}
                        initial='initial'
                        animate='progress'
                        custom={{ end, circumference, transition }}
                        strokeWidth={strokeWidth}
                        r={radius}
                        cx={'50%'}
                        cy={'50%'}
                        strokeDasharray={circumference}
                        fill="transparent"
                        stroke={colors.progress}
                    />
                </svg>
                <Box
                    sx={{
                        width: '100%',
                        position: 'relative',
                        top: '50%',
                        transform: 'translate(0, -50%)',
                    }}
                >
                    <Stack justifyContent='center' direction='row'>
                        {children}
                    </Stack>
                </Box>
            </Box>
        </>
    )
}
