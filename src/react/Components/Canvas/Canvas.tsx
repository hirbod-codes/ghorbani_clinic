import { CssBaseline, Paper, ThemeProvider, colors, useTheme } from "@mui/material";
import { MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { configAPI } from "../../../Electron/Configuration/renderer/configAPI";
import { Draw } from "./types";
import { useDraw } from "./useCanvas";

import './styles.css'

export function Canvas() {
    let theme = useContext(ConfigurationContext).get.theme

    const init = async () => {
        const c = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
        if (!c?.configuration?.canvas ?? false) {
            theme = { ...theme, palette: { ...(theme.palette), mode: 'light' } }
            await (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig({ ...c, configuration: { ...(c.configuration), canvas: { themeMode: 'light' } } })
        }
    }

    useEffect(() => {
        init()
    }, [])

    const [color, setColor] = useState<string>(theme.palette.text.primary)
    const { canvasRef, onMouseDown, clear } = useDraw(drawLine)

    const parentRef = useRef<HTMLDivElement>()

    useEffect(() => {
        if (parentRef.current) {
            const rect = parentRef.current.getBoundingClientRect();
            canvasRef.current.width = rect.width
            canvasRef.current.height = rect.height
        }
    }, [])

    function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
        const { x: currX, y: currY } = currentPoint
        const lineColor = color
        const lineWidth = 1

        let startPoint = prevPoint ?? currentPoint
        ctx.beginPath()
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = lineColor
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currX, currY)
        ctx.stroke()

        ctx.fillStyle = lineColor
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI)
        ctx.fill()
    }

    return (
        <Paper sx={{ width: '100%', height: '100%', border: '1px solid green', p: 0, m: 0 }} ref={parentRef}>
            <canvas
                ref={canvasRef}
                onMouseDown={onMouseDown}
                className='canvas'
            />
        </Paper>
    )
}

