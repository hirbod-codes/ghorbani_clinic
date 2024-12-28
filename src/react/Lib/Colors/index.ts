import { Color, RGB, HSL, HEX, HSV, ColorModes } from './index.d'

export function shadeColor(color: string | Color, coefficient: number): Color {
    color = decomposeColor(color)

    if (coefficient === 0)
        return color

    if (coefficient < -1 || coefficient > 1)
        throw new Error('multiplier must be between -1 and 1 range.')

    if (coefficient > 0) {
        if (color.type === 'hex')
            return toHex(shadeColor(toRgb(color), coefficient))
        else if (color.type.indexOf('hsl') !== -1)
            color.value[2] = +(color.value[2] + ((100 - color.value[2]) * coefficient)).toFixed(2)
        else if (color.type.indexOf('rgb') !== -1)
            for (let i = 0; i < 3; i += 1)
                color.value[i] = +(color.value[i] + ((255 - color.value[i]) * coefficient)).toFixed(2)
    } else
        if (color.type === 'hex')
            return toHex(shadeColor(toRgb(color), coefficient))
        else if (color.type.indexOf('hsl') !== -1)
            color.value[2] = +(color.value[2] * (1 - Math.abs(coefficient))).toFixed(2)
        else if (color.type.indexOf('rgb') !== -1)
            for (let i = 0; i < 3; i += 1)
                color.value[i] = +(color.value[i] * (1 - Math.abs(coefficient))).toFixed(2)

    return color
}

export function toRgb(color: string | Color): RGB {
    color = decomposeColor(color)

    if (color.type === 'rgb' || color.type === 'rgba')
        return color

    if (color.type === 'hsl' || color.type === 'hsla') {
        const h = color.value[0];
        const s = color.value[1] / 100;
        const l = color.value[2] / 100;
        const a = s * Math.min(l, 1 - l);
        const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        const rgb = [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
        if (color.type === 'hsla')
            rgb.push(color.value[3])

        return {
            type: rgb.length === 4 ? 'rgba' : 'rgb',
            value: rgb
        }
    }

    if (color.type === 'hsv' || color.type === 'hsva') {
        let r, g, b, i, f, p, q, t;
        i = Math.floor(color.value[0] * 6);
        f = color.value[0] * 6 - i;
        p = color.value[2] * (1 - color.value[1]);
        q = color.value[2] * (1 - f * color.value[1]);
        t = color.value[2] * (1 - (1 - f) * color.value[1]);
        switch (i % 6) {
            case 0: r = color.value[2], g = t, b = p; break;
            case 1: r = q, g = color.value[2], b = p; break;
            case 2: r = p, g = color.value[2], b = t; break;
            case 3: r = p, g = q, b = color.value[2]; break;
            case 4: r = t, g = p, b = color.value[2]; break;
            case 5: r = color.value[2], g = p, b = q; break;
        }

        const rgb = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
        if (color.type === 'hsva')
            rgb.push(color.value[3])

        return {
            type: rgb.length === 4 ? 'rgba' : 'rgb',
            value: rgb
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

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);
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

        h = +h.toFixed(2)
        s = +s.toFixed(2)
        l = +l.toFixed(2)

        return {
            type: color.type === 'rgba' ? 'hsla' : 'hsl',
            value: color.type === 'rgba' ? [h, s, l, color.value[3]] : [h, s, l]
        }
    }

    if (color.type === 'hsv' || color.type === 'hsva')
        return toHsl(toRgb(color))

    if (color.type === 'hex')
        return toHsl(toRgb(color))

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);
}

export function toHex(color: string | Color): HEX {
    color = decomposeColor(color)

    const toTwoDigit = (number: string) => number.length === 1 ? `0${number}` : number

    if (color.type === 'hex')
        return color

    if (color.type === 'rgb' || color.type === 'rgba')
        return {
            type: 'hex',
            value: `#${toTwoDigit(Math.round(color.value[0]).toString(16))}${toTwoDigit(Math.round(color.value[1]).toString(16))}${toTwoDigit(Math.round(color.value[2]).toString(16))}${color.value.length === 4 ? toTwoDigit(Math.round(color.value[3]).toString(16)) : ''}`
        }

    if (color.type === 'hsl' || color.type === 'hsla')
        return toHex(toRgb(color))

    if (color.type === 'hsv' || color.type === 'hsva')
        return toHex(toRgb(color))

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);
}

export function toHsv(color: string | Color): HSV {
    color = decomposeColor(color)

    if (color.type === 'hsv' || color.type === 'hsva')
        return color

    if (color.type === 'rgb' || color.type === 'rgba') {
        color.value[0] /= 255, color.value[1] /= 255, color.value[2] /= 255;

        let max = Math.max(color.value[0], color.value[1], color.value[2]), min = Math.min(color.value[0], color.value[1], color.value[2]);
        let h, s, v = max;

        let d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case color.value[0]: h = (color.value[1] - color.value[2]) / d + (color.value[1] < color.value[2] ? 6 : 0); break;
                case color.value[1]: h = (color.value[2] - color.value[0]) / d + 2; break;
                case color.value[2]: h = (color.value[0] - color.value[1]) / d + 4; break;
            }

            h /= 6;
        }

        return {
            type: color.type === 'rgba' ? 'hsva' : 'hsv',
            value: color.type === 'rgba' ? [h, s, v, color.value[3]] : [h, s, v]
        }
    }

    if (color.type === 'hsl' || color.type === 'hsla')
        return toHsv(toRgb(color))

    if (color.type === 'hex')
        return toHsv(toRgb(color))

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);
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
    if (['rgb', 'rgba', 'hsl', 'hsla', 'hsv', 'hsva'].indexOf(type) === -1)
        throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);

    return {
        type: type as any,
        value: color.substring(marker + 1, color.length - 1).split(',').map(value => parseFloat(value)),
    };
}

export function setAlpha(color: string | Color, alpha: number): Color {
    color = decomposeColor(color)

    if (alpha < 0 || alpha > 1)
        throw new Error('multiplier must be between 0 and 1 range.')

    if (color.type === 'hex' && color.value.length === 9)
        color.value = color.value.slice(0, 7) + Math.round(alpha * 255).toString(16)

    if ((color.type === 'rgb' || color.type === 'rgba'))
        color.value[3] = alpha

    if ((color.type === 'hsl' || color.type === 'hsla'))
        color.value[3] = alpha

    if ((color.type === 'hsv' || color.type === 'hsva'))
        color.value[3] = alpha

    if (color.type === 'rgb' || color.type === 'hsl' || color.type === 'hsv')
        color.type += 'a'

    return color
}

export function stringify(color: string | Color): string {
    if (typeof color === 'string')
        return color

    if (color.type === 'hex')
        return color.value

    if (color.type === 'rgb' || color.type === 'rgba')
        return `${color.value.length === 4 ? 'rgba' : 'rgb'}(${color.value[0]}, ${color.value[1]}, ${color.value[2]}${color.value.length === 4 ? ', ' + color.value[3] : ''})`

    if (color.type === 'hsl' || color.type === 'hsla')
        return `${color.value.length === 4 ? 'hsla' : 'hsl'}(${color.value[0]}, ${color.value[1]}%, ${color.value[2]}%${color.value.length === 4 ? ', ' + color.value[3] : ''})`

    if (color.type === 'hsv' || color.type === 'hsva')
        return `${color.value.length === 4 ? 'hsva' : 'hsv'}(${color.value[0]}, ${color.value[1]}%, ${color.value[2]}%${color.value.length === 4 ? ', ' + color.value[3] : ''})`

    throw new Error(`Unsupported color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), hsv(), hsva().`);
}
