import { Color, RGB, HSL, HEX } from './index.d'

export function shadeColor(color: string | Color, multiplier: number): Color {
    color = decomposeColor(color)

    if (multiplier === 0)
        return color

    if (multiplier < 0 || multiplier > 2)
        throw new Error('multiplier must be between -1 and 1 range.')

    const rgbColor = toRgb(color)
    rgbColor.value[0] = Math.max(Math.min(255, parseInt(rgbColor.value[0].toString(), 16)), 0)
    rgbColor.value[1] = Math.max(Math.min(255, parseInt(rgbColor.value[1].toString(), 16)), 0)
    rgbColor.value[2] = Math.max(Math.min(255, parseInt(rgbColor.value[2].toString(), 16)), 0)

    if (color.type.includes('rgb'))
        return rgbColor
    if (color.type.includes('hsl'))
        return toHsl(rgbColor)

    return toHex(rgbColor)
}

export function toRgb(color: string | Color): RGB {
    color = decomposeColor(color)

    if (color.type === 'rgb' || color.type === 'rgba')
        return color

    if (color.type === 'hsl' || color.type === 'hsla') {
        color.value[0] /= 360
        color.value[1] /= 100
        color.value[2] /= 100
        let r, g, b;

        if (color.value[1] === 0)
            r = g = b = color.value[2]; // achromatic
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = color.value[2] < 0.5 ? color.value[2] * (1 + color.value[1]) : color.value[2] + color.value[1] - color.value[2] * color.value[1];
            const p = 2 * color.value[2] - q;
            r = hue2rgb(p, q, color.value[0] + 1 / 3);
            g = hue2rgb(p, q, color.value[0]);
            b = hue2rgb(p, q, color.value[0] - 1 / 3);
        }

        return {
            type: color.value.length === 4 ? 'rgba' : 'rgb',
            value: color.value
        }
    }

    if (color.type === 'hex') {
        color.value = color.value.replace(/^#/, '')
        if (color.value.length === 3)
            color.value = color.value[0] + color.value[0] + color.value[1] + color.value[1] + color.value[2] + color.value[2]

        let rgb = color.value.match(/.{2}/g);
        if (!rgb)
            throw new Error('Invalid color provided')

        return {
            type: rgb.length === 4 ? 'rgba' : 'rgb',
            value: rgb.length === 4 ? [parseInt(rgb[0], 16), parseInt(rgb[1], 16), parseInt(rgb[2], 16), parseInt(rgb[3], 16)] : [parseInt(rgb[0], 16), parseInt(rgb[1], 16), parseInt(rgb[2], 16)]
        }
    }

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla().`);
}

export function toHsl(color: string | Color): HSL {
    color = decomposeColor(color)

    if (color.type === 'hsl' || color.type === 'hsla')
        return color

    if (color.type === 'rgb' || color.type === 'rgba') {
        // Make r, g, and b fractions of 1
        let r = color.value[0] / 255;
        let g = color.value[1] / 255;
        let b = color.value[2] / 255;

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

        return {
            type: color.type === 'rgba' ? 'hsla' : 'hsl',
            value: color.type === 'rgba' ? [h, s, l, color.value[3]] : [h, s, l]
        }
    }

    if (color.type === 'hex')
        return toHsl(toRgb(color))

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla().`);
}

export function toHex(color: string | Color): HEX {
    color = decomposeColor(color)

    const toTwoDigit = (number: string) => number.length === 1 ? `0${number}` : number

    if (color.type === 'hex')
        return color

    if (color.type === 'rgb' || color.type === 'rgba')
        return {
            type: 'hex',
            value: `#${toTwoDigit(color.value[0].toString(16))}${toTwoDigit(color.value[1].toString(16))}${toTwoDigit(color.value[2].toString(16))}${color.value.length === 4 ? toTwoDigit(color.value[3].toString(16)) : ''}`
        }

    if (color.type === 'hsl' || color.type === 'hsla')
        return toHex(toRgb(color))

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla().`);
}

/**
 * Inspired by Material UI library
 * @param color 
 * @returns 
 */
export function decomposeColor(color: string | Color): Color {
    // Idempotent
    if (typeof color !== 'string')
        return color

    if (color.charAt(0) === '#')
        return { type: 'hex', value: color }

    const marker = color.indexOf('(');

    const type = color.substring(0, marker);
    if (['rgb', 'rgba', 'hsl', 'hsla'].indexOf(type) === -1)
        throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla().`);

    return {
        type: type as any,
        value: color.substring(marker + 1, color.length - 1).split(',').map(value => parseFloat(value)),
    };
}

export function setAlpha(color: string | Color, multiplier: number): Color {
    color = decomposeColor(color)

    if (color.type === 'hex' && color.value.length === 9)
        color.value = color.value.slice(0, 7) + (parseInt(color.value.slice(7), 16) * multiplier).toString(16)

    if ((color.type === 'rgb' || color.type === 'rgba') && color.value.length === 4)
        color.value[3] = color.value[3] * multiplier

    if ((color.type === 'hsl' || color.type === 'hsla') && color.value.length === 4)
        color.value[3] = color.value[3] * multiplier

    return color
}

export function stringify(color: string | Color): string {
    if (typeof color === 'string')
        return color

    if (color.type === 'hex')
        return color.value

    if (color.type === 'rgb' || color.type === 'rgba')
        return `${color.value.length === 4 ? 'rgba' : 'rgb'}(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, ${color.value.length === 4 ? color.value[3] : ''})`

    if (color.type === 'hsl' || color.type === 'hsla')
        return `${color.value.length === 4 ? 'hsla' : 'hsl'}(${color.value[0]}, ${color.value[1]}%, ${color.value[2]}%, ${color.value.length === 4 ? color.value[3] : ''})`

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla().`);
}
