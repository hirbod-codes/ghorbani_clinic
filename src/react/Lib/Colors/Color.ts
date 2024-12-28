import { ColorModes } from "./index.d"
import { HSL } from "./HSL"
import { HSV } from "./HSV"
import { IColor } from "./IColor"
import { RGB } from "./RGB"

export class Color {
    protected alpha: number | undefined

    constructor(alpha?: number) {
        if (alpha !== undefined && (alpha < 0 || alpha > 1))
            throw new Error('Invalid color values provided.')

        this.alpha = alpha
    }

    getAlpha() { return this.alpha }
    setAlpha(v: number) { this.alpha = v }

    static toColorMode(mode: 'hex', color: IColor): string
    static toColorMode(mode: Omit<ColorModes, 'hex'>, color: IColor): IColor
    static toColorMode(mode: ColorModes, color: IColor): IColor | string {
        switch (mode) {
            case 'hsl':
                return this.toHsl(color)
            case 'hsla':
                return this.toHsl(color)
            case 'rgb':
                return this.toRgb(color)
            case 'rgba':
                return this.toRgb(color)
            case 'hsv':
                return this.toHsv(color)
            case 'hsva':
                return this.toHsv(color)
            case 'hex':
                return color.toHex()
            default:
                throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);
        }
    }

    static toRgb(color: IColor): RGB {
        return RGB.fromHex(color.toHex()) as RGB
    }

    static toHsl(color: IColor): HSL {
        return HSL.fromHex(color.toHex()) as HSL
    }

    static toHsv(color: IColor): HSV {
        return HSV.fromHex(color.toHex()) as HSV
    }
}
