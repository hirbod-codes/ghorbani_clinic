import { Color } from "./Color"
import { ColorStatic } from "./ColorStatic"
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
        return `${this.alpha !== undefined ? 'hsla' : 'hsl'}(${this.hue}, ${this.saturation}%, ${this.lightness}%${this.alpha !== undefined ? ', ' + this.alpha : ''})`
    }

    toHex(): string {
        let h = this.hue, s = this.saturation, l = this.lightness

        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}${Math.round((this.getAlpha() ?? 1) * 255).toString(16)}`;
    }

    static fromHex(color: string): IColor {
        const rgb = RGB.fromHex(color) as RGB

        const rgba = [rgb.getRed(), rgb.getGreen(), rgb.getBlue(), rgb.getAlpha()]

        let r = (rgba[0] ?? 0) / 255;
        let g = (rgba[1] ?? 0) / 255;
        let b = (rgba[2] ?? 0) / 255;
        let a = (rgba[3] ?? 1);

        // Find greatest and smallest channel values
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        // Calculate hue
        // No difference
        if (delta === 0)
            h = 0;
        // Red is max
        else if (cmax === r)
            h = ((g - b) / delta) % 6;
        // Green is max
        else if (cmax === g)
            h = (b - r) / delta + 2;
        // Blue is max
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        // Make negative hues positive behind 360°
        if (h < 0)
            h += 360;

        // Calculate lightness
        l = (cmax + cmin) / 2;

        // Calculate saturation
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

        // Multiply l and s by 100
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        h = +h.toFixed(2)
        s = +s.toFixed(2)
        l = +l.toFixed(2)

        return new HSL(h, s, l, a)
    }

    static parse(color: string): IColor {
        if (typeof color !== 'string')
            throw new Error('Invalid input provided for parse method of HSL class');

        const marker = color.indexOf('(');
        const type = color.substring(0, marker);
        if (!type.startsWith('hsl'))
            throw new Error('Invalid input provided for parse method of HSL class');

        let hsla = color.substring(marker + 1, color.length - 1).split(',').map(value => parseFloat(value))

        return new HSL(hsla[0], hsla[1], hsla[2], hsla[3])
    }
}
