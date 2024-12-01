import { memo, MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionTemplate, useMotionValue, ValueAnimationTransition } from 'framer-motion';
import { gradientBackgroundTransitions, mainTransition } from '../Styles/animations';
import { ConfigurationContext } from '../Contexts/ConfigurationContext';
import { Box, Button, alpha, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';

import './G/index.css';
import { Shapes } from './Canvas/Shapes/Shapes';
import { Gradients, radialGradient, RectangleGradient, UpdateGradient } from './Canvas/Shapes/RectangleGradient';
import { Point } from '../Lib/Math';

export const GradientBackground = memo(function GradientBackground() {
    const c = useContext(ConfigurationContext)
    const theme = useTheme()
    const location = useLocation();

    const [shapes, setShapes] = useState<Shapes>(new Shapes([]))
    const canvasRef = useRef<HTMLCanvasElement>()

    console.log('GradientBackground', { location, c })

    const backDropColor = alpha(theme.palette.mode === 'dark' ? '#000' : '#fff', 0.3)

    const scale = (number: number, inMin: number, inMax: number, outMin: number, outMax: number) => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
    const toSafeInteger = (num: number) => Math.round(Math.max(Number.MIN_SAFE_INTEGER, Math.min(num, Number.MAX_SAFE_INTEGER)))

    const scales = useRef<{ r1: number; g1: number; b1: number; r2: number; g2: number; b2: number; r3: number; g3: number; b3: number; }>()
    const positions = useRef<{ position1X: number; position2X: number; position3X: number; position1Y: number; position2Y: number; position3Y: number; r11: number; r12: number; r21: number; r22: number; r31: number; r32: number; }>()

    const calculateValues = () => {
        console.log('GradientBackground calculate')

        scales.current = {
            r1: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            g1: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            b1: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            r2: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            g2: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            b2: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            r3: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            g3: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
            b3: scale(toSafeInteger(Math.random() * 225), 0, 225, 0, 225),
        }
        console.log(scales.current)

        // positions.current = {
        //     position1X: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
        //     position2X: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
        //     position3X: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
        //     position1Y: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
        //     position2Y: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
        //     position3Y: scale(toSafeInteger(Math.random() * 100), 0, 100, 20, 80),
        // }
        // console.log(positions.current)

        positions.current = {
            position1X: Math.random() * window.innerWidth,
            position2X: Math.random() * window.innerWidth,
            position3X: Math.random() * window.innerWidth,
            position1Y: Math.random() * window.innerHeight,
            position2Y: Math.random() * window.innerHeight,
            position3Y: Math.random() * window.innerHeight,
            r11: Math.random() * 150 + 50,
            r12: Math.random() * 300 + 500,
            r21: Math.random() * 150 + 50,
            r22: Math.random() * 300 + 500,
            r31: Math.random() * 150 + 50,
            r32: Math.random() * 300 + 500,
        }
        console.log(positions.current)
    }

    const getValueByEaseInOut = (elapsed: number, duration: number, v1: number, v2: number): number => (Math.abs(v2 - v1) / 2) * ((1 - Math.cos(elapsed / (duration * 1000))))

    const callCount = useRef<number>(0)

    const tick = (c: CanvasRenderingContext2D, elapsed: number, startPoint: Point, endPoint: Point, initialR0: number, targetR0: number, initialR1: number, targetR1: number) => {
        callCount.current = (callCount.current ?? 0) + 1
        console.log('tick', { elapsed, startTS, startPoint, endPoint, callCount: callCount.current })

        if (shapes.shapes.length <= 0 || !(shapes.shapes[shapes.shapes.length - 1] instanceof RectangleGradient)) {
            console.log('No shape found')
            return false
        }

        let update: UpdateGradient = {}

        ///////////////////// R0
        const distanceR0 = Math.abs(endPoint.x - startPoint.x)
        const r0 = getValueByEaseInOut(elapsed, 1.5, initialR0, targetR0)
        let endR0 = false
        console.log('tick', { r0, elapsed, distanceR0 });
        if (distanceR0 !== 0 && initialR0 + r0 < targetR0) {
            update.r0 = initialR0 + r0
        } else
            endR0 = true
        if (endR0)
            console.log('r0 destination reached')

        ///////////////////// R1
        const distanceR1 = Math.abs(endPoint.x - startPoint.x)
        const r1 = getValueByEaseInOut(elapsed, 1.5, initialR1, targetR1)
        let endR1 = false
        console.log('tick', { r1, elapsed, distanceR1 });
        if (distanceR1 !== 0 && initialR1 + r1 < targetR1) {
            update.r1 = initialR1 + r1
        } else
            endR1 = true
        if (endR1)
            console.log('r1 destination reached')

        ///////////////////// X
        const distanceX = Math.abs(endPoint.x - startPoint.x)
        const x = getValueByEaseInOut(elapsed, 1.5, startPoint.x, endPoint.x)
        let endX = false
        console.log('tick', { x, elapsed, distanceX });
        if (
            distanceX !== 0 &&
            ((startPoint.x <= endPoint.x && startPoint.x + x < endPoint.x) ||
                (startPoint.x >= endPoint.x && startPoint.x - x > endPoint.x))
        ) {
            update.x0 = startPoint.x > endPoint.x ? startPoint.x - x : startPoint.x + x
            update.x1 = update.x0
        } else
            endX = true
        if (endX)
            console.log('x destination reached')

        ///////////////////// Y
        const distanceY = Math.abs(endPoint.y - startPoint.y)
        const y = getValueByEaseInOut(elapsed, 1.5, startPoint.y, endPoint.y)
        let endY = false
        console.log('tick', { y, elapsed, distanceY });
        if (
            distanceY !== 0 &&
            ((startPoint.y <= endPoint.y && startPoint.y + y < endPoint.y) ||
                (startPoint.y >= endPoint.y && startPoint.y - y > endPoint.y))
        ) {
            update.y0 = startPoint.y > endPoint.y ? startPoint.y - y : startPoint.y + y
            update.y1 = update.y0;
        } else
            endY = true
        if (endY)
            console.log('y destination reached')

        if (endY && endX && endR0 && endR1) {
            console.log('x and y and r0 and r1 destination reached')
            return false
        }

        ///////////////////// Steps
        update.steps = [
            { offset: 0, color: `rgb(${scales.current.r1}, ${scales.current.b1}, ${scales.current.g1})` },
            { offset: 1, color: `#00000000` },
        ];

        if (endY && endX && endR0 && endR1) {
            console.log('x and y and r0 and r1 destination reached')
            return false
        }

        (shapes.shapes[shapes.shapes.length - 1] as RectangleGradient).updateGradient(update)

        shapes.draw({ ctx: c, canvasRef, currentPoint: { x: 0, y: 0 }, e: null })

        return true
    }

    const startTS = useRef<number>(undefined);
    const elapsed = useRef<number>(undefined);
    const animate = (ts: number) => {
        if (startTS.current === undefined)
            startTS.current = ts;

        elapsed.current = ts - startTS.current;
        // console.log({ elapsed: elapsed.current, ts })

        if (elapsed.current !== 0) {
            const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
            const gradient = (shapes.shapes[shapes.shapes.length - 1] as RectangleGradient).getGradient() as radialGradient
            const startPoint = {
                x: gradient.x0,
                y: gradient.y0
            }
            const endPoint = { x: positions.current.position1X, y: positions.current.position1Y }

            if (tick(ctx, elapsed.current, startPoint, endPoint, gradient.r0, positions.current.r11, gradient.r1, positions.current.r12) === false)
                return
        }

        window.requestAnimationFrame(animate);
    }

    const play = () => {
        calculateValues()
        window.requestAnimationFrame(animate)
    }

    useEffect(() => {
        // play()
    }, [location])

    useEffect(() => {
        calculateValues()

        const gradient: Gradients = {
            mode: 'radial',
            steps: [
                // { offset: 0, color: `rgb(${scales.current.r1}, ${scales.current.b1}, ${scales.current.g1})` },
                // { offset: 1, color: `rgb(${scales.current.r1}, ${scales.current.b1}, ${scales.current.g1})` }
                { offset: 0, color: `rgb(${scales.current.r1}, ${scales.current.b1}, ${scales.current.g1})` },
                { offset: 1, color: `#000000` },
            ],
            x0: positions.current.position1X,
            y0: positions.current.position1Y,
            r0: positions.current.r11,
            x1: positions.current.position1X,
            y1: positions.current.position1Y,
            r1: positions.current.r12
        };
        shapes.push(new RectangleGradient(0, 0, window.innerWidth, window.innerHeight, gradient))

        shapes.draw({ ctx: canvasRef.current.getContext('2d', { willReadFrequently: true }), canvasRef, currentPoint: { x: 0, y: 0 }, e: null })
    }, [canvasRef.current])

    return (
        <>
            <Button sx={{ position: 'absolute', zIndex: 100, top: '50%' }} onClick={() => {
                startTS.current = undefined
                elapsed.current = 0
                play()
            }}>Play</Button>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                style={{ width: '100%', height: '100%', touchAction: 'none', userSelect: 'none' }}
            />
            <Box sx={{ backgroundColor: backDropColor, position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }} />
            {/* {c.get.showGradientBackground &&
                <>
                    <div id='test' />
                    <Box sx={{ backgroundColor: backDropColor, position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }} />
                </>
            } */}
            {/* <AnimatePresence>
                {c.get.showGradientBackground &&
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }}
                    >
                        <motion.div
                            key={location.pathname}
                            transition={gradientBackgroundTransitions}
                            style={{
                                width: '100%',
                                height: '100%',
                                background
                            }} />
                        <Box sx={{ backgroundColor: backDropColor, position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }} />
                    </motion.div>
                }
            </AnimatePresence> */}
        </>
    );
})
