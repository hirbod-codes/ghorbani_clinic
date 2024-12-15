import { Backdrop, Box, CircularProgress, Divider, hexToRgb, IconButton, Paper, Stack, Tooltip, useTheme } from "@mui/material";
import { MutableRefObject, useEffect, useReducer, useRef, useState } from "react";
import { Draw } from "./types";
import { useDraw } from "./useDraw";
import { CancelPresentationOutlined, CheckBoxOutlineBlankOutlined, DarkModeOutlined, EditOutlined, LightModeOutlined, NearMeOutlined, PrintOutlined, RestartAltOutlined } from "@mui/icons-material";
import { motion } from 'framer-motion'
import { useReactToPrint } from "react-to-print";
import { PencilTool } from "./Tools/PencilTool";
import { Shapes } from "./Shapes/Shapes";
import { RectangleTool } from "./Tools/RectangleTool";
import { EraserIcon } from "../Icons/EraserIcon";
import { SelectTool } from "./Tools/SelectTool";
import { AnimatePresence } from "framer-motion";
import { mainTransition } from "../../Styles/animations";
import { t } from "i18next";

const xOffset = 100;
const variants = {
    enter: {
        name: 'enter',
        x: -xOffset.toString() + '%',
        transition: mainTransition
    },
    active: {
        name: 'active',
        x: 0,
        transition: { ...mainTransition, delay: 0.5 }
    },
    exit: {
        name: 'exit',
        x: xOffset.toString() + '%',
        transition: mainTransition
    }
};

export type Tool = 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'select'

export type CanvasProps = {
    canvasRef?: MutableRefObject<HTMLCanvasElement | null>,
    onChange?: (empty?: boolean) => void | Promise<void>
    canvasBackground?: string
}

