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
import { SaveIcon } from "../Icons/SaveIcon";
import LoadingScreen from "../LoadingScreen";
import { isCanvasEmpty } from "../Canvas/helpers";

export type EditorProps = {
    title?: string;
    text?: string | undefined;
    canvasId?: string;
    setHasUnsavedChanges?: (state: boolean) => void
    onSave?: (text: string, canvasId?: string) => void | Promise<void>;
    onChange?: (text?: string, canvasId?: string) => void | Promise<void>;
}

export function Editor({ title, text: inputText, canvasId: inputCanvasId, onSave, onChange, setHasUnsavedChanges: setHasUnsavedChangesProperty }: EditorProps) {
    const theme = useContext(ConfigurationContext).get.theme
    const [loading, setLoading] = useState<boolean>(false)

    const [text, setText] = useState<string | undefined>(inputText)
    useEffect(() => {
        if (text !== inputText)
            setText(inputText);
    }, [inputText])

    const [canvasId, setCanvasId] = useState<string | undefined>(inputCanvasId)
    useEffect(() => {
        if (canvasId !== inputCanvasId)
            setCanvasId(inputCanvasId);
    }, [inputCanvasId])

    const imageRef = useRef<HTMLImageElement>()
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

            let id = undefined

            if (!isCanvasEmpty(canvas)) {
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
                        message: t('Editor.failedToUploadCanvas')
                    })

                    return
                }

                publish(RESULT_EVENT_NAME, {
                    severity: 'success',
                    message: t('Editor.successfullyUploadedCanvas')
                })

                setCanvasId(res.data)

                id = res.data
            }

            if (canvasId)
                console.log(await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteCanvas(canvasId))

            if (onSave)
                await onSave(text, id)

            setCanvasHasUnsavedChanges(false)
        }
        finally {
            setLoading(false)
            console.groupEnd()
        }
    }

    const getCanvas = async (id: string) => {
        try {
            console.group('Editor', 'getCanvas')

            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(id)
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

            setLoading(true)

            if (!canvasId) {
                console.log('no canvas id')
                setLoading(false)
                return
            }

            if (status === 'typing') {
                setLoading(false)
                return
            }

            const data = await getCanvas(canvasId)
            if (!data) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Editor.failedToUploadCanvas')
                })

                setLoading(false)
                return
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('Editor.successfullyUploadedCanvas')
            })

            switch (status) {
                case 'showing':
                    if (!imageRef.current) {
                        console.log('no image ref')
                        setLoading(false)
                        return
                    }

                    const src = `data:${data.type};base64,${data.data}`

                    if (imageSrc === src) {
                        setLoading(false)
                        return
                    }

                    setImageSrc(src);

                    if (data.backgroundColor)
                        setCanvasBackground(data.backgroundColor)

                    // if src is not different than previous imageSrc then this event wouldn't fire
                    imageRef.current.onload = () => setLoading(false)

                    break;

                case 'drawing':
                    if (!canvas.current) {
                        console.log('no canvas ref')
                        setLoading(false)
                        return
                    }

                    if (data.backgroundColor)
                        setCanvasBackground(data.backgroundColor)

                    const image = new Image()
                    image.onload = () => {
                        canvas.current.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0);
                        setLoading(false)
                    }
                    image.src = 'data:image/png;base64,' + data.data

                    break;

                default:
                    break;
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
    }, [status, canvas.current, inputCanvasId, inputText, canvasId])

    return (
        <>
            {
                loading
                &&
                <Backdrop sx={{ zIndex: theme.zIndex.drawer + 1 }} open={loading}>
                    <LoadingScreen />
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
                    <Stack direction='column' spacing={1} sx={{ pr: 1, overflow: 'auto', flexGrow: 2, width: '100%' }}>
                        {text &&
                            <>
                                <Typography variant='h5'>
                                    {t('Editor.description')}
                                </Typography>

                                <Divider />

                                <div dangerouslySetInnerHTML={{ __html: text }} />

                                <Divider />
                            </>
                        }

                        {canvasId &&
                            <img ref={imageRef} src={imageSrc} style={{ backgroundColor: canvasBackground }} />
                        }
                    </Stack>
                }

                {status === 'typing'
                    &&
                    <>
                        {onSave &&
                            <Stack direction='row' justifyContent='start' alignContent='center'>
                                <IconButton onClick={saveContent} color={contentHasUnsavedChanges ? 'warning' : 'default'}>
                                    {contentHasUnsavedChanges ? <SaveIcon color='warning' /> : <SaveIcon color='success' />}
                                </IconButton>
                            </Stack>
                        }
                        <TextEditor
                            text={inputText}
                            onChange={async (html) => {
                                setContentHasUnsavedChanges(true)
                                setText(html)
                                if (onChange)
                                    await onChange(html, canvasId)
                            }}
                        />
                    </>
                }

                {
                    status === 'drawing'
                    &&
                    <>
                        {onSave &&
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
                        }

                        <Box sx={{ flexGrow: 2, overflow: 'hidden' }}>
                            <Canvas
                                canvasRef={canvas}
                                canvasBackground={canvasBackground}
                                onChange={async (empty) => {
                                    setCanvasHasUnsavedChanges(true);
                                    if (onChange)
                                        await onChange(text, canvasId)
                                }}
                            />
                        </Box>
                    </>
                }
            </Stack >
        </>
    )
}
