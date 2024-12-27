export type HSV = { type: 'hsv' | 'hsva', value: number[] }
export type HEX = { type: 'hex', value: string }
export type RGB = { type: 'rgb' | 'rgba', value: number[] }
export type HSL = { type: 'hsl' | 'hsla', value: number[] }
export type Color = HEX | RGB | HSL | HSV
export type ColorModes = Color['type']
