import { ThemeOptions } from "@/src/Electron/Configuration/renderer.d"
import { ColorStatic } from "./ColorStatic"
import { IColor } from "./IColor"
import { useContext } from "react"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"

export function validateColor(color: (keyof ThemeOptions['colors']) | IColor | string): string {
    const t = useContext(ConfigurationContext)!.themeOptions

    if (typeof color !== 'string')
        return color.toHex()
    else if (!['natural', 'naturalVariant'].includes(color) && Object.keys(t.colors).includes(color))
        return ColorStatic.parse(t.colors[color][t.mode].main).toHex()
    else
        return ColorStatic.parse(color).toHex()
}
