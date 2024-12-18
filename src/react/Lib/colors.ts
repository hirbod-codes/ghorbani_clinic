export function shadeColor(color: string, multiplier: number): string {
    if (multiplier === 0)
        return color

    if (multiplier < 0 || multiplier > 2)
        throw new Error('multiplier must be between -1 and 1 range.')

    color = hslToHex(color)

    color = color.replace(/^#/, '')
    if (color.length === 3)
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]

    let rgb = color.match(/.{2}/g);
    if (!rgb)
        throw new Error('Invalid color provided')

    let [r, g, b] = [parseInt(rgb[0], 16) * multiplier, parseInt(rgb[1], 16) * multiplier, parseInt(rgb[2], 16) * multiplier]

    rgb[0] = Math.max(Math.min(255, r), 0).toString(16)
    rgb[1] = Math.max(Math.min(255, g), 0).toString(16)
    rgb[2] = Math.max(Math.min(255, b), 0).toString(16)

    const rr = (rgb[0].length < 2 ? '0' : '') + r.toFixed(0)
    const gg = (rgb[1].length < 2 ? '0' : '') + g.toFixed(0)
    const bb = (rgb[2].length < 2 ? '0' : '') + b.toFixed(0)

    return `#${rr}${gg}${bb}`
}

export function hslToHex(h: string): string
export function hslToHex(h: { h: number, s: number, l: number, a?: number }): string
export function hslToHex(h: number, s: number, l: number, a?: number): string
export function hslToHex(h: string | number | { h: number, s: number, l: number, a?: number }, s?: number, l?: number, a?: number): string {
    if (typeof h === 'number' || typeof h === 'bigint') {
        if (!s || !l)
            throw new Error('Invalid arguments provided for hslToHex function')
    } else if (typeof h === 'string') {
        const pattern = /hsla?\((.+?)\)/;
        if (!h.match(pattern))
            throw new Error('Invalid color string provided for hslToHex function')

        const ref = h.match(pattern)![1].split(',').map((value) => parseFloat(value.trim()))

        s = ref[1]
        l = ref[2]
        a = ref[3]
        h = ref[0]
    } else {
        s = h.s
        l = h.l
        a = h?.a;
        h = h.h
    }

    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0)
        r = g = b = l; // achromatic
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
