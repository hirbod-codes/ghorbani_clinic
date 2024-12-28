import { Color } from "./Color"
import { IColor } from "./IColor"
import { RGB } from "./RGB"

export class HSV extends Color implements IColor {
    private hue: number
    private saturation: number
    private lightness: number

    constructor(hue: number, saturation: number, lightness: number, alpha?: number) {
        super(alpha)

        if (![saturation, lightness].every(v => v >= 0 && v <= 100) || hue < 0 || hue > 360)
            throw new Error('Invalid color values provided.')

        this.hue = hue
        this.saturation = saturation
        this.lightness = lightness
    }

    getHue() { return this.hue }
    getSaturation() { return this.saturation }
    getLightness() { return this.lightness }

    setHue(v: number) { this.hue = v }
    setSaturation(v: number) { this.saturation = v }
    setLightness(v: number) { this.lightness = v }

    lighten(coefficient: number): void {
        this.saturation = +(this.saturation + ((100 - this.saturation) * coefficient)).toFixed(2)
    }

    darken(coefficient: number): void {
        this.saturation = +(this.saturation * (1 - Math.abs(coefficient))).toFixed(2)
    }

    toString(): string {
        return `${this.alpha !== undefined ? 'hsla' : 'hsl'}(${this.hue}, ${this.saturation}, ${this.lightness}${this.alpha !== undefined ? ', ' + this.alpha : ''})`
    }

    toHex(): string {
        return Color.toRgb(this).toHex();
    }

    static fromHex(color: string): IColor {
        const rgb = RGB.fromHex(color) as RGB
        const rgba = [rgb.getRed(), rgb.getGreen(), rgb.getBlue()]
        const a = rgb.getAlpha()

        rgba[0] /= 255, rgba[1] /= 255, rgba[2] /= 255;

        let max = Math.max(rgba[0], rgba[1], rgba[2]), min = Math.min(rgba[0], rgba[1], rgba[2]);
        let h, s, v = max;

        let d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case rgba[0]: h = (rgba[1] - rgba[2]) / d + (rgba[1] < rgba[2] ? 6 : 0); break;
                case rgba[1]: h = (rgba[2] - rgba[0]) / d + 2; break;
                case rgba[2]: h = (rgba[0] - rgba[1]) / d + 4; break;
            }

            h /= 6;
        }

        return new HSV(h, s, v, a)
    }

    static parse(color: string): IColor {
        const marker = color.indexOf('(');
        const type = color.substring(0, marker);
        if (!type.startsWith('hsv'))
            throw new Error('Invalid input provided for parse method of HSV class');

        let hsla = color.substring(marker + 1, color.length - 1).split(',').map(value => parseFloat(value))

        return new HSV(hsla[0], hsla[1], hsla[2], hsla[3])
    }
}
