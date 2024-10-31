import { Box, IconButton, Menu, Stack, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Draw } from "../types";
import { ColorLensOutlined } from "@mui/icons-material";
import { t } from "i18next";
import { HexAlphaColorPicker } from "react-colorful";
import { ConfigurationContext } from "../../../Contexts/ConfigurationContext";
import { PressureIcon } from "../../Icons/PressureIcon";

export function PencilOptions({ setOnDraw, canvasBackground, mode = 'pencil' }: { setOnDraw: (onDraw: (draw: Draw) => void) => void, canvasBackground: string, mode?: 'pencil' | 'eraser' }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const theme = useContext(ConfigurationContext).get.theme

    const [color, setColor] = useState<string>(canvasBackground === theme.palette.common.white ? theme.palette.common.black : theme.palette.common.white)
    const [lineWidth, setLineWidth] = useState<string>('1.2')

    const [isPressureSensitive, setIsPressureSensitive] = useState<boolean>(true)
    const [pressureMagnitude, setPressureMagnitude] = useState<string>('9')

    if (mode === 'eraser' && color !== canvasBackground)
        setColor(canvasBackground)

    const onDraw = (draw: Draw) => {
        if (!draw)
            return

        const { prevPoint, currentPoint, ctx } = draw
        if (!prevPoint || !currentPoint || !ctx)
            return

        if (Number.isNaN(Number(lineWidth)) || Number.isNaN(Number(pressureMagnitude)))
            return

        let width = Number(lineWidth);
        if (isPressureSensitive && draw.e.pointerType === 'pen')
            width += (Math.pow(draw.e.pressure, 2) * Number(pressureMagnitude));

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

    return (
        <>
            <Box sx={{ overflowX: 'auto', overflowY: 'hidden', width: '100%' }}>
                <Stack spacing={3} direction='row' alignItems='center' sx={{ width: 'fit-content', minWidth: '100%' }}>
                    <div style={{ width: '3rem' }}>
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <ColorLensOutlined />
                        </IconButton>
                    </div>

                    <div style={{ width: '3rem' }}>
                        <IconButton
                            onClick={() => setIsPressureSensitive(!isPressureSensitive)}
                        >
                            <PressureIcon color={isPressureSensitive ? theme.palette.success[theme.palette.mode] : theme.palette.grey[400]} />
                        </IconButton>
                    </div>

                    <div style={{ width: '7rem' }}>
                        <TextField type='text' label={t('Canvas.lineWidth')} variant='outlined' size='small' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth} />
                    </div>

                    <div style={{ width: '7rem' }}>
                        <TextField type='text' label={t('Canvas.pressureMagnitude')} variant='outlined' size='small' onChange={(e) => setPressureMagnitude(e.target.value)} value={pressureMagnitude} />
                    </div>

                    <div style={{ width: '3rem' }}>
                        <IconButton
                            onClick={() => {
                                setColor(canvasBackground === theme.palette.common.white ? theme.palette.common.black : theme.palette.common.white)
                                setLineWidth('1.2')
                                setIsPressureSensitive(true)
                                setPressureMagnitude('9')
                            }}
                        >
                            <PressureIcon color={isPressureSensitive ? theme.palette.success[theme.palette.mode] : theme.palette.grey[400]} />
                        </IconButton>
                    </div>
                </Stack>
            </Box>

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
