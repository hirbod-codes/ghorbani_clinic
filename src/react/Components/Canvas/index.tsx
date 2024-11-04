import { Backdrop, Box, CircularProgress, Divider, IconButton, Paper, Stack, useTheme } from "@mui/material";
import { MutableRefObject, useEffect, useRef, useState } from "react";
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
    canvasRef?: MutableRefObject<HTMLCanvasElement>,
    onChange?: (empty?: boolean) => void | Promise<void>
    canvasBackground?: string
}

export function Canvas({ canvasRef, canvasBackground: canvasBackgroundInit, onChange }: CanvasProps) {
    if (!canvasRef)
        canvasRef = useRef()

    const theme = useTheme()
    const [canvasBackground, setCanvasBackground] = useState(canvasBackgroundInit ?? theme.palette.common.white)

    const [loading, setLoading] = useState<boolean>(false)

    const [shapes, setShapes] = useState<Shapes>(new Shapes([]))

    const [onDownHook, setOnDownHook] = useState<(draw: Draw) => void>(undefined)
    const [onUpHook, setOnUpHook] = useState<(draw: Draw) => void>(undefined)
    const [onHoverHook, setOnHoverHook] = useState<(draw: Draw) => void>(undefined)
    const [draw, setDraw] = useState<(draw: Draw) => void>(undefined)

    const [tool, setTool] = useState<Tool>('pencil')

    const { onDown, onUp, onMove, pointerDown, clear, empty } = useDraw(canvasRef, onChange, draw, onHoverHook, onDownHook, onUpHook)

    const printRef = useRef<HTMLImageElement>()
    const print = useReactToPrint({ onAfterPrint: () => { setLoading(false); printRef.current.src = undefined } })

    const resizeCanvas = (canvasRef: MutableRefObject<HTMLCanvasElement>) => {
        canvasRef.current.width = canvasRef.current.clientWidth
        canvasRef.current.height = canvasRef.current.clientHeight
        const ctx = canvasRef.current.getContext('2d')
        ctx.scale(1, 1)
    }

    useEffect(() => {
        if (canvasRef.current)
            resizeCanvas(canvasRef)
    }, [canvasRef.current])

    useEffect(() => {
        if (canvasRef.current)
            canvasRef.current.style.backgroundColor = canvasBackground
    }, [canvasBackground])

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
                <Stack direction='column' alignItems='start' sx={{ height: '100%' }}>
                    <Stack direction='row' alignItems='center' sx={{ width: 'max-content' }}>
                        <IconButton onClick={() => {
                            printRef.current.src = canvasRef.current.toDataURL()
                            setLoading(true)
                            print(null, () => printRef.current);
                        }}>
                            <PrintOutlined />
                        </IconButton>
                        <IconButton onClick={() => {
                            if (canvasBackground === theme.palette.common.white)
                                setCanvasBackground(theme.palette.common.black)
                            else
                                setCanvasBackground(theme.palette.common.white)
                        }}>
                            {canvasBackground === theme.palette.common.white ? <LightModeOutlined fontSize='inherit' /> : <DarkModeOutlined fontSize='inherit' />}
                        </IconButton>
                        <IconButton onClick={() => {
                            clear()
                            setShapes(new Shapes([]))
                        }}>
                            <CancelPresentationOutlined fontSize="medium" color='error' />
                        </IconButton>
                    </Stack>

                    <div style={{ /**width: '7rem',*/ height: '4rem', overflowX: 'auto', overflowY: 'hidden' }}>
                        <Stack direction='row' alignItems='center' sx={{ width: 'max-content' }}>
                            <IconButton onClick={() => setTool('select')}>
                                <NearMeOutlined color={tool === 'select' ? 'success' : undefined} />
                            </IconButton>
                            <IconButton onClick={() => setTool('pencil')}>
                                <EditOutlined color={tool === 'pencil' ? 'success' : undefined} />
                            </IconButton>
                            <IconButton onClick={() => setTool('eraser')}>
                                <EraserIcon color={tool === 'eraser' ? theme.palette.success[theme.palette.mode] : undefined} />
                            </IconButton>
                            <IconButton onClick={() => setTool('rectangle')}>
                                <CheckBoxOutlineBlankOutlined color={tool === 'rectangle' ? 'success' : undefined} />
                            </IconButton>
                        </Stack>
                    </div>

                    <Divider variant='middle' />

                    <Box sx={{ height: '4rem', overflowX: 'auto', overflowY: 'hidden', width: '100%', pt: 1, position: 'relative' }}>
                        <AnimatePresence mode="sync">
                            {tool === 'select' &&
                                <motion.div
                                    key={tool}
                                    initial='enter'
                                    animate='active'
                                    exit='exit'
                                    variants={variants}
                                    transition={mainTransition}
                                    style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'absolute' }}
                                >
                                    <SelectTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasBackground} />
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
                                    style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'absolute' }}
                                >
                                    <PencilTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasBackground} />
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
                                    style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'absolute' }}
                                >
                                    <PencilTool shapes={shapes} mode='eraser' setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasBackground} />
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
                                    style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'absolute' }}
                                >
                                    <RectangleTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasBackground} />
                                </motion.div>
                            }

                            {/* {tool === 'eraser' && <PencilTool shapes={shapes} mode='eraser' setOnDraw={setDraw} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasBackground} />} */}
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
                <img ref={printRef} style={{ backgroundColor: canvasBackground }} />
            </div>
        </>
    )
}

