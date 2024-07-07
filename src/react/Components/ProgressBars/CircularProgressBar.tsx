import { Box, useTheme } from "@mui/material";
import { ReactNode } from 'react';

export function CircularProgressBar({percentComplete, size = 50, strokeWidth = 5, colors, children}: {
    percentComplete: number;
    size?: number;
    strokeWidth?: number;
    colors?: { progress: string; base: string; };
    children?: ReactNode;
}) {
    const theme = useTheme();

    if (!colors)
        colors = {
            progress: theme.palette.primary[theme.palette.mode],
            base: theme.palette.background.default,
        };
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (circumference * percentComplete / 100);

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
                        stroke={colors.base} />
                    <circle
                        strokeWidth={strokeWidth}
                        r={radius}
                        cx={'50%'}
                        cy={'50%'}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        fill="transparent"
                        stroke={colors.progress} />
                </svg>
                <Box
                    sx={{
                        width: '100%',
                        position: 'relative',
                        top: '50%',
                        transform: 'translate(0, -50%)',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </>
    );
}