export function Canvas({ canvasRef, canvasBackground: canvasBackgroundInit, onChange }: CanvasProps) {
    if (!canvasRef)
        canvasRef = useRef<HTMLCanvasElement | null>(null)

    const theme = useTheme()

    const [, rerender] = useReducer(x => x + 1, 0)

    const [loading, setLoading] = useState<boolean>(false)

    const [shapes, setShapes] = useState<Shapes>(new Shapes([]))

    const [onDownHook, setOnDownHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [onUpHook, setOnUpHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [onHoverHook, setOnHoverHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [draw, setDraw] = useState<((draw: Draw) => void) | undefined>(undefined)

    const [tool, setTool] = useState<Tool>('pencil')

    const { onDown, onUp, onMove, clear } = useDraw(canvasRef, onChange, draw, onHoverHook, onDownHook, onUpHook)

    const printRef = useRef<HTMLImageElement | null>(null)
    const print = useReactToPrint({ onAfterPrint: () => { setLoading(false); if (printRef.current) printRef.current.src = '' } })

    const resizeCanvas = (canvasRef: MutableRefObject<HTMLCanvasElement | null>) => {
        if (!canvasRef.current)
            return

        canvasRef.current.width = canvasRef.current.clientWidth
        canvasRef.current.height = canvasRef.current.clientHeight
        const ctx = canvasRef.current.getContext('2d')
        ctx?.scale(1, 1)
    }

    useEffect(() => {
        if (canvasRef.current)
            resizeCanvas(canvasRef)
    }, [canvasRef.current])

    useEffect(() => {
        if (canvasRef.current && canvasRef.current.style && canvasBackgroundInit) {
            canvasRef.current.style.backgroundColor = canvasBackgroundInit
            rerender()
        }
    }, [canvasRef.current, canvasBackgroundInit])

    return (
        <>
            {
                loading
                &&
                <Backdrop sx={{ zIndex: theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress />
                </Backdrop >
            }

            <Box sx={{ height: '100%', userSelect: 'none' }}>
                <Stack direction='column' alignItems='stretch' sx={{ height: '100%' }}>
                    <Stack direction='row' alignItems='center' sx={{ width: 'max-content' }}>
                        <Tooltip title={t('Canvas.Print')}>
                            <IconButton onClick={() => {
                                if (!printRef.current)
                                    return

                                printRef.current.src = canvasRef.current?.toDataURL() ?? ''
                                setLoading(true)
                                print(null, () => printRef.current!);
                            }}>
                                <PrintOutlined />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('Canvas.BackgroundColor')}>
                            <IconButton onClick={() => {
                                if (!canvasRef?.current?.style)
                                    return

                                if (canvasRef?.current?.style.backgroundColor === hexToRgb(theme.palette.common.white))
                                    canvasRef.current.style.backgroundColor = theme.palette.common.black
                                else
                                    canvasRef.current.style.backgroundColor = theme.palette.common.white

                                rerender()

                                if (onChange && shapes.shapes.length > 0)
                                    onChange(false)
                            }}>
                                {canvasRef.current?.style.backgroundColor === hexToRgb(theme.palette.common.white) ? <LightModeOutlined fontSize='inherit' /> : <DarkModeOutlined fontSize='inherit' />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('Canvas.ClearCanvas')}>
                            <IconButton onClick={() => {
                                clear()
                                setShapes(new Shapes([]))
                            }}>
                                <CancelPresentationOutlined fontSize="medium" color='error' />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    <Divider variant='fullWidth' />

                    <Stack direction='row' alignItems='center' sx={{ width: 'max-content' }}>
                        <Tooltip title={t('Canvas.Select')}>
                            <IconButton onClick={() => setTool('select')}>
                                <NearMeOutlined color={tool === 'select' ? 'success' : undefined} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={t('Canvas.Pencil')}>
                            <IconButton onClick={() => setTool('pencil')}>
                                <EditOutlined color={tool === 'pencil' ? 'success' : undefined} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={t('Canvas.Eraser')}>
                            <IconButton onClick={() => setTool('eraser')}>
                                <EraserIcon color={tool === 'eraser' ? theme.palette.success[theme.palette.mode] : undefined} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={t('Canvas.Rectangle')}>
                            <IconButton onClick={() => setTool('rectangle')}>
                                <CheckBoxOutlineBlankOutlined color={tool === 'rectangle' ? 'success' : undefined} />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    <Divider variant='fullWidth' />

                    <Box sx={{ height: '4rem', overflowX: 'hidden', overflowY: 'hidden', width: '100%', pt: 1, m: 1, position: 'relative', boxShadow: 'inset 0 0 13px 0px black' }}>
                        <AnimatePresence mode="sync">
                            {tool === 'select' &&
                                <motion.div
                                    key={tool}
                                    initial='enter'
                                    animate='active'
                                    exit='exit'
                                    variants={variants}
                                    transition={mainTransition}
                                    style={{ height: '100%', width: '100%', position: 'absolute' }}
                                >
                                    <div style={{ height: '100%', width: '100%', paddingBottom: 1, overflowX: 'auto' }}>
                                        <SelectTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasRef.current?.style.backgroundColor ?? '#fff'} />
                                    </div>
                                </motion.div>
                            }

                            {tool === 'pencil' &&
                                <motion.div
                                    key={tool}
                                    initial='enter'
                                    animate='active'
                                    exit='exit'
                                    variants={variants}
                                    transition={mainTransition}
                                    style={{ height: '100%', width: '100%', position: 'absolute' }}
                                >
                                    <div style={{ width: '100%', paddingBottom: 1, overflowX: 'auto' }}>
                                        <PencilTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasRef.current?.style.backgroundColor ?? '#fff'} />
                                    </div>
                                </motion.div>
                            }

                            {tool === 'eraser' &&
                                <motion.div
                                    key={tool}
                                    initial='enter'
                                    animate='active'
                                    exit='exit'
                                    variants={variants}
                                    transition={mainTransition}
                                    style={{ height: '100%', width: '100%', position: 'absolute' }}
                                >
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <PencilTool shapes={shapes} mode='eraser' setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasRef.current?.style.backgroundColor ?? '#fff'} />
                                    </div>
                                </motion.div>
                            }

                            {tool === 'rectangle' &&
                                <motion.div
                                    key={tool}
                                    initial='enter'
                                    animate='active'
                                    exit='exit'
                                    variants={variants}
                                    transition={mainTransition}
                                    style={{ height: '100%', width: '100%', position: 'absolute' }}
                                >
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <RectangleTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasRef.current?.style.backgroundColor ?? '#fff'} />
                                    </div>
                                </motion.div>
                            }

                        </AnimatePresence>
                    </Box>

                    <Divider variant='middle' />

                    <Paper elevation={2} sx={{ flexGrow: 1, width: '100%', p: 1, m: 0 }}>
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
                <img ref={printRef} style={{ backgroundColor: canvasRef.current?.style.backgroundColor }} />
            </div>
        </>
    )
}
