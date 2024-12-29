import { ColorModes } from "./index.d"
import { IColor } from "./IColor"
import { HSL } from "./HSL"
import { HSV } from "./HSV"
import { RGB } from "./RGB"

export class ColorStatic {
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

    static parse(color: string): IColor {
        if (typeof color !== 'string')
            throw new Error('Invalid argument provided to method ColorStatic.parse');

        if (color.charAt(0) === '#')
            return RGB.fromHex(color)

        const marker = color.indexOf('(');

        const type = color.substring(0, marker);
        if (['rgb', 'rgba', 'hsl', 'hsla', 'hsv', 'hsva'].indexOf(type) === -1)
            throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);

        if (type.includes('rgb'))
            return RGB.parse(color)

        if (type.includes('hsl'))
            return HSL.parse(color)

        if (type.includes('hsv'))
            return HSV.parse(color)

        throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);
    }
}
