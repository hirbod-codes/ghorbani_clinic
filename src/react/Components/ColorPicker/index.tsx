import { memo, useEffect, useRef, useState } from 'react'
import { ColorModes } from '../../Lib/Colors/index.d'
import { AlphaSlider } from './Sliders/AlphaSlider'
import { HueSlider } from './Sliders/HueSlider'
import { HSV } from '../../Lib/Colors/HSV'
import { ColorStatic } from '../../Lib/Colors/ColorStatic'
import { Canvas } from './Canvas'

export const ColorPicker = memo(function ColorPicker({ mode, hasAlpha = true, controlledColor, defaultColor, onColorChanged, onColorChanging }: { mode: ColorModes, hasAlpha?: boolean, controlledColor?: HSV, defaultColor?: HSV, onColorChanged?: (color: HSV) => void | Promise<void>, onColorChanging?: (color: HSV) => void | Promise<void> }) {
    const colorHolder = useRef<HTMLDivElement>(null)
    const [color, setColor] = useState<HSV>()

    useEffect(() => {
        if (defaultColor)
            setColor(ColorStatic.toHsv(defaultColor))
    }, [])

    useEffect(() => {
        if (controlledColor)
            setColor(controlledColor)

        if (colorHolder.current && controlledColor)
            colorHolder.current.style.backgroundColor = controlledColor.toHex()
    }, [controlledColor])

    console.log('ColorPicker', { mode, controlledColor, onColorChanged, color, hasAlpha })

    return (
        <div className="flex flex-col items-center space-y-2 w-72 h-96 p-2 border rounded-lg">
            <div className="w-full h-10" ref={colorHolder} />

            <div className="size-72 p-2 m-1">
                <Canvas
                    hue={color?.getHue() ?? 0}
                    defaultColor={defaultColor}
                    controlledColor={controlledColor}
                    onColorChanged={(c) => {
                        setColor(c)
                        if (onColorChanged)
                            onColorChanged(c)
                    }}
                    onColorChanging={(c) => {
                        if (onColorChanging)
                            onColorChanging(c)

                        if (colorHolder.current)
                            colorHolder.current.style.backgroundColor = c.toHex()
                    }}
                />
            </div>

            <HueSlider
                defaultProgress={100 * ((color?.getHue() ?? 0) / 360)}
                onProgressChanged={c => {
                    color?.setHue((c * 360) / 100)
                    if (colorHolder.current && color)
                        colorHolder.current.style.backgroundColor = color.toHex()
                    if (onColorChanged && color)
                        onColorChanged(color)
                }}
                onProgressChanging={c => {
                    color?.setHue((c * 360) / 100)
                    if (colorHolder.current && color)
                        colorHolder.current.style.backgroundColor = color.toHex()
                    if (onColorChanging && color)
                        onColorChanging(color)
                }}
            />

            {/* Alpha */}
            {hasAlpha &&
                <AlphaSlider
                    defaultProgress={100 * (color?.getAlpha() ?? 1)}
                    onProgressChanged={c => {
                        color?.setAlpha(c / 100)
                        if (colorHolder.current && color)
                            colorHolder.current.style.backgroundColor = color.toHex()
                        if (onColorChanged && color)
                            onColorChanged(color)
                    }}
                    onProgressChanging={c => {
                        color?.setAlpha(c / 100)
                        if (colorHolder.current && color)
                            colorHolder.current.style.backgroundColor = color.toHex()
                        if (onColorChanging && color)
                            onColorChanging(color)
                    }}
                />
            }
        </div>
    )
})

