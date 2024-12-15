import { memo, useContext, useEffect, useRef, useState } from 'react';
import { ConfigurationContext } from '../Contexts/ConfigurationContext';
import { Box, alpha, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Shapes } from './Canvas/Shapes/Shapes';
import { RadialGradient, RectangleGradient, UpdateGradient } from './Canvas/Shapes/RectangleGradient';

export const GradientBackground = memo(function GradientBackground() {
    const c = useContext(ConfigurationContext)
    const theme = useTheme()
    const location = useLocation();

    const [shapes, setShapes] = useState<Shapes>(new Shapes([]))
    const canvasRef = useRef<HTMLCanvasElement>()

    console.log('GradientBackground', { location, c })

    const backDropColor = alpha(theme.palette.mode === 'dark' ? '#000' : '#fff', 0)

    const generateRadialGradient = (): RadialGradient => {
        const getColor = () => Math.round(Math.random() * 100 + 50)

        const x = Math.random() * window.innerWidth
        const y = Math.random() * window.innerHeight
        return {
            mode: 'radial',
            steps: [
                { offset: 0, color: { r: getColor(), g: getColor(), b: getColor(), a: 1 } },
                { offset: 1, color: { r: 0, g: 0, b: 0, a: 0 } },
            ],
            x0: x,
            x1: x,
            y0: y,
            y1: y,
            r0: Math.random() * 50 + 10,
            r1: Math.random() * 200 + 700,
        }
    }

    const getValueByEaseInOut = (elapsed: number, duration: number, change: number): number => (change / 2) * ((1 - Math.cos(elapsed / (duration * 1000))))

    const updateRadialGradients = useRef<RadialGradient[]>()
    const tickCount = useRef<number>(0)

    const animateRadialGradient = (c: CanvasRenderingContext2D, elapsed: number, shape: RectangleGradient, targetRadialGradient: RadialGradient) => {
        tickCount.current = (tickCount.current ?? 0) + 1
        console.log('tick', { elapsed, startTS, tickCount: tickCount.current })

        const gradient = shape.getGradient() as RadialGradient
        let update: UpdateGradient = {}

        ///////////////////// R0
        const distanceR0 = Math.abs(gradient.r0 - targetRadialGradient.r0)
        const r0 = getValueByEaseInOut(elapsed, 1.5, distanceR0)
        let endR0 = false
        console.log('tick', { r0, elapsed, distanceR0 });
        if (distanceR0 !== 0 && gradient.r0 + r0 < targetRadialGradient.r0) {
            update.r0 = gradient.r0 + r0
        } else
            endR0 = true
        if (endR0)
            console.log('r0 destination reached')

        ///////////////////// R1
        const distanceR1 = Math.abs(gradient.r1 - targetRadialGradient.r1)
        const r1 = getValueByEaseInOut(elapsed, 1.5, distanceR1)
        let endR1 = false
        console.log('tick', { r1, elapsed, distanceR1 });
        if (distanceR1 !== 0 && gradient.r1 + r1 < targetRadialGradient.r1) {
            update.r1 = gradient.r1 + r1
        } else
            endR1 = true
        if (endR1)
            console.log('r1 destination reached')

        ///////////////////// X
        const distanceX = Math.abs(targetRadialGradient.x0 - gradient.x0)
        const x = getValueByEaseInOut(elapsed, 1.5, distanceX)
        let endX = false
        console.log('tick', { x, elapsed, distanceX });
        if (
            distanceX !== 0 &&
            ((gradient.x0 <= targetRadialGradient.x0 && gradient.x0 + x < targetRadialGradient.x0) ||
                (gradient.x0 >= targetRadialGradient.x0 && gradient.x0 - x > targetRadialGradient.x0))
        ) {
            update.x0 = gradient.x0 > targetRadialGradient.x0 ? gradient.x0 - x : gradient.x0 + x
            update.x1 = update.x0
        } else
            endX = true
        if (endX)
            console.log('x destination reached')

        ///////////////////// Y
        const distanceY = Math.abs(targetRadialGradient.y0 - gradient.y0)
        const y = getValueByEaseInOut(elapsed, 1.5, distanceY)
        let endY = false
        console.log('tick', { y, elapsed, distanceY });
        if (
            distanceY !== 0 &&
            ((gradient.y0 <= targetRadialGradient.y0 && gradient.y0 + y < targetRadialGradient.y0) ||
                (gradient.y0 >= targetRadialGradient.y0 && gradient.y0 - y > targetRadialGradient.y0))
        ) {
            update.y0 = gradient.y0 > targetRadialGradient.y0 ? gradient.y0 - y : gradient.y0 + y
            update.y1 = update.y0;
        } else
            endY = true
        if (endY)
            console.log('y destination reached')

        ///////////////////// Steps
        const r = getValueByEaseInOut(elapsed, 1.5, Math.abs(gradient.steps[0].color.r - targetRadialGradient.steps[0].color.r))
        const g = getValueByEaseInOut(elapsed, 1.5, Math.abs(gradient.steps[0].color.g - targetRadialGradient.steps[0].color.g))
        const b = getValueByEaseInOut(elapsed, 1.5, Math.abs(gradient.steps[0].color.b - targetRadialGradient.steps[0].color.b))
        update.steps = [
            {
                offset: 0,
                color: {
                    r: Math.round(gradient.steps[0].color.r < targetRadialGradient.steps[0].color.r ? gradient.steps[0].color.r + r : gradient.steps[0].color.r - r),
                    g: Math.round(gradient.steps[0].color.g < targetRadialGradient.steps[0].color.g ? gradient.steps[0].color.g + g : gradient.steps[0].color.g - g),
                    b: Math.round(gradient.steps[0].color.b < targetRadialGradient.steps[0].color.b ? gradient.steps[0].color.b + b : gradient.steps[0].color.b - b),
                    a: 1
                }
            },
            { offset: 1, color: { r: 0, b: 0, g: 0, a: 0 } },
        ];

        if (endY && endX && endR0 && endR1) {
            console.log('x and y and r0 and r1 destination reached')
            return false
        }

        shape.updateGradient(update)

        return true
    }

    const startTS = useRef<number>(undefined);
    const elapsed = useRef<number>(undefined);
    const ctxRef = useRef<CanvasRenderingContext2D>()
    const animate = (ts: number) => {
        if (startTS.current === undefined)
            startTS.current = ts;

        elapsed.current = ts - startTS.current;

        if (elapsed.current !== 0) {
            if (shapes.shapes.length !== 3) {
                console.log('No shape found')
                return false
            }

            for (let i = 0; i < shapes.shapes.length; i++)
                if (!(shapes.shapes[i] instanceof RectangleGradient))
                    return
                else if (animateRadialGradient(ctxRef.current, elapsed.current, shapes.shapes[i] as RectangleGradient, updateRadialGradients.current[i]) === false)
                    return

            shapes.draw({ ctx: ctxRef.current, canvasRef, currentPoint: { x: 0, y: 0 }, e: null })
        }

        window.requestAnimationFrame(animate);
    }

    const play = () => {
        updateRadialGradients.current = [generateRadialGradient(), generateRadialGradient(), generateRadialGradient()]
        window.requestAnimationFrame(animate)
    }

    useEffect(() => {
        if (canvasRef.current && !ctxRef.current)
            ctxRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true })

        updateRadialGradients.current = [generateRadialGradient(), generateRadialGradient(), generateRadialGradient()]

        if (ctxRef.current && shapes.shapes.length !== 3) {
            ctxRef.current.globalAlpha = 1

            shapes.shapes = []
            shapes.push(new RectangleGradient(0, 0, window.innerWidth, window.innerHeight, updateRadialGradients.current[0]))
            shapes.push(new RectangleGradient(0, 0, window.innerWidth, window.innerHeight, updateRadialGradients.current[1]))
            shapes.push(new RectangleGradient(0, 0, window.innerWidth, window.innerHeight, updateRadialGradients.current[2]))

            shapes.draw({ ctx: ctxRef.current, canvasRef, currentPoint: { x: 0, y: 0 }, e: null })
        }
    }, [canvasRef.current, ctxRef.current])

    useEffect(() => {
        play()
    }, [location])

    return (
        <>
            {c.showGradientBackground &&
                <>
                    <canvas
                        ref={canvasRef}
                        width={window.innerWidth}
                        height={window.innerHeight}
                        style={{ width: '100%', height: '100%', touchAction: 'none', userSelect: 'none' }}
                    />
                    <Box sx={{ backgroundColor: backDropColor, position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }} />
                </>
            }
        </>
    );
})
