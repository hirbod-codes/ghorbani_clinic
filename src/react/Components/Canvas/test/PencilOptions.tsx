import { IconButton, Menu, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Draw } from "../types";
import { ColorLensOutlined } from "@mui/icons-material";
import { t } from "i18next";
import { HexAlphaColorPicker } from "react-colorful";

export function PencilOptions({ setOnDraw, canvasBackground, mode = 'pencil' }: { setOnDraw: (onDraw: (draw: Draw) => void) => void, canvasBackground: string, mode?: 'pencil' | 'eraser' }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const [color, setColor] = useState<string>('#ff0000')
    const [lineWidth, setLineWidth] = useState<string>('1.2')

    if (mode === 'eraser' && color !== canvasBackground)
        setColor(canvasBackground)

    const onDraw = (draw: Draw) => {
        if (!draw)
            return

        const { prevPoint, currentPoint, ctx } = draw
        if (!prevPoint || !currentPoint || !ctx)
            return

        console.log('onDraw1', { color, lineWidth })

        let width = Number(lineWidth);
        if (draw.e.pointerType === 'pen')
            width += (Math.pow(draw.e.pressure, 2) * 9);

        console.log('onDraw1', { width })

        const { x: currX, y: currY } = currentPoint
        const lineColor = color

        let startPoint = prevPoint ?? currentPoint
        ctx.beginPath()
        ctx.lineWidth = width
        ctx.strokeStyle = lineColor
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currX, currY)
        ctx.stroke()

        ctx.fillStyle = lineColor
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, width / 2, 0, 2 * Math.PI)
        ctx.fill()
    }

    useEffect(() => {
        setOnDraw(() => onDraw)
    }, [color, lineWidth])

    console.log('PencilOptions1', { color, lineWidth })

    return (
        <>
            <Stack spacing={3} direction='row' alignItems='center' sx={{ width: 'fit-content', minWidth: '100%' }}>
                <div style={{ width: '3rem' }}>
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <ColorLensOutlined />
                    </IconButton>
                </div>

                <div style={{ width: '7rem' }}>
                    <TextField type='text' label={t('Canvas.lineWidth')} variant='outlined' size='small' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth} />
                </div>
            </Stack>

            <Menu
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}

                sx={{ mt: '40px' }}
            >
                <Stack direction='column' alignItems='start' spacing={1} sx={{ m: 0, p: 2 }}>
                    <HexAlphaColorPicker color={color} onChange={(c) => setColor(c)} />
                </Stack>
            </Menu>
        </>
    )
}
