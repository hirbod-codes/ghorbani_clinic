import { DrawOutlined, RemoveRedEyeOutlined, SaveAltOutlined, TypeSpecimenOutlined } from "@mui/icons-material"
import { Backdrop, Box, CircularProgress, Divider, IconButton, Stack, Typography } from "@mui/material"
import { t } from "i18next";
import { useState, useRef, useEffect, useContext } from "react"
import { RendererDbAPI } from "../../../Electron/Database/handleDbRendererEvents";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { TextEditor } from "../TextEditor/TextEditor";
import { Canvas } from "../Canvas/Canvas";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";

export type EditorProps = {
    title?: string;
    text?: string | undefined;
    canvasId?: string;
    canvasFileName?: string;
    setHasUnsavedChanges?: (state: boolean) => void
    onSave?: (text: string, canvasId?: string) => void | Promise<void>;
    onChange?: () => void | Promise<void>;
}

export function Editor({ title, text: inputText, canvasId: inputCanvasId, canvasFileName, onSave, onChange, setHasUnsavedChanges: setHasUnsavedChangesProperty }: EditorProps) {
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

    const canvas = useRef<HTMLCanvasElement>()

    console.log('Editor', { title, inputText, canvasId, text, status, canvasFileName, canvas: canvas.current })

    const saveContent = async () => {
        try {
            setLoading(true)

            if (onSave)
                await onSave(text, canvasId)

            setContentHasUnsavedChanges(false)
        }
        finally {
            setLoading(false)
        }
    }

    const saveCanvas = () => {
        setLoading(true)

        return new Promise<void>((resolve, reject) => {
            try {
                canvas.current?.toBlob(async (b) => {
                    const imageData = canvas.current?.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.current?.width, canvas.current?.height)
                    const data = imageData.data.buffer

                    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(canvasFileName, { width: canvas.current?.width, height: canvas.current?.height, colorSpace: 'srgb', data })
                    console.log('res', res)
                    if (res.code !== 200 || !res.data) {
                        publish(RESULT_EVENT_NAME, {
                            severity: 'error',
                            message: t('failedToUploadCanvas')
                        })

                        resolve()
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
                    resolve()
                })
            }
            finally {
                setLoading(false)
            }
        })
    }

    const init = async () => {
        console.log('Editor', 'init', 'start', canvas.current)

        setLoading(true)

        if (!canvasId) {
            console.log('Editor', 'init', 'end', 'no canvas')
            setLoading(false)
            return
        }

        if (!canvas.current) {
            console.log('Editor', 'init', 'end', 'no canvas ref')
            setLoading(false)
            return
        }

        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(canvasId)
        console.log('res', res)
        if (res.code !== 200 || !res.data) {
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToUploadCanvas')
            })
            console.log('Editor', 'init', 'end')
            setLoading(false)
            return
        }

        publish(RESULT_EVENT_NAME, {
            severity: 'success',
            message: t('successfullyUploadedCanvas')
        })

        const uint8ClampedArray = new Uint8ClampedArray((res.data.data as any).data)
        console.log('Editor', 'uint8ClampedArray', uint8ClampedArray)

        const image = new ImageData(uint8ClampedArray, res.data.width, res.data.height, { colorSpace: res.data.colorSpace })
        console.log('Editor', 'image', image)

        canvas.current.getContext('2d', { willReadFrequently: true }).putImageData(image, 0, 0)

        setLoading(false)
        console.log('Editor', 'init', 'end')
    }

    const hasInitCalled = useRef<boolean>()
    useEffect(() => {
        console.log('Editor', 'useEffect', 'start', canvas.current)
        if (status === 'drawing' && canvas.current && !hasInitCalled.current) {
            hasInitCalled.current = true
            init().then(() => console.log('Editor', 'useEffect', 'end'))
        }
        else
            console.log('Editor', 'useEffect', 'end')
    }, [status, canvas.current])

    return <>
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
                    <IconButton onClick={() => setStatus('showing')}>
                        <RemoveRedEyeOutlined />
                    </IconButton>
                    <IconButton onClick={() => setStatus('typing')}>
                        <TypeSpecimenOutlined />
                    </IconButton>
                    {canvasFileName
                        &&
                        <IconButton onClick={() => setStatus('drawing')}>
                            <DrawOutlined />
                        </IconButton>
                    }
                </Stack>
            </Stack>

            <Divider />

            {status === 'showing'
                &&
                <Typography variant='body1'>
                    {text}
                </Typography>
            }

            {status === 'typing'
                &&
                <>
                    <Stack direction='row' justifyContent='start' alignContent='center'>
                        <IconButton onClick={saveContent} color={contentHasUnsavedChanges ? 'warning' : 'default'}>
                            <SaveAltOutlined />
                        </IconButton>
                    </Stack>
                    <TextEditor
                        text={inputText}
                        onChange={async (t) => {
                            setContentHasUnsavedChanges(true)
                            setText(t)
                            if (onChange)
                                await onChange()
                        }}
                    />
                </>
            }

            {
                canvasFileName && status === 'drawing'
                &&
                <>
                    <Stack direction='row' justifyContent='start' alignContent='center'>
                        <IconButton onClick={saveCanvas} color={canvasHasUnsavedChanges ? 'warning' : 'default'}>
                            <SaveAltOutlined />
                        </IconButton>
                    </Stack>

                    <Box sx={{ flexGrow: 2, width: '100%', height: '100%' }}>
                        <Canvas
                            canvasRef={canvas}
                            {...{ onChange: () => setCanvasHasUnsavedChanges(true) }}
                        />
                    </Box>
                </>
            }

        </Stack >
    </>
}

