import { AnimatePresence } from 'framer-motion';
import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Rect } from 'react-konva';
import { motion } from 'framer-motion'
import { Box, CircularProgress, FormControl, IconButton, InputLabel, Menu, MenuItem, Paper, Select, Stack, TextField, useTheme } from '@mui/material';
import { LineCap, LineJoin } from 'konva/lib/Shape';
import { ColorLensOutlined, PrintOutlined } from '@mui/icons-material';
import { HexAlphaColorPicker } from 'react-colorful';
import { t } from 'i18next';
import { useReactToPrint } from 'react-to-print';
import { Stage as StageType } from 'konva/lib/Stage';

type CanvasEvents = {
    onMouseDown?: (e: Konva.KonvaEventObject<globalThis.MouseEvent>) => void;
    onMouseMove?: (e: Konva.KonvaEventObject<globalThis.MouseEvent>) => void;
    onMouseUp?: (e?: Konva.KonvaEventObject<globalThis.MouseEvent>) => void;
}

type Tool = 'pen' | 'eraser' | 'rect' | 'cycle'
type CanvasContext = { shapes: Shapes }
type Shapes = {
    lines: Line[],
    rectangles: { x: number, y: number, width: number, height: number }[],
    circles: {}[],
}
type Line = {
    mode: 'pen' | 'eraser';
    points: number[];
    stroke: string;
    strokeWidth: number;
    tension: number;
    lineCap: LineCap;
    lineJoin: LineJoin;
}
type Shape = keyof Shapes

