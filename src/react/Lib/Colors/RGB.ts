import { Color } from "./Color"
import { HSL } from "./HSL"
import { HSV } from "./HSV"
import { IColor } from "./IColor"

export class RGB extends Color implements IColor {
    private red: number
    private green: number
    private blue: number

    constructor(red: number, green: number, blue: number, alpha?: number) {
        super(alpha)

        if (![red, green, blue].every(v => v >= 0 && v <= 255))
            throw new Error('Invalid color values provided.')

        this.red = red
        this.green = green
        this.blue = blue
    }

    shadeColor(shade: number): void {
        const mid = Math.floor(100 / 2)

        if (shade >= mid)
            this.lighten((shade - mid) / mid)
        else
            this.darken(1 - (shade / mid))
    }

    getRed() { return this.red }
    getGreen() { return this.green }
    getBlue() { return this.blue }

    setRed(v: number) { this.red = v }
    setGreen(v: number) { this.green = v }
    setBlue(v: number) { this.blue = v }

    lighten(coefficient: number): void {
        [this.red, this.green, this.blue] = [this.red, this.green, this.blue].map(n => +(n + ((255 - n) * coefficient)).toFixed(2))
    }

    darken(coefficient: number): void {
        [this.red, this.green, this.blue] = [this.red, this.green, this.blue].map(n => +(n * (1 - Math.abs(coefficient))).toFixed(2))
    }

    toString(): string {
        return `${this.alpha !== undefined ? 'rgba' : 'rgb'}(${this.red.toFixed(2)}, ${this.green.toFixed(2)}, ${this.blue.toFixed(2)}${this.alpha !== undefined ? ', ' + this.alpha.toFixed(2) : ''})`
    }

    toRgb(): RGB {
        return this
    }

    toHsl(): HSL {
        const r = this.red / 255;
        const g = this.green / 255;
        const b = this.blue / 255;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const delta = max - min;
        let h;
        let s;

        if (max === min) {
            h = 0;
        } else if (r === max) {
            h = (g - b) / delta;
        } else if (g === max) {
            h = 2 + (b - r) / delta;
        } else if (b === max) {
            h = 4 + (r - g) / delta;
        }

        h = Math.min(h * 60, 360);

        if (h < 0) {
            h += 360;
        }

        const l = (min + max) / 2;

        if (max === min) {
            s = 0;
        } else if (l <= 0.5) {
            s = delta / (max + min);
        } else {
            s = delta / (2 - max - min);
        }

        return new HSL(h, s * 100, l * 100, this.getAlpha())



        // let r = this.red, g = this.green, b = this.blue
        // // Make r, g, and b fractions of 1
        // r /= 255;
        // g /= 255;
        // b /= 255;

        // // Find greatest and smallest channel values
        // let cmin = Math.min(r, g, b),
        //     cmax = Math.max(r, g, b),
        //     delta = cmax - cmin, h = 0, s = 0, l = 0

        // // Calculate hue
        // // No difference
        // if (delta === 0)
        //     h = 0
        // // Red is max
        // else if (cmax === r)
        //     h = ((g - b) / delta) % 6
        // // Green is max
        // else if (cmax === g)
        //     h = (b - r) / delta + 2
        // // Blue is max
        // else
        //     h = (r - g) / delta + 4

        // h = Math.round(h * 60)

        // // Make negative hues positive behind 360°
        // if (h < 0)
        //     h += 360

        // // Calculate lightness
        // l = (cmax + cmin) / 2

        // // Calculate saturation
        // s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

        // // Multiply l and s by 100
        // s = +(s * 100).toFixed(1)
        // l = +(l * 100).toFixed(1)

        // return new HSL(h, s, l, this.getAlpha())
    }

    toHsv(): HSV {
        let rdif;
        let gdif;
        let bdif;
        let h;
        let s;

        const r = this.red / 255;
        const g = this.green / 255;
        const b = this.blue / 255;
        const v = Math.max(r, g, b);
        const diff = v - Math.min(r, g, b);
        const diffc = function (c) {
            return (v - c) / 6 / diff + 1 / 2;
        };

        if (diff === 0) {
            h = 0;
            s = 0;
        } else {
            s = diff / v;
            rdif = diffc(r);
            gdif = diffc(g);
            bdif = diffc(b);

            if (r === v) {
                h = bdif - gdif;
            } else if (g === v) {
                h = (1 / 3) + rdif - bdif;
            } else if (b === v) {
                h = (2 / 3) + gdif - rdif;
            }

            if (h < 0) {
                h += 1;
            } else if (h > 1) {
                h -= 1;
            }
        }

        return new HSV(h * 360, s * 100, v * 100, this.getAlpha())


        // let r = this.red, g = this.green, b = this.blue

        // let max = Math.max(r, g, b)
        // let min = Math.min(r, g, b)
        // let d = max - min
        // let h
        // let s = (max === 0 ? 0 : d / max)
        // let v = max / 255

        // switch (max) {
        //     case min: h = 0
        //         break
        //     case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d
        //         break
        //     case g: h = (b - r) + d * 2; h /= 6 * d
        //         break
        //     case b: h = (r - g) + d * 4; h /= 6 * d
        //         break
        // }

        // return new HSV(h * 360, s * 100, v * 100)
    }

    toHex(): string {
        const toTwoDigit = (number: string) => number.length === 1 ? `0${number}` : number

        return [
            '#',
            toTwoDigit(Math.round(this.red).toString(16)),
            toTwoDigit(Math.round(this.green).toString(16)),
            toTwoDigit(Math.round(this.blue).toString(16)),
            this.alpha !== undefined ? toTwoDigit(Math.round(this.alpha * 255).toString(16)) : 'ff'
        ]
            .join('')
    }

    static fromHex(color: string): IColor {
        if (color.charAt(0) !== '#')
            throw new Error("Method not implemented.")

        color = color.replace(/^#/, '')
        if (color.length === 3)
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]

        let rgbaStrings = color.match(/.{2}/g);
        if (!rgbaStrings)
            throw new Error('Invalid color provided');

        const rgba = rgbaStrings.map(s => parseInt(s, 16))
        return new RGB(rgba[0], rgba[1], rgba[2], (rgba[3] ?? 255) / 255)
    }

    static parse(color: string): IColor {
        const marker = color.indexOf('(');
        const type = color.substring(0, marker);
        if (!type.startsWith('rgb'))
            throw new Error('Invalid input provided for parse method of RGB class');

        let rgba = color.substring(marker + 1, color.length - 1).split(',').map(value => parseFloat(value))

        return new RGB(rgba[0], rgba[1], rgba[2], rgba[3])
    }
}
