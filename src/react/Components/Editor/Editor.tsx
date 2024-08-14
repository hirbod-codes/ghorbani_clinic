import { CloudDoneOutlined, CloudUploadOutlined, DarkModeOutlined, DrawOutlined, LightModeOutlined, RemoveRedEyeOutlined, SaveAltOutlined, TypeSpecimenOutlined } from "@mui/icons-material"
import { Backdrop, Box, CircularProgress, Divider, IconButton, Stack, Typography } from "@mui/material"
import { t } from "i18next";
import { useState, useRef, useEffect, useContext } from "react"
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { TextEditor } from "../TextEditor/TextEditor";
import { Canvas } from "../Canvas/Canvas";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";

export type EditorProps = {
    title?: string;
    text?: string | undefined;
    canvasId?: string;
    setHasUnsavedChanges?: (state: boolean) => void
    onSave?: (text: string, canvasId?: string) => void | Promise<void>;
    onChange?: () => void | Promise<void>;
}

export function Editor({ title, text: inputText, canvasId: inputCanvasId, onSave, onChange, setHasUnsavedChanges: setHasUnsavedChangesProperty }: EditorProps) {
    const theme = useContext(ConfigurationContext).get.theme
    const [loading, setLoading] = useState<boolean>(false)

    const [text, setText] = useState<string | undefined>(inputText)
    useEffect(() => {
        setText(inputText);
    }, [inputText])

    const [canvasId, setCanvasId] = useState<string | undefined>(inputCanvasId)
    useEffect(() => {
        setCanvasId(inputCanvasId);
    }, [inputCanvasId])

    const [imageSrc, setImageSrc] = useState<string>()
    const [status, setStatus] = useState<string>('showing')

    const [contentHasUnsavedChanges, setContentHasUnsavedChangesState] = useState<boolean>(false)
    const [canvasHasUnsavedChanges, setCanvasHasUnsavedChangesState] = useState<boolean>(false)

    const setCanvasHasUnsavedChanges = (state: boolean) => {
        setCanvasHasUnsavedChangesState(state)

        if (setHasUnsavedChangesProperty)
            if (state)
                setHasUnsavedChangesProperty(state)
            else
                setHasUnsavedChangesProperty(contentHasUnsavedChanges)
    }

    const setContentHasUnsavedChanges = (state: boolean) => {
        setContentHasUnsavedChangesState(state)

        if (setHasUnsavedChangesProperty)
            if (state)
                setHasUnsavedChangesProperty(state)
            else
                setHasUnsavedChangesProperty(canvasHasUnsavedChanges)
    }

    const [canvasBackground, setCanvasBackground] = useState<string>(theme.palette.common.white)
    const canvas = useRef<HTMLCanvasElement>()

    console.log('Editor', { title, loading, inputText, canvasId, text, status, canvas: canvas.current, imageSrc, contentHasUnsavedChanges, canvasHasUnsavedChanges, canvasBackground })

    const saveContent = async () => {
        try {
            if (!contentHasUnsavedChanges)
                return

            console.group('Editor', 'saveContent')

            setLoading(true)

            if (onSave)
                await onSave(text, canvasId)

            setContentHasUnsavedChanges(false)
        }
        finally {
            setLoading(false)
            console.groupEnd()
        }
    }

    const saveCanvas = async () => {
        try {
            if (!canvasHasUnsavedChanges)
                return

            console.group('Editor', 'saveCanvas')

            setLoading(true)

            const dataUrl = canvas.current?.toDataURL()
            const type = dataUrl.split(',')[0].replace(';base64', '').replace('data:', '')
            const data = dataUrl.split(',')[1]
            console.log({ dataUrl, type, data })

            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(
                {
                    width: canvas.current?.width,
                    height: canvas.current?.height,
                    colorSpace: 'srgb',
                    backgroundColor: canvasBackground,
                    type,
                    data,
                })
            console.log({ res })
            if (res.code !== 200 || !res.data) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToUploadCanvas')
                })

                return
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('successfullyUploadedCanvas')
            })

            setCanvasId(res.data)

            if (onSave)
                await onSave(text, res.data)

            setCanvasHasUnsavedChanges(false)
        }
        finally {
            setLoading(false)
            console.groupEnd()
        }
    }

    const getCanvas = async () => {
        try {
            console.group('Editor', 'getCanvas')

            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(canvasId)
            console.log({ res })

            if (res.code !== 200 || !res.data)
                return

            return res.data
        }
        finally { console.groupEnd() }
    }

    const init = async () => {
        try {
            console.group('Editor', 'init')

            console.log({ status, canvas: canvas.current })
            if (status === 'showing') {
                setLoading(true)

                if (!canvasId) {
                    console.log('no canvas id')
                    setLoading(false)
                    return
                }

                const data = await getCanvas()
                if (!data) {
                    publish(RESULT_EVENT_NAME, {
                        severity: 'error',
                        message: t('failedToUploadCanvas')
                    })

                    setLoading(false)
                    return
                }

                publish(RESULT_EVENT_NAME, {
                    severity: 'success',
                    message: t('successfullyUploadedCanvas')
                })

                setImageSrc(`data:${data.type};base64,${data.data}`);

                setCanvasBackground(data.backgroundColor ?? theme.palette.common.white)

                setLoading(false)
            }
            else if (status === 'drawing' && canvas.current) {
                setLoading(true)

                if (!canvasId) {
                    console.log('no canvas id')
                    setLoading(false)
                    return
                }

                if (!canvas.current) {
                    console.log('no canvas ref')
                    setLoading(false)
                    return
                }

                const data = await getCanvas()
                if (!data) {
                    publish(RESULT_EVENT_NAME, {
                        severity: 'error',
                        message: t('failedToUploadCanvas')
                    })

                    setLoading(false)
                    return
                }

                publish(RESULT_EVENT_NAME, {
                    severity: 'success',
                    message: t('successfullyUploadedCanvas')
                })

                setCanvasBackground(data.backgroundColor ?? theme.palette.common.white)

                const image = new Image()
                image.onload = () => canvas.current.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0)
                image.src = 'data:image/png;base64,' + data.data

                setLoading(false)
            }
        }
        finally { console.groupEnd() }
    }

    useEffect(() => {
        try {
            console.group('Editor', 'useEffect')

            init()
                .finally(() => console.groupEnd())
        }
        finally { console.groupEnd() }
    }, [status, canvas.current])

    return (
        <>
            {
                loading
                &&
                <Backdrop sx={{ zIndex: theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress />
                </Backdrop >
            }

            <Stack direction='column' spacing={1} sx={{ width: '100%', height: '100%' }}>
                <Stack direction='row' justifyContent='space-between' alignContent='center'>
                    <Typography variant='h5'>
                        {title}
                    </Typography>
                    <Stack direction='row' justifyContent='end' alignContent='center'>
                        <IconButton onClick={() => {
                            setStatus('showing')
                        }}>
                            <RemoveRedEyeOutlined />
                        </IconButton>
                        <IconButton onClick={() => setStatus('typing')}>
                            <TypeSpecimenOutlined />
                        </IconButton>
                        <IconButton onClick={() => setStatus('drawing')}>
                            <DrawOutlined />
                        </IconButton>
                    </Stack>
                </Stack>

                <Divider />

                {status === 'showing'
                    &&
                    <Stack direction='column' spacing={1} sx={{ width: '100%', height: '100%' }}>
                        {text &&
                            <>
                                <Typography variant='h5'>
                                    {t('description')}
                                </Typography>

                                <Divider />

                                <div dangerouslySetInnerHTML={{ __html: text }} />

                                <Divider />
                            </>
                        }

                        {imageSrc &&
                            <Box sx={{ flexGrow: 2 }}>
                                <img src={imageSrc} style={{ backgroundColor: canvasBackground }} />
                            </Box>
                        }
                    </Stack>
                }

                {status === 'typing'
                    &&
                    <>
                        <Stack direction='row' justifyContent='start' alignContent='center'>
                            <IconButton onClick={saveContent} color={contentHasUnsavedChanges ? 'warning' : 'default'}>
                                {contentHasUnsavedChanges ? <CloudUploadOutlined color='warning' /> : <CloudDoneOutlined color='success' />}
                            </IconButton>
                        </Stack>
                        <TextEditor
                            text={inputText}
                            onChange={async () => {
                                setContentHasUnsavedChanges(true)
                                if (onChange)
                                    await onChange()
                            }}
                            onSave={async (t) => {
                                setText(t)
                            }}
                        />
                    </>
                }

                {
                    status === 'drawing'
                    &&
                    <>
                        <Stack direction='row' justifyContent='start' alignContent='center'>
                            <IconButton onClick={saveCanvas} color={canvasHasUnsavedChanges ? 'warning' : 'default'}>
                                {canvasHasUnsavedChanges ? <CloudUploadOutlined color='warning' /> : <CloudDoneOutlined color='success' />}
                            </IconButton>
                            <IconButton
                                onClick={() => {
                                    setCanvasBackground(canvasBackground === theme.palette.common.black ? theme.palette.common.white : theme.palette.common.black)
                                    setCanvasHasUnsavedChanges(true)
                                }}
                            >
                                {canvasBackground === theme.palette.common.white ? <LightModeOutlined /> : <DarkModeOutlined />}
                            </IconButton>
                        </Stack>

                        <Box sx={{ flexGrow: 2, overflow: 'hidden' }}>
                            <Canvas
                                canvasRef={canvas}
                                canvasBackground={canvasBackground}
                                onChange={async () => {
                                    setCanvasHasUnsavedChanges(true);
                                    if (onChange)
                                        await onChange()
                                }}
                            />
                        </Box>
                    </>
                }
            </Stack >
        </>
    )
}
