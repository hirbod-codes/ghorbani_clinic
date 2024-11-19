import { IconButton, Menu, Stack, TextField, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ColorLensOutlined, RestartAltOutlined } from "@mui/icons-material";
import { t } from "i18next";
import { HexAlphaColorPicker } from "react-colorful";
import { PenConnectIcon } from "../../Icons/PenConnectIcon";
import * as fabric from 'fabric'

export type PencilToolProps = {
    canvas: fabric.Canvas,
    canvasBackground: string,
    mode?: 'pencil' | 'eraser'
}

export function PencilTool({ canvas, canvasBackground, mode = 'pencil' }: PencilToolProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const theme = useTheme()

    const [color, setColor] = useState<string>(canvasBackground === theme.palette.common.white ? theme.palette.common.black : theme.palette.common.white)
    const [lineWidth, setLineWidth] = useState<string>('1.2')

    const [isPressureSensitive, setIsPressureSensitive] = useState<boolean>(true)
    const [pressureMagnitude, setPressureMagnitude] = useState<string>('9')

    if (mode === 'eraser' && color !== canvasBackground)
        setColor(canvasBackground)

    const [brush, setBrush] = useState(new fabric.PencilBrush(canvas))

    useEffect(() => {
        brush.color = color
        brush.width = Number(lineWidth)
        canvas.freeDrawingBrush = brush
    }, [color, lineWidth])

    return (
        <>
            <Stack spacing={3} direction='row' alignItems='center' sx={{ width: 'max-content' }}>
                <div>
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ backgroundColor: color }}>
                        <ColorLensOutlined sx={{ color: theme.palette.getContrastText(color) }} />
                    </IconButton>
                </div>

                <div>
                    <IconButton
                        onClick={() => setIsPressureSensitive(!isPressureSensitive)}
                    >
                        <PenConnectIcon color={isPressureSensitive ? theme.palette.success[theme.palette.mode] : theme.palette.grey[400]} />
                    </IconButton>
                </div>

                <div>
                    <TextField type='text' label={t('Canvas .lineWidth')} variant='standard' size='small' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth} />
                </div>

                <div>
                    <TextField type='text' label={t('Canvas.pressureMagnitude')} variant='standard' size='small' onChange={(e) => setPressureMagnitude(e.target.value)} value={pressureMagnitude} />
                </div>

                <div>
                    <IconButton
                        onClick={() => {
                            setColor(canvasBackground === theme.palette.common.white ? theme.palette.common.black : theme.palette.common.white)
                            setLineWidth('1.2')
                            setIsPressureSensitive(true)
                            setPressureMagnitude('9')
                        }}
                    >
                        <RestartAltOutlined fontSize="medium" color='error' />
                    </IconButton>
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
