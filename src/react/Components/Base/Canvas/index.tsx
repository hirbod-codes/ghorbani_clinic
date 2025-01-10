import { MutableRefObject, ReactNode, useContext, useEffect, useReducer, useRef, useState } from "react";
import { Draw } from "./types";
import { useDraw } from "./useDraw";
import { useReactToPrint } from "react-to-print";
import { PencilTool } from "./Tools/PencilTool";
import { Shapes } from "./Shapes/Shapes";
import { RectangleTool } from "./Tools/RectangleTool";
import { EraserIcon } from "../../Icons/EraserIcon";
import { SelectTool } from "./Tools/SelectTool";
import { mainTransition } from "../../../Styles/animations";
import { t } from "i18next";
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext";
import { AnimatedSlide } from "../../Animations/AnimatedSlide";
import { CircularLoading } from "../CircularLoading";
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { Tooltip } from "../Tooltip";
import { PenConnectIcon } from "../../Icons/PenConnectIcon";
import { MoonIcon, MousePointer2Icon, SquareIcon, SquareXIcon, SunIcon } from "lucide-react";
import { AnimatedList } from "../../Animations/AnimatedList";
import { Button } from "../Button";

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

    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    const [, rerender] = useReducer(x => x + 1, 0)

    const [loading, setLoading] = useState<boolean>(false)

    const [shapes, setShapes] = useState<Shapes>(new Shapes([]))

    const [onDownHook, setOnDownHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [onUpHook, setOnUpHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [onHoverHook, setOnHoverHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [draw, setDraw] = useState<((draw: Draw) => void) | undefined>(undefined)

    const [tool, setTool] = useState<Tool>('pencil')
    const [toolNode, setToolNode] = useState<[{ key: string, elm: ReactNode }]>([{ key: 'string', elm: <></> }])

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
            <AnimatedSlide open={loading}>
                <CircularLoading />
            </AnimatedSlide>

            <div className="w-full h-full">
                <div className="flex flex-col h-full items-stretch">
                    <div className="flex flex-row row items-center w-max">
                        <Tooltip tooltipContent={t('Canvas.Print')}>
                            <Button
                                isIcon
                                onClick={() => {
                                    if (!printRef.current)
                                        return

                                    printRef.current.src = canvasRef.current?.toDataURL() ?? ''
                                    setLoading(true)
                                    print(null, () => printRef.current!);
                                }}>
                                <PenConnectIcon />
                            </Button>
                        </Tooltip>

                        <Tooltip tooltipContent={t('Canvas.BackgroundColor')}>
                            <Button
                                isIcon
                                onClick={() => {
                                    if (!canvasRef?.current?.style)
                                        return

                                    if (canvasRef?.current?.style.backgroundColor === themeOptions.colors.surface[themeOptions.mode].bright)
                                        canvasRef.current.style.backgroundColor = themeOptions.colors.surface[themeOptions.mode].dim
                                    else
                                        canvasRef.current.style.backgroundColor = themeOptions.colors.surface[themeOptions.mode].bright

                                    rerender()

                                    if (onChange && shapes.shapes.length > 0)
                                        onChange(false)
                                }}>
                                {canvasRef.current?.style.backgroundColor === themeOptions.colors.surface[themeOptions.mode].bright ? <SunIcon fontSize='inherit' /> : <MoonIcon fontSize='inherit' />}
                            </Button>
                        </Tooltip>

                        <Tooltip tooltipContent={t('Canvas.BackgroundColor')}>
                            <Button
                                isIcon
                                color='error'
                                onClick={() => {
                                    clear()
                                    setShapes(new Shapes([]))
                                }}>
                                <SquareXIcon fontSize="medium" />
                            </Button>
                        </Tooltip>
                    </div>

                    <Separator />

                    <div className="flex flex-row row items-center w-max">
                        <Tooltip tooltipContent={t('Canvas.Select')}>
                            <Button
                                isIcon
                                color={tool === 'select' ? 'primary' : undefined}
                                onClick={() => {
                                    setTool('select')
                                    setToolNode([{
                                        key: 'select',
                                        elm: <div style={{ height: '100%', width: '100%', paddingBottom: 1, overflowX: 'auto' }}>
                                            <SelectTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasRef.current?.style.backgroundColor ?? '#fff'} />
                                        </div>
                                    }])
                                }}
                            >
                                <MousePointer2Icon />
                            </Button>
                        </Tooltip>

                        <Tooltip tooltipContent={t('Canvas.Pencil')}>
                            <Button
                                isIcon
                                color={tool === 'pencil' ? 'primary' : undefined}
                                onClick={() => {
                                    setTool('pencil')
                                    setToolNode([{
                                        key: 'pencil',
                                        elm: <div style={{ height: '100%', width: '100%', paddingBottom: 1, overflowX: 'auto' }}>
                                            <PencilTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasRef.current?.style.backgroundColor ?? '#fff'} />
                                        </div>
                                    }])
                                }}
                            >
                                <MousePointer2Icon />
                            </Button>
                        </Tooltip>

                        <Tooltip tooltipContent={t('Canvas.Eraser')}>
                            <Button
                                isIcon
                                color={tool === 'eraser' ? 'primary' : undefined}
                                onClick={() => {
                                    setTool('eraser')
                                    setToolNode([{
                                        key: 'eraser',
                                        elm: <div style={{ height: '100%', width: '100%', paddingBottom: 1, overflowX: 'auto' }}>
                                            <PencilTool shapes={shapes} mode='eraser' setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasRef.current?.style.backgroundColor ?? '#fff'} />
                                        </div>
                                    }])
                                }}
                            >
                                <EraserIcon />
                            </Button>
                        </Tooltip>

                        <Tooltip tooltipContent={t('Canvas.Rectangle')}>
                            <Button
                                isIcon
                                color={tool === 'eraser' ? 'primary' : undefined}
                                onClick={() => {
                                    setTool('rectangle')
                                    setToolNode([{
                                        key: 'rectangle',
                                        elm: <div style={{ height: '100%', width: '100%', paddingBottom: 1, overflowX: 'auto' }}>
                                            <RectangleTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasRef.current?.style.backgroundColor ?? '#fff'} />
                                        </div>
                                    }])
                                }}
                            >
                                <SquareIcon />
                            </Button>
                        </Tooltip>
                    </div>

                    <Separator />

                    <div className="w-full h-20 overflow-x-hidden pt-1 m-1 relative shadow-inner shadow-black">
                        <AnimatedList collection={toolNode} />
                    </div>

                    <Separator />

                    <div className="flex-grow w-full p-1 m-0">
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
                    </div>
                </div>
            </div>

            <div style={{ display: 'none' }}>
                <img ref={printRef} style={{ backgroundColor: canvasRef.current?.style.backgroundColor }} />
            </div>
        </>
    )
}
