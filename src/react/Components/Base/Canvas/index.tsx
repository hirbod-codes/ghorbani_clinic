import { ComponentProps, Fragment, MutableRefObject, ReactNode, useContext, useEffect, useReducer, useRef, useState } from "react";
import { Draw } from "./types";
import { useDraw } from "./useDraw";
import { useReactToPrint } from "react-to-print";
import { PencilTool } from "./Tools/PencilTool";
import { Shapes } from "./Shapes/Shapes";
import { RectangleTool } from "./Tools/RectangleTool";
import { SelectTool } from "./Tools/SelectTool";
import { t } from "i18next";
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext";
import { AnimatedSlide } from "../../Animations/AnimatedSlide";
import { CircularLoadingIcon } from "../CircularLoadingIcon";
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { Tooltip } from "../Tooltip";
import { EraserIcon, MoonIcon, MousePointer2Icon, PencilLineIcon, PrinterIcon, SquareIcon, SquareXIcon, SunIcon } from "lucide-react";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic";
import { cn } from "@/src/react/shadcn/lib/utils";
import { IShape } from "./Shapes/IShape";

export type Tool = 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'select'

export type CanvasProps = {
    canvasRef?: MutableRefObject<HTMLCanvasElement | null>
    onChange?: (shapes: IShape[], empty?: boolean) => void | Promise<void>
    canvasBackground?: string
    canvasProps?: ComponentProps<'canvas'>
    defaultShapes?: IShape[]
}

