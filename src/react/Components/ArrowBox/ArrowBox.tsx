import { Box, useTheme } from '@mui/material'

export function ArrowBox({ size = 30, colors }: { size?: number, colors?: { box: string, arrow: string } }) {
    const theme = useTheme()

    if (!colors)
        colors = {
            box: theme.palette.background.default,
            arrow: theme.palette.text.primary,
        }

    return (
        <Box width={size + 'px'} overflow={'visible'} p={0} m={0}>
            <svg
                viewBox={`0 0 150 300`}
            >
                <path d="
                M 0 0
                l 100 0
                q 50 0 50 50
                l 0 200
                q 0 50 -50 50
                l -100 0
                z
                " fill={colors.box} strokeWidth="0" />
                <path d="
                M 55 112.5
                l 0 75
                l 50 -37.5
                z
            " fill={colors.arrow} strokeWidth="0" />
            </svg>
        </Box>
    )
}
