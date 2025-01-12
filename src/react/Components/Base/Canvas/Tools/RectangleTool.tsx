import { useContext, useEffect, useRef, useState } from "react"
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
import { Stack } from "../../Stack"
import { i } from "vite/dist/node/types.d-aGj9QkWt"
import { ColorPicker } from "../../../ColorPicker"
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic"

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

    const strokeColorButtonRef = useRef<HTMLButtonElement>(null)
    const fillColorButtonRef = useRef<HTMLButtonElement>(null)
    const [color, setColor] = useState<string>('#ffffff')

    const [strokeOpen, setStrokeOpen] = useState<boolean>(false)
    const [fillOpen, setFillOpen] = useState<boolean>(false)

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
        <Stack stackProps={{ className: 'items-center w-max' }}>
            <Button
                buttonRef={fillColorButtonRef}
                variant='outline'
                onClick={() => { setColor(fill as string); setFillOpen(true) }}
                style={{ backgroundColor: color }}
            >
                <PaletteIcon />
                {t('RectangleTool.FillColor')}
            </Button>

            <DropdownMenu
                anchorRef={fillColorButtonRef}
                open={fillOpen}
                onOpenChange={(b) => { if (!b) setFillOpen(false) }}
            >
                <ColorPicker
                    controlledColor={ColorStatic.parse(color).toHsv()}
                    onColorChanged={(c) => { setColor(c.toHex()); setFill(c.toHex()) }}
                />
            </DropdownMenu>

            <Button
                buttonRef={strokeColorButtonRef}
                variant='outline'
                onClick={() => { setColor(stroke as string); setStrokeOpen(true) }}
                style={{ backgroundColor: color }}
            >
                <PaletteIcon />
                {t('RectangleTool.StrokeColor')}
            </Button>

            <DropdownMenu
                anchorRef={strokeColorButtonRef}
                open={strokeOpen}
                onOpenChange={(b) => { if (!b) setStrokeOpen(false) }}
            >
                <ColorPicker
                    controlledColor={ColorStatic.parse(color).toHsv()}
                    onColorChanged={(c) => { setColor(c.toHex()); setStroke(c.toHex()) }}
                />
            </DropdownMenu>

            <div className="flex items-center space-x-2">
                <Label htmlFor="lineWidth">
                    {t('Canvas .lineWidth')}
                </Label>
                <Input type='text' id='lineWidth' className="w-[2cm]" onChange={(e) => setLineWidth(e.target.value)} value={lineWidth} />
            </div>

            <Button
                isIcon
                variant='text'
                fgColor='error'
                onClick={() => {
                    setStroke('#ff0000')
                    setFill('#00ff00')
                    setLineWidth('1.2')
                }}
            >
                <RotateCcwIcon />
            </Button>
        </Stack>
    )
}
