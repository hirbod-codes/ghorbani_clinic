import { useContext, useEffect, useRef, useState } from "react";
import { Draw } from "../types";
import { t } from "i18next";
import { Line } from "../Shapes/Line";
import { Shapes } from "../Shapes/Shapes";
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext";
import { Button } from "@/src/react/Components/Base/Button";
import { PaletteIcon, PenIcon, PenLineIcon, RotateCcwIcon } from "lucide-react";
import { Input } from "@/src/react/shadcn/components/ui/input";
import { Label } from "@/src/react/shadcn/components/ui/label";
import { DropdownMenu } from "../../DropdownMenu";
import { ColorPicker } from "../../../ColorPicker";
import { Stack } from "../../Stack";
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic";

export type PencilToolProps = {
    shapes: Shapes,
    canvasBackground: string,
    setOnDraw: (onDraw: (draw: Draw) => void) => void,
    setOnHoverHook: (onHoverHook: (draw: Draw) => void) => void,
    setOnUpHook: (setOnUpHook: (draw: Draw) => void) => void,
    setOnDownHook: (setOnDownHook: (draw: Draw) => void) => void,
    mode?: 'pencil' | 'eraser'
}

export function PencilTool({ shapes, canvasBackground, setOnDraw, setOnUpHook, setOnDownHook, mode = 'pencil' }: PencilToolProps) {
    const [open, setOpen] = useState<boolean>(false)
    const ref = useRef<HTMLButtonElement>(null)

    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    const getDefaultColor = () =>
        ColorStatic.parse(canvasBackground).toHex() === ColorStatic.parse(themeOptions.colors.surface.light["container-high"]).toHex()
            ? themeOptions.colors.surface.light.foreground
            : themeOptions.colors.surface.dark.foreground

    const [color, setColor] = useState<string>(getDefaultColor())
    const [lineWidth, setLineWidth] = useState<string>('1.2')

    const [isPressureSensitive, setIsPressureSensitive] = useState<boolean>(true)
    const [pressureMagnitude, setPressureMagnitude] = useState<string>('9')

    if (mode === 'eraser' && color !== canvasBackground)
        setColor(canvasBackground)

    const [instance, setInstance] = useState<Line | undefined>(undefined)
    const [hasMoved, setHasMoved] = useState<boolean>(false)

    const onDown = (draw: Draw) => {
        setInstance(new Line(Number(lineWidth), color, Number(pressureMagnitude), isPressureSensitive, mode))
    }

    const onUp = (draw: Draw) => {
        if (hasMoved && instance !== undefined)
            shapes.push(instance)

        setInstance(undefined)
        setHasMoved(false)
    }

    const onDraw = (draw: Draw) => {
        if (!draw)
            return

        if (!hasMoved)
            setHasMoved(true)

        if (instance)
            instance.draw(draw)
    }

    useEffect(() => {
        setOnDraw(() => onDraw)
        setOnUpHook(() => onUp)
        setOnDownHook(() => onDown)
    }, [color, lineWidth, instance, hasMoved])

    return (
        <Stack stackProps={{ className: 'items-center h-full w-max' }}>
            <Button buttonRef={ref} isIcon variant='text' rawFgColor={color} onClick={() => setOpen(true)}>
                <PaletteIcon />
            </Button>

            <DropdownMenu
                anchorRef={ref}
                open={open}
                onOpenChange={(b) => { if (!b) setOpen(false) }}
                containerProps={{ className: 'z-50 p-2 border rounded-md bg-surface-container-high' }}
            >
                <ColorPicker
                    controlledColor={ColorStatic.parse(color).toHsv()}
                    onColorChanged={(c) => {
                        setColor(c.toHex())
                    }}
                />
            </DropdownMenu>

            <Button isIcon variant='text' rawFgColor={isPressureSensitive ? themeOptions.colors.success[themeOptions.mode].main : themeOptions.colors.primary[themeOptions.mode].main} onClick={() => setIsPressureSensitive(!isPressureSensitive)}>
                <PenIcon />
            </Button>

            <Stack stackProps={{ className: "items-center" }}>
                <Label htmlFor="lineWidth">
                    {t('Canvas.lineWidth')}
                </Label>
                <Input className="w-[2cm]" type='text' id='lineWidth' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth} />
            </Stack>

            <Stack stackProps={{ className: "items-center" }}>
                <Label htmlFor="pressureMagnitude">
                    {t('Canvas.pressureMagnitude')}
                </Label>
                <Input className="w-[2cm]" type='text' id='pressureMagnitude' onChange={(e) => setPressureMagnitude(e.target.value)} value={pressureMagnitude} />
            </Stack>

            <Button
                isIcon
                variant='text'
                fgColor="error"
                onClick={() => {
                    setColor(getDefaultColor())
                    setLineWidth('1.2')
                    setIsPressureSensitive(true)
                    setPressureMagnitude('9')
                }}
            >
                <RotateCcwIcon />
            </Button>
        </Stack>
    )
}
