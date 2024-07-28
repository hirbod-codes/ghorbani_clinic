import { DrawOutlined, PrintOutlined, RemoveRedEyeOutlined, SaveAltOutlined, TypeSpecimenOutlined } from "@mui/icons-material"
import { Backdrop, Box, CircularProgress, Divider, IconButton, Stack, Typography } from "@mui/material"
import { t } from "i18next";
import { useState, useRef, useEffect, useContext } from "react"
import { RendererDbAPI } from "../../../Electron/Database/handleDbRendererEvents";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { TextEditor } from "../TextEditor/TextEditor";
import { Canvas } from "../Canvas/Canvas";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { useReactToPrint } from "react-to-print";

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

    const canvas = useRef<HTMLCanvasElement>()
    const printRef = useRef<HTMLImageElement>()
    const print = useReactToPrint({ onAfterPrint: () => { setLoading(false); printRef.current.src = null } })

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

        return new Promise<void>(async (resolve, reject) => {
            try {
                const dataUrl = canvas.current?.toDataURL()
                const type = dataUrl.split(',')[0].replace(';base64', '').replace('data:', '')
                const data = dataUrl.split(',')[1]
                console.log('saveCanvas', 'data', data)

                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(
                    canvasFileName,
                    {
                        width: canvas.current?.width,
                        height: canvas.current?.height,
                        colorSpace: 'srgb',
                        type,
                        data,
                    })
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
            }
            finally {
                setLoading(false)
            }
        })
    }

    const getCanvas = async () => {
        console.log('getCanvas', 'start')

        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(canvasId)
        console.log('getCanvas', 'res', res)

        if (res.code !== 200 || !res.data) {
            console.log('getCanvas', 'end')
            return
        }

        console.log('getCanvas', 'end')
        return res.data
    }

    useEffect(() => {
        console.log('Editor', 'useEffect', 'start', { status, canvas: canvas.current })
        if (status === 'showing') {
            setLoading(true)

            if (!canvasId) {
                console.log('Editor', 'useEffect', 'end', 'no canvas id')
                setLoading(false)
                return
            }

            getCanvas().then(async (data) => {
                if (!data) {
                    publish(RESULT_EVENT_NAME, {
                        severity: 'error',
                        message: t('failedToUploadCanvas')
                    })
                    console.log('Editor', 'useEffect', 'end')
                    setLoading(false)
                    return
                }

                publish(RESULT_EVENT_NAME, {
                    severity: 'success',
                    message: t('successfullyUploadedCanvas')
                })

                setImageSrc(`data:${data.type};base64,${data.data}`);

                setLoading(false)
                console.log('Editor', 'useEffect', 'end')
            })
        }
        else if (status === 'drawing' && canvas.current) {
            setLoading(true)

            if (!canvasId) {
                console.log('Editor', 'useEffect', 'end', 'no canvas id')
                setLoading(false)
                return
            }

            if (!canvas.current) {
                console.log('Editor', 'useEffect', 'end', 'no canvas ref')
                setLoading(false)
                return
            }

            getCanvas().then((data) => {
                if (!data) {
                    publish(RESULT_EVENT_NAME, {
                        severity: 'error',
                        message: t('failedToUploadCanvas')
                    })
                    console.log('Editor', 'useEffect', 'end')
                    setLoading(false)
                    return
                }

                publish(RESULT_EVENT_NAME, {
                    severity: 'success',
                    message: t('successfullyUploadedCanvas')
                })

                const image = new Image()
                image.onload = () => canvas.current.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0)
                image.src = 'data:image/png;base64,' + data.data

                setLoading(false)
                console.log('Editor', 'useEffect', 'end')
            })
        }
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
                    <IconButton onClick={() => {
                        setStatus('showing')
                    }}>
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
                <Stack direction='column' spacing={1} sx={{ width: '100%', height: '100%' }}>
                    {text &&
                        <>
                            <Typography variant='h5'>
                                {t('description')}
                            </Typography>

                            <Divider />

                            <Typography variant='body1'>
                                {text}
                            </Typography>

                            <Divider />
                        </>
                    }

                    {imageSrc &&
                        <Box sx={{ flexGrow: 2 }}>
                            <img src={imageSrc} />
                        </Box>
                    }
                </Stack>
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
                        <IconButton onClick={() => {
                            printRef.current.src = canvas.current.toDataURL()
                            setLoading(true)
                            print(null, () => printRef.current);
                        }}>
                            <PrintOutlined />
                        </IconButton>
                    </Stack>

                    <Box sx={{ flexGrow: 2, overflow: 'hidden' }}>
                        <Canvas
                            canvasRef={canvas}
                            onChange={async () => {
                                setCanvasHasUnsavedChanges(true);
                                if (onChange)
                                    await onChange()
                            }}
                        />
                    </Box>
                </>
            }

            <div style={{ display: 'none' }}>
                <img ref={printRef} />
            </div>
        </Stack >
    </>
}
