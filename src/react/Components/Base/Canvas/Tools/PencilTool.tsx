import { useContext, useEffect, useState } from "react";
import { Draw } from "../types";
import { t } from "i18next";
import { HexAlphaColorPicker } from "react-colorful";
import { PenConnectIcon } from "../../../Icons/PenConnectIcon";
import { Line } from "../Shapes/Line";
import { Shapes } from "../Shapes/Shapes";
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext";
import { Button } from "@/src/react/shadcn/components/ui/button";
import { PaletteIcon, PenLineIcon, RotateCcwIcon } from "lucide-react";
import { Input } from "@/src/react/shadcn/components/ui/input";
import { Label } from "@/src/react/shadcn/components/ui/label";
import { DropdownMenu } from "../../DropdownMenu";

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const themeOptions = useContext(ConfigurationContext)!.themeOptions

    const [color, setColor] = useState<string>(canvasBackground === themeOptions.colors.white ? themeOptions.colors.black : themeOptions.colors.white)
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
        <>
            <div className='flex flex-row items-center w-min min-w-full space-y-2'>
                <DropdownMenu
                    trigger={<PaletteIcon stroke={themeOptions.colors.foreground} style={{ backgroundColor: color }} />}
                    contents={[
                        {
                            type: 'label',
                            content: t('PencilTool.selectColor')
                        },
                        { type: 'separator', },
                        {
                            type: 'item',
                            options: {},
                            content: <HexAlphaColorPicker color={color} onChange={(c) => setColor(c)} />
                        }
                    ]}
                />

                <Button style={{ backgroundColor: color }} isIcon onClick={() => setIsPressureSensitive(!isPressureSensitive)}>
                    <PenConnectIcon color={themeOptions.colors.foreground} />
                </Button>

                <div className="flex items-center space-x-2">
                    <Label htmlFor="lineWidth">
                        {t('Canvas .lineWidth')}
                    </Label>
                    <Input type='text' id='lineWidth' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth} />
                </div>

                <div className="flex items-center space-x-2">
                    <Label htmlFor="pressureMagnitude">
                        {t('Canvas .pressureMagnitude')}
                    </Label>
                    <Input type='text' id='pressureMagnitude' onChange={(e) => setPressureMagnitude(e.target.value)} value={pressureMagnitude} />
                </div>

                <Button
                    style={{ backgroundColor: color }}
                    isIcon
                    onClick={() => {
                        setColor(canvasBackground === themeOptions.colors.white ? themeOptions.colors.black : themeOptions.colors.white)
                        setLineWidth('1.2')
                        setIsPressureSensitive(true)
                        setPressureMagnitude('9')
                    }}
                >
                    <RotateCcwIcon stroke={themeOptions.colors.foreground} />
                </Button>
            </div>
        </>
    )
}
