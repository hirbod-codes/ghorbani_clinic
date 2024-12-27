import { Color, ColorModes, HEX, HSL, RGB } from "@/src/react/Lib/Colors/index.d"
import { useEffect, useState } from "react"
import { toHex, toHsl, toRgb } from "@/src/react/Lib/Colors"
import { Input } from "../../Base/Input"
import { AlphaSlider } from "./AlphaSlider"

export function Options({ mode, color, onColorChange }: { mode: ColorModes, color: Color, onColorChange?: (color: Color) => void | Promise<void> }) {
    if (mode.includes('rgb'))
        return <RgbOptions color={toRgb(color)} alpha={mode.includes('a')} />
    if (mode.includes('hsl'))
        return <HslOptions color={toHsl(color)} alpha={mode.includes('a')} />
    if (mode === 'hex')
        return <HexOptions color={toHex(color)} alpha={color.value.length === 9} />
}

export function HslOptions({ color, alpha = true, onColorChange }: { color: HSL, alpha?: boolean, onColorChange?: (color: Color) => void | Promise<void> }) {
    const [hslInput, setHslInput] = useState<string>('')
    const [hsl, setHsl] = useState<number[]>(alpha === false ? color.value.slice(0, 3) : (color.value.length === 4 ? color.value : color.value.concat([1])))

    useEffect(() => {
        if (onColorChange)
            onColorChange({ type: alpha ? 'hsla' : 'hsl', value: hsl })
    }, [hsl])

    return (
        <>
            {/* Alpha */}
            {alpha &&
                <AlphaSlider
                    defaultProgress={100 * hsl[3]}
                    onProgressChange={c => {
                        hsl[3] = c / 100

                        return setHsl([...hsl])
                    }}
                />
            }

            <Input placeholder="RGB" value={hslInput} onChange={e => {
                setHslInput(e.target.value)
                let v: number[]
                try { v = toHsl(e.target.value).value; }
                catch (e) { return }

                setHsl(alpha === false ? v.slice(0, 3) : (v.length === 4 ? v : v.concat([1])))
            }} />
        </>
    )
}

export function RgbOptions({ color, alpha = true, onColorChange }: { color: RGB, alpha?: boolean, onColorChange?: (color: Color) => void | Promise<void> }) {
    const [rgbInput, setRgbInput] = useState<string>('')
    const [rgb, setRgb] = useState<number[]>(alpha === false ? color.value.slice(0, 3) : (color.value.length === 4 ? color.value : color.value.concat([1])))

    useEffect(() => {
        if (onColorChange)
            onColorChange({ type: alpha ? 'rgba' : 'rgb', value: rgb })
    }, [rgb])

    return (
        <>
            {/* Alpha */}
            {alpha &&
                <AlphaSlider
                    defaultProgress={100 * rgb[3]}
                    onProgressChange={c => {
                        rgb[3] = c / 100

                        return setRgb([...rgb])
                    }}
                />
            }

            <RedSlider
                defaultProgress={100 * rgb[0]}
                onProgressChange={c => {
                    rgb[3] = c / 100

                    return setRgb([...rgb])
                }}
            />

            <GreenSlider
                defaultProgress={100 * rgb[1]}
                onProgressChange={c => {
                    rgb[3] = c / 100

                    return setRgb([...rgb])
                }}
            />

            <BlueSlider
                defaultProgress={100 * rgb[2]}
                onProgressChange={c => {
                    rgb[3] = c / 100

                    return setRgb([...rgb])
                }}
            />

            <Input placeholder="RGB" value={rgbInput} onChange={e => {
                setRgbInput(e.target.value)
                let v: number[]
                try { v = toRgb(e.target.value).value; }
                catch (e) { return }

                setRgb(alpha === false ? v.slice(0, 3) : (v.length === 4 ? v : v.concat([1])))
            }} />
        </>
    )
}

export function HexOptions({ color, alpha = true, onColorChange }: { color: HEX, alpha?: boolean, onColorChange?: (color: Color) => void | Promise<void> }) {
    const [hexInput, setHexInput] = useState<string>('')
    const [hex, setHex] = useState<string>(alpha === false ? color.value.slice(0, 7) : (color.value.length === 9 ? color.value : color.value + 'ff'))

    useEffect(() => {
        if (onColorChange)
            onColorChange({ type: 'hex', value: hex })
    }, [hex])

    return (
        <>
            {/* Alpha */}
            {alpha &&
                <AlphaSlider
                    defaultProgress={100 * (parseInt(hex.slice(7), 16) / 255)}
                    onProgressChange={c => {
                        let a = ((c / 100) * 255).toString(16)
                        if (a.length === 1)
                            a = '0' + a

                        return setHex(hex.length === 7 ? hex + a : hex.slice(0, 7) + a)
                    }}
                />
            }

            <HueSlider
                defaultProgress={100 * (parseInt(hex.slice(7), 16) / 255)}
                onProgressChange={c => {
                    let a = ((c / 100) * 255).toString(16)
                    if (a.length === 1)
                        a = '0' + a

                    return setHex(hex.length === 7 ? hex + a : hex.slice(0, 7) + a)
                }}
            />

            <Input placeholder="HEX" value={hexInput} onChange={e => {
                setHexInput(e.target.value)
                let h: string
                try { h = toHex(e.target.value).value; }
                catch (e) { return }

                setHex(alpha === false ? h.slice(0, 7) : (h.length === 9 ? h : h + 'ff'))
            }} />
        </>
    )
}
