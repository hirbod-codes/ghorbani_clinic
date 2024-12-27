import { useState } from 'react'
import { Color, ColorModes } from '../../Lib/Colors/index.d'
import { Canvas } from './Canvas'
import { Options } from './Sliders'
import { AlphaSlider } from './Sliders/AlphaSlider'
import { toRgb } from '../../Lib/Colors'
import { HueSlider } from './Sliders/HueSlider'

export function ColorPicker({ mode, controlledColor, onColorChange }: { mode: ColorModes, controlledColor?: Color, onColorChange?: (color: Color) => void | Promise<void> }) {
    const [color, setColor] = useState<Color>(controlledColor ?? { type: 'hex', value: '#ffffffff' })
    const [alpha, setAlpha] = useState<number>(0)
    const [hue, setHue] = useState<number>(0)

    return (
        <>
            <div className="flex flex-col items-center space-y-2 w-full p-2  border rounded-lg">
                <div className="size-40 p-4 m-1 border rounded-lg">
                    <Canvas hue={hue} color={color} onColorChange={setColor} />
                </div>

                <HueSlider
                    defaultProgress={100 * (hue / 360)}
                    onProgressChange={c => {
                        setHue((c * 360) / 100)
                    }}
                />

                {/* Alpha */}
                {(mode.endsWith('a') || (mode === 'hex' && color.value.length === 9)) &&
                    <AlphaSlider
                        defaultProgress={100 * alpha}
                        onProgressChange={c => {
                            setAlpha(c / 100)
                        }}
                    />
                }

                {/* <Options mode={mode} color={color} onColorChange={onColorChange} /> */}
            </div>
        </>
    )
}

