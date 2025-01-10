import { useContext, useEffect, useState } from "react"
import { Shapes } from "../Shapes/Shapes"
import { Draw, Point } from "../types"
import { Rectangle } from "../Shapes/Rectangle"
import { HexAlphaColorPicker } from "react-colorful"
import { t } from "i18next"
import { Button } from "@/src/react/Components/Base/Button"
import { PaletteIcon, RotateCcwIcon } from "lucide-react"
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext"
import { Label } from "@/src/react/shadcn/components/ui/label"
import { Input } from "@/src/react/shadcn/components/ui/input"
import { DropdownMenu } from "../../DropdownMenu"

export type RectangleToolProps = {
    shapes: Shapes,
    canvasBackground: string,
    setOnDraw: (onDraw: (draw: Draw) => void) => void,
    setOnHoverHook: (onHoverHook: (draw: Draw) => void) => void,
    setOnUpHook: (setOnUpHook: (draw: Draw) => void) => void,
    setOnDownHook: (setOnDownHook: (draw: Draw) => void) => void,
}

export function RectangleTool({ shapes, canvasBackground, setOnDraw, setOnUpHook, setOnDownHook }: RectangleToolProps) {
    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [anchorType, setAnchorType] = useState<'stroke' | 'fill'>('fill')
    const [color, setColor] = useState<string>('#ffffff')

    const [stroke, setStroke] = useState<string | CanvasGradient | CanvasPattern>('#000000')
    const [fill, setFill] = useState<string | CanvasGradient | CanvasPattern>('#00000000')

    const [lineWidth, setLineWidth] = useState<string>('1.2')

    const [instance, setInstance] = useState<Rectangle | undefined>(undefined)
    const [hasMoved, setHasMoved] = useState<boolean>(false)
    const [referencePoint, setReferencePoint] = useState<Point | undefined>(undefined)

    const onDown = (draw: Draw) => {
        setReferencePoint(draw.currentPoint)

        shapes.helper = new Rectangle(draw.currentPoint.x, draw.currentPoint.y, 0, 0, Number(lineWidth), 'cyan', '#00000000')
    }

    const onUp = (draw: Draw) => {
        if (!referencePoint)
            return

        const helper = shapes.helper as Rectangle
        if (helper && hasMoved)
            shapes.push(new Rectangle(helper.x, helper.y, helper.w, helper.h, Number(lineWidth), stroke, fill))

        shapes.helper = undefined
        setReferencePoint(undefined)
        setInstance(undefined)
        setHasMoved(false)

        shapes.draw(draw)
    }

    const onDraw = (draw: Draw) => {
        if (!draw)
            return

        if (!hasMoved)
            setHasMoved(true);

        if (!referencePoint) {
            return
        }

        if (draw.currentPoint.x >= referencePoint.x)
            (shapes.helper as Rectangle).w = draw.currentPoint.x - referencePoint.x
        else {
            const diff = Math.abs(draw.currentPoint.x - referencePoint.x);
            (shapes.helper as Rectangle).x = referencePoint.x - diff;
            (shapes.helper as Rectangle).w = diff;
        }

        if (draw.currentPoint.y >= referencePoint.y)
            (shapes.helper as Rectangle).h = draw.currentPoint.y - referencePoint.y
        else {
            const diff = Math.abs(draw.currentPoint.y - referencePoint.y);
            (shapes.helper as Rectangle).y = referencePoint.y - diff;
            (shapes.helper as Rectangle).h = diff
        }

        shapes.draw(draw)
    }

    useEffect(() => {
        setOnDraw(() => onDraw)
        setOnUpHook(() => onUp)
        setOnDownHook(() => onDown)
    }, [fill, stroke, instance, hasMoved])

    return (
        <>
            <div className='flex flex-row items-center w-min min-w-full space-y-2'>
                <DropdownMenu
                    trigger={<><PaletteIcon onClick={(e) => { setColor(fill as string) }} style={{ backgroundColor: color }} stroke={fill as string} />{t('RectangleTool.FillColor')}</>}
                    contents={[
                        {
                            type: 'label',
                            content: t('PencilTool.selectColor')
                        },
                        {
                            type: 'separator',
                        },
                        {
                            type: 'item',
                            options: {},
                            content: <HexAlphaColorPicker color={color} onChange={(c) => { setColor(c); setFill(c) }} />
                        }
                    ]}
                />

                <DropdownMenu
                    trigger={<><PaletteIcon onClick={(e) => { setColor(stroke as string) }} style={{ backgroundColor: color }} stroke={stroke as string} />{t('RectangleTool.StrokeColor')}</>}
                    contents={[
                        {
                            type: 'label',
                            content: t('PencilTool.selectColor')
                        },
                        {
                            type: 'separator',
                        },
                        {
                            type: 'item',
                            options: {},
                            content: <HexAlphaColorPicker color={color} onChange={(c) => { setColor(c); setStroke(c) }} />
                        }
                    ]}
                />

                <div className="flex items-center space-x-2">
                    <Label htmlFor="lineWidth">
                        {t('Canvas .lineWidth')}
                    </Label>
                    <Input type='text' id='lineWidth' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth} />
                </div>

                <Button
                    style={{ backgroundColor: color }}
                    isIcon
                    onClick={() => {
                        setStroke('#ff0000')
                        setFill('#00ff00')
                        setAnchorType('fill')
                        setLineWidth('1.2')
                    }}
                >
                    <RotateCcwIcon stroke={themeOptions.colors.foreground} />
                </Button>
            </div>
        </>
    )
}
