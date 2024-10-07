import { Backdrop, Box, Button, CircularProgress, Divider, IconButton, Menu, Paper, Stack, TextField, colors } from "@mui/material";
import { MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { Draw } from "./types";
import { useDraw } from "./useDraw";

import './styles.css'
import { ColorLensOutlined, PrintOutlined } from "@mui/icons-material";
import { t } from "i18next";
import { HexAlphaColorPicker } from "react-colorful";
import { useReactToPrint } from "react-to-print";
import { PencilIcon } from "../Icons/PencilIcon";
import { EraserIcon } from "../Icons/EraserIcon";

export type CanvasProps = {
    canvasRef?: MutableRefObject<HTMLCanvasElement>,
    onChange?: (empty?: boolean) => void | Promise<void>
    canvasBackground?: string
}

export function Canvas({ canvasRef, canvasBackground, onChange }: CanvasProps) {
    let theme = useContext(ConfigurationContext).get.theme
    if (!canvasBackground)
        canvasBackground = theme.palette.common.white

    const [loading, setLoading] = useState<boolean>(false)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [color, setColor] = useState<string>(canvasBackground === theme.palette.common.white ? theme.palette.common.black : theme.palette.common.white)

    const [lineWidth, setLineWidth] = useState<string>('1.2')
    const [radius, setRadius] = useState<string>('0.3')

    const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil')

    const { onDown, clear, empty } = useDraw(drawLine, canvasRef, onChange)

    const parentRef = useRef<HTMLDivElement>()

    const printRef = useRef<HTMLImageElement>()
    const print = useReactToPrint({ onAfterPrint: () => { setLoading(false); printRef.current.src = undefined } })

    useEffect(() => {
        if (parentRef.current && canvasRef.current) {
            const rect = parentRef.current.getBoundingClientRect();
            canvasRef.current.width = rect.width
            canvasRef.current.height = rect.height
        }
    }, [parentRef.current, canvasRef.current])

    useEffect(() => {
        if (canvasRef.current)
            canvasRef.current.style.backgroundColor = canvasBackground
    }, [canvasBackground])

    console.log('Canvas', { anchorEl, color, lineWidth, radius, parentRef, canvasRef })

    function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
        const { x: currX, y: currY } = currentPoint
        const lineColor = color

        let startPoint = prevPoint ?? currentPoint
        ctx.beginPath()
        ctx.lineWidth = Number(lineWidth)
        ctx.strokeStyle = lineColor
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currX, currY)
        ctx.stroke()

        ctx.fillStyle = lineColor
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, Number(radius), 0, 2 * Math.PI)
        ctx.fill()
    }

    return (
        <>
            {
                loading
                &&
                <Backdrop sx={{ zIndex: theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress />
                </Backdrop >
            }

            <Box sx={{ height: '100%' }}>
                <Stack direction='column' alignItems='start' sx={{ height: '100%' }} spacing={1} >
                    <Box sx={{ overflowX: 'auto', overflowY: 'hidden', flexGrow: 1, width: '100%' }}>
                        <Stack direction='row' alignItems='center' spacing={2} sx={{ width: 'fit-content' }}>
                            <IconButton onClick={() => {
                                printRef.current.src = canvasRef.current.toDataURL()
                                setLoading(true)
                                print(null, () => printRef.current);
                            }}>
                                <PrintOutlined />
                            </IconButton>
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                <ColorLensOutlined />
                            </IconButton>
                            <TextField type='text' label={t('radius')} sx={{ width: '5rem' }} variant='standard' onChange={(e) => setRadius(e.target.value)} value={radius.toString()} />
                            <TextField type='text' label={t('lineWidth')} sx={{ width: '5rem' }} variant='standard' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth.toString()} />
                            <IconButton onClick={() => {
                                if (tool !== 'pencil')
                                    setTool('pencil')

                                setColor(canvasBackground === theme.palette.common.white ? theme.palette.common.black : theme.palette.common.white)
                                setRadius('0.3')
                            }}>
                                <PencilIcon color={tool === 'pencil' ? theme.palette.success.light : undefined} />
                            </IconButton>
                            <IconButton onClick={() => {
                                if (tool !== 'eraser')
                                    setTool('eraser')

                                setColor(canvasBackground === theme.palette.common.white ? theme.palette.common.white : theme.palette.common.black)
                                setRadius('10')
                            }}>
                                <EraserIcon color={tool === 'eraser' ? theme.palette.success.light : undefined} />
                            </IconButton>
                            <Button
                                variant='outlined'
                                onClick={() => {
                                    setColor(theme.palette.common.black)
                                    setLineWidth('1.2')
                                    setRadius('0.3')
                                }}
                            >
                                {t('reset')}
                            </Button>
                            <Button variant='outlined' onClick={() => { clear() }}>{t('clean')}</Button>
                        </Stack >
                    </Box>

                    <Divider variant='middle' />

                    <Paper elevation={2} sx={{ flexGrow: 2, width: '100%', p: 0, m: 0 }} ref={parentRef}>
                        <canvas
                            ref={canvasRef}
                            onMouseDown={onDown}
                            onTouchStart={onDown}
                            className='canvas'
                        />
                    </Paper>
                </Stack >
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
                    <HexAlphaColorPicker color={color} onChange={setColor} />
                </Stack>
            </Menu>

            <div style={{ display: 'none' }}>
                <img ref={printRef} style={{ backgroundColor: canvasBackground }} />
            </div>
        </>
    )
}