export function Canvas({ canvasRef, canvasBackground }: { canvasRef?: MutableRefObject<StageType>, canvasBackground?: string }) {
    if (!canvasRef)
        canvasRef = useRef<StageType>()

    const theme = useTheme()
    if (!canvasBackground)
        canvasBackground = theme.palette.common.white

    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

    const [onMouseEvents, setOnMouseEvents] = useState<CanvasEvents>()
    const [ctx, setCtx] = useState<CanvasContext>({ shapes: { lines: [], rectangles: [], circles: [] } })

    const [tool, setTool] = useState<'pen' | 'eraser' | 'rect' | 'cycle'>('pen');
    const [lines, setLines] = useState<{ tool: 'pen' | 'eraser', points: number[] }[]>([]);
    const [rectangles, setRectangles] = useState<{ x: number, y: number, width: number, height: number }[]>([{ x: 10, y: 10, width: 100, height: 100 }]);
    const [editingRectangle, setEditingRectangle] = useState<{ x: number, y: number, width: number, height: number }>(undefined);
    const [mouseDownPointerPosition, setMouseDownPointerPosition] = useState<Vector2d>(undefined)

    const isDrawing = useRef(false);

    const container = useRef<HTMLDivElement>()

    const handleMouseDown = (e: Konva.KonvaEventObject<globalThis.MouseEvent>) => {
        const pos = e.target.getStage().getPointerPosition();
        setMouseDownPointerPosition(pos)

        if (tool === 'pen' || tool === 'eraser') {
            isDrawing.current = true;
            setLines([...lines, { tool, points: [pos.x, pos.y] }]);
        } else if (tool === 'rect') {
            isDrawing.current = true;
            setEditingRectangle({ x: pos.x, y: pos.y, width: 0, height: 0 });
        }
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<globalThis.MouseEvent>) => {
        if (!isDrawing.current)
            return;

        const point = e.target.getStage().getPointerPosition();

        if (tool === 'pen' || tool === 'eraser') {
            if (lines.length !== 0)
                lines[lines.length - 1].points = lines[lines.length - 1].points.concat([point.x, point.y]);
            else
                lines.push({ points: [point.x, point.y], tool: 'pen' })

            setLines([...lines]);
        } else if (tool === 'rect') {
            if (editingRectangle)
                setEditingRectangle({
                    x: point.x < mouseDownPointerPosition.x ? point.x : mouseDownPointerPosition.x,
                    y: point.y < mouseDownPointerPosition.y ? point.y : mouseDownPointerPosition.y,
                    width: Math.abs(point.x - mouseDownPointerPosition.x),
                    height: Math.abs(point.y - mouseDownPointerPosition.y)
                })
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;

        if (tool === 'rect') {
            setRectangles([...rectangles, editingRectangle])
            setEditingRectangle(undefined)
        }
    }

    const [isPrinting, setIsPrinting] = useState<boolean>()
    const printRef = useRef<HTMLImageElement>()
    const print = useReactToPrint({ onAfterPrint: () => { setIsPrinting(false); printRef.current.src = undefined } })

    useEffect(() => {
        console.log('useEffect', container.current)
        if (container.current && canvasDimensions.width === 0)
            setCanvasDimensions({
                width: container.current?.offsetWidth,
                height: container.current?.offsetHeight,
            })
    }, [container.current])

    return (
        <>
            <Stack spacing={1} direction='column' alignItems='start' sx={{ overflow: 'hidden', width: '100%', height: '100%' }} style={{ direction: 'ltr' }}>
                <select
                    value={tool}
                    onChange={(e) => {
                        setTool(e.target.value as any);
                    }}
                >
                    <option value="rect">rect</option>
                    <option value="pen">pen</option>
                    <option value="eraser">eraser</option>
                    <option value="cycle">cycle</option>
                </select>

                <IconButton onClick={() => {
                    printRef.current.src = canvasRef.current.toDataURL()
                    setIsPrinting(true)
                    print(null, () => printRef.current);
                }}>
                    {!isPrinting ? <PrintOutlined /> : <CircularProgress size={30} />}
                </IconButton>

                <Box sx={{ overflowX: 'auto', overflowY: 'hidden', height: '2cm', width: '100%' }}>
                    <AnimatePresence mode='wait'>
                        {...[
                            ((tool === 'pen' || tool === 'eraser') && <PenToolOptions mode={tool} setOnMouseEvents={setOnMouseEvents} canvasContext={ctx} setCanvasContext={setCtx} />),
                            // (tool === 'rect' && <RectToolOptions mouseEvents={setOnMouseEvents} setShapes={setShapes} />),
                            // (tool === 'cycle' && <CycleToolOptions mouseEvents={setOnMouseEvents} setShapes={setShapes} />),
                        ]
                            .filter(f => f)
                            .map((elm, i) =>
                                <motion.div key={i}>
                                    {elm}
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                </Box>
                <div>
                </div>
                <Paper elevation={2} sx={{ p: 1, m: 0, width: '100%', flexGrow: 2 }} ref={container}>
                    <Stage
                        style={{ background: canvasBackground }}
                        width={canvasDimensions.width}
                        height={canvasDimensions.height}
                        onMouseDown={onMouseEvents?.onMouseDown}
                        onMousemove={onMouseEvents?.onMouseMove}
                        onMouseup={onMouseEvents?.onMouseUp}
                        ref={canvasRef}
                    >
                        <Layer style={{ border: '1px solid red' }}>
                            <Text text="Just start drawing" x={5} y={5} />
                            {/* {editingRectangle &&
                            <Rect
                                x={editingRectangle.x}
                                y={editingRectangle.y}
                                width={editingRectangle.width}
                                height={editingRectangle.height}
                                draggable={true}
                                cornerRadius={5}
                                stroke="#df4b2640"
                                strokeWidth={5}
                            />
                        } */}
                            {ctx.shapes.rectangles.map((r, i) =>
                                <Rect
                                    key={i}
                                    x={r.x}
                                    y={r.y}
                                    width={r.width}
                                    height={r.height}
                                    draggable={true}
                                    cornerRadius={5}
                                    stroke="#df4b26"
                                    strokeWidth={5}
                                />
                            )}

                            {ctx.shapes.lines.map((line, i) => (
                                <Line
                                    key={i}
                                    points={line.points}
                                    globalCompositeOperation={line.mode === 'eraser' ? 'destination-out' : 'source-over'}
                                    stroke={line.stroke}
                                    strokeWidth={line.strokeWidth}
                                    tension={line.tension}
                                    lineCap={line.lineCap}
                                    lineJoin={line.lineJoin}
                                // stroke="#df4b26"
                                // strokeWidth={5}
                                // tension={0.5}
                                // lineCap="round"
                                // lineJoin="round"
                                />
                            ))}
                        </Layer>
                    </Stage>
                </Paper>
            </Stack>

            <div style={{ display: 'none' }}>
                <img ref={printRef} style={{ backgroundColor: canvasBackground }} />
            </div>
        </>
    );
};

function PenToolOptions({ mode, setOnMouseEvents, canvasContext, setCanvasContext }: { mode: 'pen' | 'eraser', setOnMouseEvents?: (events: CanvasEvents) => void, canvasContext: CanvasContext, setCanvasContext: (canvasContext: CanvasContext | ((canvasContext: CanvasContext) => CanvasContext)) => void }) {
    const isDrawing = useRef<boolean>(false)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const [stroke, setStroke] = useState<string>("red")
    const [strokeWidth, setStrokeWidth] = useState<number>(1.2)
    const [tension, setTension] = useState<number>(0.5)
    const [lineCap, setLineCap] = useState<LineCap>("round")
    const [lineJoin, setLineJoin] = useState<LineJoin>("round")

    function onMouseDown(e: Konva.KonvaEventObject<globalThis.MouseEvent>) {
        const pos = e.target.getStage().getPointerPosition();
        isDrawing.current = true;

        canvasContext.shapes.lines = canvasContext.shapes.lines.concat({ mode, points: [pos.x, pos.y], stroke, strokeWidth, tension, lineCap, lineJoin })
        setCanvasContext({ ...canvasContext })
    }

    function onMouseMove(e: Konva.KonvaEventObject<globalThis.MouseEvent>) {
        if (!isDrawing.current)
            return;

        const pos = e.target.getStage().getPointerPosition();

        if (canvasContext.shapes.lines.length === 0)
            canvasContext.shapes.lines.push({ mode: 'pen', points: [pos.x, pos.y], stroke, strokeWidth, tension, lineCap, lineJoin })
        else
            canvasContext.shapes.lines[canvasContext.shapes.lines.length - 1].points = canvasContext.shapes.lines[canvasContext.shapes.lines.length - 1].points.concat([pos.x, pos.y])

        setCanvasContext({ ...canvasContext })
    }

    function onMouseUp(e?: Konva.KonvaEventObject<globalThis.MouseEvent>) { isDrawing.current = false }

    useEffect(() => {
        if (setOnMouseEvents)
            setOnMouseEvents({
                onMouseDown: onMouseDown,
                onMouseMove: onMouseMove,
                onMouseUp: onMouseUp
            })
    }, [stroke, strokeWidth, tension, lineCap, lineJoin])

    return (
        <>
            {/* <div style={{ width: '100%', overflowX: 'auto' }}> */}
            <Stack spacing={1} direction='row' alignItems='center' sx={{ width: 'fit-content' }}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <ColorLensOutlined />
                </IconButton>

                <div style={{ width: '5rem' }}>
                    <TextField type='text' label={t('Canvas.tension')} variant='standard' onChange={(e) => setTension(Number(e.target.value))} value={tension.toString()} />
                </div>

                <div style={{ width: '5rem' }}>
                    <TextField type='text' label={t('Canvas.lineWidth')} variant='standard' onChange={(e) => setStrokeWidth(Number(e.target.value))} value={strokeWidth.toString()} />
                </div>

                <div style={{ width: '9rem' }}>
                    <FormControl variant='standard' >
                        <InputLabel id="line-cap-label">{t('Canvas.lineCap')}</InputLabel>
                        <Select
                            onChange={(e) => setLineCap(e.target.value as LineCap)}
                            labelId="line-cap-label"
                            id='line-cap'
                            value={lineCap}
                        >
                            <MenuItem value='butt'>{t('Canvas.butt')}</MenuItem>
                            <MenuItem value='round'>{t('Canvas.round')}</MenuItem>
                            <MenuItem value='square'>{t('Canvas.square')}</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div style={{ width: '9rem' }}>
                    <FormControl variant='standard' >
                        <InputLabel id="line-join-label">{t('Canvas.lineJoin')}</InputLabel>
                        <Select
                            onChange={(e) => setLineJoin(e.target.value as LineJoin)}
                            labelId="line-join-label"
                            id='line-join'
                            value={lineCap}
                        >
                            <MenuItem value='round'>{t('Canvas.round')}</MenuItem>
                            <MenuItem value='bevel'>{t('Canvas.bevel')}</MenuItem>
                            <MenuItem value='miter'>{t('Canvas.miter')}</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </Stack>
            {/* </div> */}

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
                    <HexAlphaColorPicker color={stroke} onChange={(c) => setStroke(c)} />
                </Stack>
            </Menu>
        </>
    )
}

function EraserToolOptions({ mouseEvents }: { mouseEvents: (events: CanvasEvents) => void }) {
    return (
        <>
        </>
    )
}

function RectToolOptions({ mouseEvents }: { mouseEvents: (events: CanvasEvents) => void }) {
    return (
        <>
            <div style={{ overflow: 'auto' }}>
                <Stack spacing={1} direction='row' alignItems='center' sx={{ width: 'fit-content' }}>
                </Stack>
            </div>
        </>
    )
}

function CycleToolOptions({ mouseEvents }: { mouseEvents: (events: CanvasEvents) => void }) {
    return (
        <>
        </>
    )
}
