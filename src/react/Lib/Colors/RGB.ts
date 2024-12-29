import { Color } from "./Color"
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
        return `${this.alpha !== undefined ? 'rgba' : 'rgb'}(${this.red}, ${this.green}, ${this.blue}${this.alpha !== undefined ? ', ' + this.alpha : ''})`
    }

    toHex(): string {
        const toTwoDigit = (number: string) => number.length === 1 ? `0${number}` : number

        return `#${toTwoDigit(Math.round(this.red).toString(16))}${toTwoDigit(Math.round(this.green).toString(16))}${toTwoDigit(Math.round(this.blue).toString(16))}${this.alpha !== undefined ? toTwoDigit(Math.round(this.alpha).toString(16)) : ''}`
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
        return new RGB(rgba[0], rgba[1], rgba[2], rgba[3] / 255)
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
