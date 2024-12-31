import { Color } from "./Color"
import { ColorStatic } from "./ColorStatic"
import { HSV } from "./HSV"
import { IColor } from "./IColor"
import { RGB } from "./RGB"

export class HSL extends Color implements IColor {
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
        return `${this.alpha !== undefined ? 'hsla' : 'hsl'}(${this.hue.toFixed(2)}, ${this.saturation.toFixed(2)}%, ${this.lightness.toFixed(2)}%${this.alpha !== undefined ? ', ' + this.alpha.toFixed(2) : ''})`
    }

    toRgb(): RGB {
        const h = this.getHue() / 360;
        const s = this.getSaturation() / 100;
        const l = this.getLightness() / 100;
        let t2;
        let t3;
        let val;

        if (s === 0) {
            val = l * 255;
            return new RGB(val, val, val, this.getAlpha())
        }

        if (l < 0.5) {
            t2 = l * (1 + s);
        } else {
            t2 = l + s - l * s;
        }

        const t1 = 2 * l - t2;

        const rgb = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            t3 = h + 1 / 3 * -(i - 1);
            if (t3 < 0)
                t3++;

            if (t3 > 1)
                t3--;

            if (6 * t3 < 1)
                val = t1 + (t2 - t1) * 6 * t3;
            else if (2 * t3 < 1)
                val = t2;
            else if (3 * t3 < 2)
                val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
            else
                val = t1;

            rgb[i] = val * 255;
        }

        return new RGB(rgb[0], rgb[1], rgb[2], this.getAlpha())

        // let h = this.hue, s = this.saturation, l = this.lightness
        // h /= 360
        // s /= 100
        // l /= 100

        // let r, g, b
        // if (s === 0)
        //     r = g = b = l // achromatic
        // else {
        //     const hue2rgb = (p, q, t) => {
        //         if (t < 0) t += 1
        //         if (t > 1) t -= 1
        //         if (t < 1 / 6) return p + (q - p) * 6 * t
        //         if (t < 1 / 2) return q
        //         if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        //         return p
        //     }
        //     const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        //     const p = 2 * l - q
        //     r = hue2rgb(p, q, h + 1 / 3)
        //     g = hue2rgb(p, q, h)
        //     b = hue2rgb(p, q, h - 1 / 3)
        // }

        // return new RGB(r * 255, g * 255, b * 255, this.getAlpha())
    }

    toHsl(): HSL {
        return this
    }

    toHsv(): HSV {
        const h = this.getHue();
        let s = this.getSaturation() / 100;
        let l = this.getLightness() / 100;
        let smin = s;
        const lmin = Math.max(l, 0.01);

        l *= 2;
        s *= (l <= 1) ? l : 2 - l;
        smin *= lmin <= 1 ? lmin : 2 - lmin;
        const v = (l + s) / 2;
        const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

        return new HSV(h, sv * 100, v * 100, this.getAlpha())

        // let h = this.hue, s = this.saturation / 100, l = this.lightness / 100
        // let v = s * Math.min(l, 1 - l) + l
        // return new HSV(h, (v ? 2 - 2 * l / v : 0) * 100, v * 100, this.getAlpha())
    }

    toHex(): string {
        return this.toRgb().toHex()
    }

    static fromHex(color: string): IColor {
        const rgb = RGB.fromHex(color) as RGB
        return rgb.toHsl()
    }

    static parse(color: string): IColor {
        if (typeof color !== 'string')
            throw new Error('Invalid input provided for parse method of HSL class');

        const marker = color.indexOf('(');
        const type = color.substring(0, marker);
        if (!type.startsWith('hsl'))
            throw new Error('Invalid input provided for parse method of HSL class');

        let hsla = color.substring(marker + 1, color.length - 1).split(',').map(value => parseFloat(value.replace('%', '')))

        return new HSL(hsla[0], hsla[1], hsla[2], hsla[3])
    }
}
