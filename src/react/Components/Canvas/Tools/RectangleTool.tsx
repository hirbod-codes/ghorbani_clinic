import { useEffect, useState } from "react"
import { Shapes } from "../Shapes/Shapes"
import { Draw, Point } from "../types"
import { Rectangle } from "../Shapes/Rectangle"
import { Button, IconButton, Menu, Stack, TextField, useTheme } from "@mui/material"
import { HexAlphaColorPicker } from "react-colorful"
import { ColorLensOutlined, RestartAltOutlined } from "@mui/icons-material"
import { t } from "i18next"

export type RectangleToolProps = {
    shapes: Shapes,
    canvasBackground: string,
    setOnDraw: (onDraw: (draw: Draw) => void) => void,
    setOnHoverHook: (onHoverHook: (draw: Draw) => void) => void,
    setOnUpHook: (setOnUpHook: (draw: Draw) => void) => void,
    setOnDownHook: (setOnDownHook: (draw: Draw) => void) => void,
}

export function RectangleTool({ shapes, canvasBackground, setOnDraw, setOnUpHook, setOnDownHook }: RectangleToolProps) {
    const theme = useTheme()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [anchorType, setAnchorType] = useState<'stroke' | 'fill'>('fill')
    const [color, setColor] = useState<string>('#ffffff')

    const [stroke, setStroke] = useState<string | CanvasGradient | CanvasPattern>('#000000')
    const [fill, setFill] = useState<string | CanvasGradient | CanvasPattern>('#00000000')

    const [lineWidth, setLineWidth] = useState<string>('1.2')

    const [instance, setInstance] = useState<Rectangle | undefined>(undefined)
    const [hasMoved, setHasMoved] = useState<boolean>(false)
    const [referencePoint, setReferencePoint] = useState<Point | undefined>(undefined)

    const onDown = (draw: Draw) => {
        setReferencePoint(draw.currentPoint)

        shapes.helper = new Rectangle(draw.currentPoint.x, draw.currentPoint.y, 0, 0, Number(lineWidth), 'cyan', '#00000000')
    }

    const onUp = (draw: Draw) => {
        if (!referencePoint)
            return

        const helper = shapes.helper as Rectangle
        if (helper && hasMoved)
            shapes.push(new Rectangle(helper.x, helper.y, helper.w, helper.h, Number(lineWidth), stroke, fill))

        shapes.helper = undefined
        setReferencePoint(undefined)
        setInstance(undefined)
        setHasMoved(false)

        shapes.draw(draw)
    }

    const onDraw = (draw: Draw) => {
        if (!draw)
            return

        if (!hasMoved)
            setHasMoved(true);

        if (!referencePoint) {
            return
        }

        if (draw.currentPoint.x >= referencePoint.x)
            (shapes.helper as Rectangle).w = draw.currentPoint.x - referencePoint.x
        else {
            const diff = Math.abs(draw.currentPoint.x - referencePoint.x);
            (shapes.helper as Rectangle).x = referencePoint.x - diff;
            (shapes.helper as Rectangle).w = diff;
        }

        if (draw.currentPoint.y >= referencePoint.y)
            (shapes.helper as Rectangle).h = draw.currentPoint.y - referencePoint.y
        else {
            const diff = Math.abs(draw.currentPoint.y - referencePoint.y);
            (shapes.helper as Rectangle).y = referencePoint.y - diff;
            (shapes.helper as Rectangle).h = diff
        }

        shapes.draw(draw)
    }

    useEffect(() => {
        setOnDraw(() => onDraw)
        setOnUpHook(() => onUp)
        setOnDownHook(() => onDown)
    }, [fill, stroke, instance, hasMoved])

    return (
        <>
            <Stack spacing={3} direction='row' alignItems='center' sx={{ width: 'fit-content', minWidth: '100%' }}>
                <div>
                    <Button
                        variant='outlined'
                        sx={{ borderColor: fill as string }}
                        startIcon={<ColorLensOutlined sx={{ color: fill as string }} />}
                        onClick={(e) => {
                            setColor(fill as string)
                            setAnchorType('fill')
                            setAnchorEl(e.currentTarget)
                        }}
                    >
                        {t('RectangleTool.FillColor')}
                    </Button>
                </div>

                <div>
                    <Button
                        variant='outlined'
                        sx={{ borderColor: stroke as string }}
                        startIcon={<ColorLensOutlined sx={{ color: stroke as string }} />}
                        onClick={(e) => {
                            setColor(stroke as string)
                            setAnchorType('stroke')
                            setAnchorEl(e.currentTarget)
                        }}
                    >
                        {t('RectangleTool.StrokeColor')}
                    </Button>
                </div>

                <div>
                    <TextField type='text' label={t('Canvas.lineWidth')} variant='standard' size='small' onChange={(e) => setLineWidth(e.target.value)} value={lineWidth} />
                </div>

                <div>
                    <IconButton
                        onClick={() => {
                            setStroke('#ff0000')
                            setFill('#00ff00')
                            setAnchorType('fill')
                            setLineWidth('1.2')
                        }}
                    >
                        <RestartAltOutlined fontSize="medium" color='error' />
                    </IconButton>
                </div>
            </Stack>

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
                    <HexAlphaColorPicker color={color} onChange={(c) => {
                        switch (anchorType) {
                            case 'fill':
                                setFill(c)
                                break;

                            case 'stroke':
                                setStroke(c)
                                break;

                            default:
                                break;
                        }

                        setColor(c)
                    }} />
                </Stack>
            </Menu>
        </>
    )
}
