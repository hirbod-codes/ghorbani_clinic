import { useEffect, useState } from 'react'
import { Color, ColorModes } from '../../Lib/Colors/index.d'
import { Canvas } from './Canvas'
import { AlphaSlider } from './Sliders/AlphaSlider'
import { HueSlider } from './Sliders/HueSlider'
import { toHsv } from '../../Lib/Colors'

// Refactor!!!
export function ColorPicker({ mode, controlledColor, onColorChange }: { mode: ColorModes, controlledColor?: Color, onColorChange?: (color: Color) => void | Promise<void> }) {
    const [color, setColor] = useState<Color>(controlledColor ?? { type: 'hsva', value: [0, 100, 100, 1] })
    const [hue, setHue] = useState<number>(0)

    const hasAlpha = (mode.endsWith('a') || (mode === 'hex' && color.value.length === 9))

    useEffect(() => {
        setColor({ ...toHsv(color), value: [hue, toHsv(color).value[1], toHsv(color).value[2], toHsv(color).value[3]] })
    }, [hue])

    useEffect(() => {
        if (onColorChange)
            onColorChange(color)
    }, [color])

    return (
        <>
            <div className="flex flex-col items-center space-y-2 w-full p-2  border rounded-lg">
                <div className="size-40 p-4 m-1 border rounded-lg">
                    <Canvas hue={hue} color={color} onColorChange={(c) => !hasAlpha ? setColor(c) : setColor({ type: 'hsva', value: [c[0], c[1], c[2], color.type.endsWith('a') ? color.value[3] as number : parseInt(color.value.slice(7) as string, 16)] })} />
                </div>

                <HueSlider
                    defaultProgress={100 * (hue / 360)}
                    onProgressChange={c => {
                        setHue((c * 360) / 100)
                    }}
                />

                {/* Alpha */}
                {hasAlpha &&
                    <AlphaSlider
                        defaultProgress={100 * (color.type.endsWith('a') ? color.value[3] as number : parseInt(color.value.slice(7) as string, 16))}
                        onProgressChange={c => {
                            if (color.type.endsWith('a'))
                                setColor({ ...color, value: [color.value[0] as number, color.value[1] as number, color.value[2] as number, c / 100] as any })
                            else
                                setColor({ ...color, value: (color.value.slice(0, 7) + ((c / 100) * 255).toString(16)) as any })
                        }}
                    />
                }
            </div>
        </>
    )
}

