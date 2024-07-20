import { Divider, IconButton, Menu, Paper, Stack, TextField } from "@mui/material";
import { MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { configAPI } from "../../../Electron/Configuration/renderer/configAPI";
import { Draw } from "./types";
import { useDraw } from "./useCanvas";

import './styles.css'
import { ColorLensOutlined } from "@mui/icons-material";
import { t } from "i18next";
import { HexAlphaColorPicker } from "react-colorful";

export function Canvas({ outRef }: { outRef?: MutableRefObject<HTMLCanvasElement> }) {
    let theme = useContext(ConfigurationContext).get.theme

    const init = async () => {
        const c = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
        console.log(c)
        if (!c?.configuration?.canvas ?? false) {
            theme = { ...theme, palette: { ...(theme.palette), mode: 'light' } }
            await (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig({ ...c, configuration: { ...(c.configuration), canvas: { themeMode: 'light' } } })
        }
    }

    useEffect(() => {
        init()
    }, [])

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [color, setColor] = useState<string>(theme.palette.text.primary)

    const [lineWidth, setLineWidth] = useState<string>('1')
    const [radius, setRadius] = useState<string>('0.3')

    const { canvasRef, onMouseDown, clear } = useDraw(drawLine)
    if (outRef)
        outRef.current = canvasRef.current

    const parentRef = useRef<HTMLDivElement>()

    useEffect(() => {
        if (parentRef.current) {
            const rect = parentRef.current.getBoundingClientRect();
            canvasRef.current.width = rect.width
            canvasRef.current.height = rect.height
        }
    }, [])

    console.log('Canvas', { anchorEl, color, lineWidth, radius, parentRef, canvasRef, outRef })

    function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
        const { x: currX, y: currY } = currentPoint
        const lineColor = color

        let startPoint = prevPoint ?? currentPoint
        ctx.beginPath()
        ctx.lineWidth = Number(lineWidth)
        ctx.strokeStyle = lineColor
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currX, currY)
        ctx.stroke()

        ctx.fillStyle = lineColor
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, Number(radius), 0, 2 * Math.PI)
        ctx.fill()
    }

    return (
        <>
            <Stack direction='column' alignItems='start' sx={{ height: '100%' }} spacing={1} >
                <Stack direction='row' alignItems='center' spacing={1} divider={<Divider orientation='vertical' variant='middle' />} >
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <ColorLensOutlined />
                    </IconButton>
                    <TextField type='text' label={t('radius')} sx={{ width: '5rem' }} variant='standard' onChange={(e) => setRadius(e.target.value)} value={radius.toString()} />
                    <TextField type='text' label={t('lineWidth')} sx={{ width: '5rem' }} variant='standard' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth.toString()} />
                </Stack >

                <Divider variant='middle' />

                <Paper elevation={2} sx={{ flexGrow: 2, width: '100%', height: '100%', p: 0, m: 0 }} ref={parentRef}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={onMouseDown}
                        className='canvas'
                    />
                </Paper>
            </Stack >

            <Menu
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}

                sx={{ mt: '40px' }}
            >
                <Stack direction='column' alignItems='start' spacing={1} sx={{ m: 0, p: 2 }}>
                    <HexAlphaColorPicker color={color} onChange={setColor} />
                </Stack>
            </Menu>
        </>
    )
}

