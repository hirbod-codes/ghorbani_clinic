import { ComponentProps, memo, useEffect, useReducer, useRef, useState } from 'react'
import { AlphaSlider } from './Sliders/AlphaSlider'
import { HueSlider } from './Sliders/HueSlider'
import { HSV } from '../../Lib/Colors/HSV'
import { Canvas } from './Canvas'
import { cn } from '../../shadcn/lib/utils'

export type ColorPickerProps = {
    hasAlpha?: boolean
    controlledColor?: HSV
    onColorChanged?: (color: HSV) => void | Promise<void>
    onColorChanging?: (color: HSV) => void | Promise<void>
    containerProps?: ComponentProps<'div'>
    showValidZone?: boolean
}

export const ColorPicker = memo(function ColorPicker({ hasAlpha = true, controlledColor, onColorChanged, onColorChanging, containerProps, showValidZone = false }: ColorPickerProps) {
    const [, rerender] = useReducer(x => x + 1, 0)

    const colorHolder = useRef<HTMLDivElement>(null)
    const [color, setColor] = useState<HSV>(controlledColor ?? HSV.fromHex('#ff0000') as HSV)

    useEffect(() => {
        if (colorHolder.current && controlledColor)
            colorHolder.current.style.backgroundColor = controlledColor.toHex()

        if (controlledColor)
            setColor(controlledColor)
    }, [controlledColor])

    console.log('ColorPicker', { controlledColor, onColorChanged, color, hasAlpha })

    return (
        <div id='color-picker-container' {...containerProps} className={cn([`flex flex-col items-center space-y-2 w-72 h-96 z-50`], containerProps?.className)}>
            <div className="w-full h-10" ref={colorHolder} style={{ backgroundColor: color.toHex() }} />

            <div className={`w-72 h-72`}>
                <Canvas
                    controlledColor={color}
                    showValidZone={showValidZone}
                    onColorChanged={(c) => {
                        setColor(c)

                        if (colorHolder.current)
                            colorHolder.current.style.backgroundColor = c.toHex()

                        if (onColorChanged)
                            onColorChanged(c)
                    }}
                    onColorChanging={(c) => {
                        if (colorHolder.current)
                            colorHolder.current.style.backgroundColor = c.toHex()

                        if (onColorChanging)
                            onColorChanging(c)
                    }}
                />
            </div>

            <HueSlider
                defaultProgress={100 * ((color.getHue() ?? 0) / 360)}
                onProgressChanged={c => {
                    color.setHue((c * 360) / 100)

                    if (onColorChanged && color)
                        onColorChanged(color)
                    rerender()
                }}
                onProgressChanging={c => {
                    color.setHue((c * 360) / 100)

                    if (onColorChanging && color)
                        onColorChanging(color)
                    rerender()
                }}
            />

            {/* Alpha */}
            {hasAlpha &&
                <AlphaSlider
                    defaultProgress={100 * (color.getAlpha() ?? 1)}
                    onProgressChanged={c => {
                        color.setAlpha(c / 100)

                        if (onColorChanged && color)
                            onColorChanged(color)
                        rerender()
                    }}
                    onProgressChanging={c => {
                        color.setAlpha(c / 100)

                        if (onColorChanging && color)
                            onColorChanging(color)
                        rerender()
                    }}
                />
            }
        </div>
    )
})

