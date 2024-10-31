import { Backdrop, Box, Button, CircularProgress, Divider, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack } from "@mui/material";
import { MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { Draw } from "./types";
import { useDraw } from "./useDraw";

import { PrintOutlined } from "@mui/icons-material";
import { t } from "i18next";
import { useReactToPrint } from "react-to-print";
import { PencilOptions } from "./PencilOptions";

export type Tool = 'pencil' | 'eraser' | 'rectangle' | 'circle'

export type CanvasProps = {
    canvasRef?: MutableRefObject<HTMLCanvasElement>,
    onChange?: (empty?: boolean) => void | Promise<void>
    canvasBackground?: string
}

export function Canvas({ canvasRef, canvasBackground, onChange }: CanvasProps) {
    if (!canvasRef)
        canvasRef = useRef()

    let theme = useContext(ConfigurationContext).get.theme
    if (!canvasBackground)
        canvasBackground = theme.palette.common.white

    const [loading, setLoading] = useState<boolean>(false)

    const [draw, setDraw] = useState<(draw: Draw) => void>(undefined)

    const [tool, setTool] = useState<Tool>('pencil')

    const { onDown, onUp, onMove, pointerDown, clear, empty } = useDraw(canvasRef, draw, onChange)

    const printRef = useRef<HTMLImageElement>()
    const print = useReactToPrint({ onAfterPrint: () => { setLoading(false); printRef.current.src = undefined } })

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = canvasRef.current.clientWidth
            canvasRef.current.height = canvasRef.current.clientHeight
            const ctx = canvasRef.current.getContext('2d')
            ctx.scale(1, 1)
        }
    }, [canvasRef.current])

    useEffect(() => {
        if (canvasRef.current)
            canvasRef.current.style.backgroundColor = canvasBackground
    }, [canvasBackground])

    console.log('Canvas2', { canvasRef, draw })

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
                    <IconButton onClick={() => {
                        printRef.current.src = canvasRef.current.toDataURL()
                        setLoading(true)
                        print(null, () => printRef.current);
                    }}>
                        <PrintOutlined />
                    </IconButton>

                    <div style={{ width: '7rem' }}>
                        <FormControl variant='standard' fullWidth>
                            <InputLabel id="tool-label">{t('Canvas.tool')}</InputLabel>
                            <Select
                                onChange={(e) => setTool(e.target.value as any)}
                                labelId="tool-label"
                                id='tool'
                                value={tool}
                            >
                                <MenuItem value='pencil'>{t('Canvas.pencil')}</MenuItem>
                                <MenuItem value='eraser'>{t('Canvas.eraser')}</MenuItem>
                                <MenuItem value='rectangle'>{t('Canvas.rectangle')}</MenuItem>
                                <MenuItem value='circle'>{t('Canvas.circle')}</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    <Divider variant='middle' />

                    <Box sx={{ flexGrow: 1, overflowX: 'auto', overflowY: 'hidden', width: '100%', pt: 1 }}>
                        {tool === 'pencil' && <PencilOptions setOnDraw={setDraw} canvasBackground={canvasBackground} />}

                        {tool === 'eraser' && <PencilOptions mode='eraser' setOnDraw={setDraw} canvasBackground={canvasBackground} />}

                        {/* {tool === 'eraser' && <RectangleOptions setOnDraw={setDraw} canvasBackground={canvasBackground} />} */}

                        {/* {tool === 'eraser' && <PencilOptions mode='eraser' setOnDraw={setDraw} canvasBackground={canvasBackground} />} */}
                    </Box>

                    <Divider variant='middle' />

                    <Paper elevation={2} sx={{ flexGrow: 2, width: '100%', p: 1, m: 0 }}>
                        <canvas
                            ref={canvasRef}
                            style={{ width: '100%', height: '100%', touchAction: 'none', userSelect: 'none' }}
                            onPointerDown={onDown}
                            onPointerUp={onUp}
                            onPointerMove={onMove}
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onMouseMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        />
                    </Paper>
                </Stack >
            </Box>

            <div style={{ display: 'none' }}>
                <img ref={printRef} style={{ backgroundColor: canvasBackground }} />
            </div>
        </>
    )
}

