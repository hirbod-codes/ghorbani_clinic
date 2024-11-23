import { Point } from "."

/**
 * 0    .p
 * |   /
 * |  /
 * |r/
 * |/
 * .centerPoint
 * @param centerPoint 
 * @param p 
 * @returns 
 */
export const getRadiansFromTwoPoints = (centerPoint: Point, p: Point): number => {
    const relativeRad = Math.abs(Math.asin((centerPoint.y - p.y) / twoPointDistance(p, centerPoint)))

    if (p.x >= centerPoint.x && p.y <= centerPoint.y)
        return Math.PI / 2 - relativeRad
    else if (p.x >= centerPoint.x && p.y >= centerPoint.y)
        return Math.PI / 2 + relativeRad
    else if (p.x <= centerPoint.x && p.y <= centerPoint.y)
        return 3 * Math.PI / 2 + relativeRad
    else if (p.x <= centerPoint.x && p.y >= centerPoint.y)
        return 3 * Math.PI / 2 - relativeRad
    else
        throw new Error('Invalid Points')
}

export const twoPointDistance = (p1: Point, p2: Point): number => Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))

/**
 * The distance of a point from a line that passes through p1 and p2
 */
export const pointFromLineDistance = (p1: Point, p2: Point, p: Point): number => {
    // triangle area = (1/2) |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)| = (1/2) p1.p2 * p
    return Math.abs(p.x * (p1.y - p2.y) + p1.x * (p2.y - p.y) + p2.x * (p.y - p1.y)) / twoPointDistance(p1, p2)
}

export const lineFunction = (p1: Point, p2: Point, x: number): number => {
    const m = (p2.y - p1.y) / (p2.x - p1.x)
    if (Math.abs(m) === Infinity)
        return p1.x === x ? Infinity : undefined
    if (m === 0)
        return p1.y

    const c = p2.y - p2.x * m
    console.log({ m, c, x })
    return m * x + c
}