export function Canvas({ canvasRef, canvasBackground: canvasBackgroundInit, onChange, canvasProps, defaultShapes }: CanvasProps) {
    if (!canvasRef)
        canvasRef = useRef<HTMLCanvasElement | null>(null)

    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    const [, rerender] = useReducer(x => x + 1, 0)

    const [loading, setLoading] = useState<boolean>(false)

    const [shapes, setShapes] = useState<Shapes>(new Shapes(defaultShapes))

    const [onDownHook, setOnDownHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [onUpHook, setOnUpHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [onHoverHook, setOnHoverHook] = useState<((draw: Draw) => void) | undefined>(undefined)
    const [draw, setDraw] = useState<((draw: Draw) => void) | undefined>(undefined)

    const [tool, setTool] = useState<Tool>('pencil')
    const [toolNode, setToolNode] = useState<[{ key: string, elm: ReactNode }]>([{
        key: 'string', elm: <div style={{ height: '100%', width: '100%', paddingBottom: 1, overflowX: 'auto' }}>
            <PencilTool shapes={shapes} setOnDraw={setDraw} setOnHoverHook={setOnHoverHook} setOnDownHook={setOnDownHook} setOnUpHook={setOnUpHook} canvasBackground={canvasBackgroundInit ?? (canvasRef.current?.style.backgroundColor ?? '#fff')} />
        </div>
    }])

    const { onDown, onUp, onMove, clear } = useDraw(canvasRef, (e) => { if (onChange) onChange(shapes.shapes, e) }, draw, onHoverHook, onDownHook, onUpHook)

    const printRef = useRef<HTMLImageElement | null>(null)
    const print = useReactToPrint({ onAfterPrint: () => { setLoading(false); if (printRef.current) printRef.current.src = '' } })

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = canvasRef.current.clientWidth
            canvasRef.current.height = canvasRef.current.clientHeight
            const ctx = canvasRef.current.getContext('2d')!
            ctx.scale(1, 1)

            shapes.draw({ canvasRef, ctx })
        }
    }, [canvasRef.current])

    return (
        <>
            <AnimatedSlide open={loading}>
                <CircularLoadingIcon />
            </AnimatedSlide>

            <div style={{ display: 'none' }}>
                <img ref={printRef} style={{ backgroundColor: canvasRef.current?.style.backgroundColor }} />
            </div>

            <Stack direction="vertical" stackProps={{ id: 'canvas', className: 'h-full items-stretch mx-0' }}>
                <Stack stackProps={{ className: 'items-center w-max' }}>
                    <Tooltip tooltipContent={t('Canvas.Print')}>
                        <Button
                            isIcon
                            variant='text'
                            onClick={() => {
                                if (!printRef.current)
                                    return

                                printRef.current.src = canvasRef.current?.toDataURL() ?? ''
                                setLoading(true)
                                print(null, () => printRef.current!);
                            }}>
                            <PrinterIcon />
                        </Button>
                    </Tooltip>

                    <Tooltip tooltipContent={t('Canvas.BackgroundColor')}>
                        <Button
                            isIcon
                            variant='text'
                            onClick={() => {
                                if (!canvasRef?.current?.style)
                                    return

                                if (!canvasRef.current.style.backgroundColor) {
                                    canvasRef.current.style.backgroundColor = themeOptions.colors.surface[themeOptions.mode]["container-high"]
                                    canvasRef.current.style.borderColor = themeOptions.colors.surface[themeOptions.mode]["container-high"]
                                } else if (ColorStatic.parse(canvasRef.current.style.backgroundColor).toHex() === ColorStatic.parse(themeOptions.colors.surface.light["container-high"]).toHex()) {
                                    canvasRef.current.style.backgroundColor = themeOptions.colors.surface.dark["container-high"]
                                    canvasRef.current.style.borderColor = themeOptions.colors.surface.dark["container-high"]
                                } else {
                                    canvasRef.current.style.backgroundColor = themeOptions.colors.surface.light["container-high"]
                                    canvasRef.current.style.borderColor = themeOptions.colors.surface.light["container-high"]
                                }

                                rerender()

                                if (onChange && shapes.shapes.length > 0)
                                    onChange(shapes.shapes, false)
                            }}>
                            {canvasRef.current?.style.backgroundColor === themeOptions.colors.surface.light["container-high"] ? <SunIcon fontSize='inherit' /> : <MoonIcon fontSize='inherit' />}
                        </Button>
                    </Tooltip>

                    <Tooltip tooltipContent={t('Canvas.Reset')}>
                        <Button
                            isIcon
                            variant='text'
                            fgColor='error'
                            onClick={() => {
                                clear()
                                setShapes(new Shapes([]))
                            }}>
                            <SquareXIcon fontSize="medium" />
                        </Button>
                    </Tooltip>
                </Stack>

                <Separator />

                <Stack stackProps={{ className: 'items-center w-max' }}>
                    <Tooltip tooltipContent={t('Canvas.Select')}>
                        <Button
                            isIcon
                            variant={tool === 'select' ? 'outline' : 'text'}
                            fgColor={tool === 'select' ? 'success' : undefined}
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
                            variant={tool === 'pencil' ? 'outline' : 'text'}
                            fgColor={tool === 'pencil' ? 'success' : undefined}
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
                            <PencilLineIcon />
                        </Button>
                    </Tooltip>

                    <Tooltip tooltipContent={t('Canvas.Eraser')}>
                        <Button
                            isIcon
                            variant={tool === 'eraser' ? 'outline' : 'text'}
                            fgColor={tool === 'eraser' ? 'success' : undefined}
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
                            variant={tool === 'rectangle' ? 'outline' : 'text'}
                            fgColor={tool === 'rectangle' ? 'success' : undefined}
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
                </Stack>

                <Separator />

                <div className="h-[1.5cm] w-full pt-1 relative shadow-inner shadow-black">
                    {toolNode.map(n => <Fragment key={n.key}>{n.elm}</Fragment>)}
                </div>

                <Separator />

                <canvas
                    {...canvasProps}
                    ref={canvasRef}
                    className={cn("flex-grow w-full m-0 rounded-md select-none touch-none", canvasProps?.className)}
                    style={{ backgroundColor: canvasBackgroundInit ?? themeOptions.colors.surface[themeOptions.mode]["container-high"], boxShadow: '0 0 10px -1px black', ...canvasProps?.style }}
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
            </Stack>
        </>
    )
}
