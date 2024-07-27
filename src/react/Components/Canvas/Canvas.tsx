import { Divider, IconButton, Menu, PaletteMode, Paper, Stack, TextField } from "@mui/material";
import { MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { configAPI } from "../../../Electron/Configuration/renderer/configAPI";
import { Draw } from "./types";
import { useDraw } from "./useDraw";

import './styles.css'
import { ColorLensOutlined, DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { t } from "i18next";
import { HexAlphaColorPicker } from "react-colorful";

export type CanvasProps = {
    canvasRef?: MutableRefObject<HTMLCanvasElement>,
    onChange?: (empty?: boolean) => void | Promise<void>
}

export function Canvas({ canvasRef, onChange }: CanvasProps) {
    let theme = useContext(ConfigurationContext).get.theme

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [color, setColor] = useState<string>(theme.palette.text.primary)

    const [lineWidth, setLineWidth] = useState<string>('1.2')
    const [radius, setRadius] = useState<string>('0.3')

    const { onDown, clear, empty } = useDraw(drawLine, canvasRef, onChange)

    const parentRef = useRef<HTMLDivElement>()

    const [canvasBackground, setCanvasBackground] = useState(theme.palette.common.white)

    useEffect(() => {
        if (parentRef.current && canvasRef.current) {
            const rect = parentRef.current.getBoundingClientRect();
            canvasRef.current.width = rect.width
            canvasRef.current.height = rect.height
        }
    }, [parentRef.current, canvasRef.current])

    useEffect(() => {
        if (canvasRef.current)
            canvasRef.current.style.backgroundColor = canvasBackground
    }, [canvasBackground])

    console.log('Canvas', { anchorEl, color, lineWidth, radius, parentRef, canvasRef })

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

    const init = async (background?: string) => {
        if (background) {
            const c = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig();
            (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig({ ...c, configuration: { ...c.configuration, canvas: { backgroundColor: background } } })
            setCanvasBackground(background)
            return
        }

        background = (await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()).configuration?.canvas?.backgroundColor
        if (background)
            setCanvasBackground(background)
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <>
            {/* for 100% height, a scrollbar will be added, and idk why */}
            <Stack direction='column' alignItems='start' sx={{ height: '98%' }} spacing={1} >
                <Stack direction='row' alignItems='center' spacing={1} divider={<Divider orientation='vertical' variant='middle' />} >
                    <IconButton
                        size='medium'
                        color='inherit'
                        onClick={async () => {
                            await init(canvasBackground === theme.palette.common.black ? theme.palette.common.white : theme.palette.common.black)
                        }}
                    >
                        {canvasBackground === theme.palette.common.white ? <LightModeOutlined fontSize='inherit' /> : <DarkModeOutlined fontSize='inherit' />}
                    </IconButton>
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
                        onMouseDown={onDown}
                        onTouchStart={onDown}
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

