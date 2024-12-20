import { t } from "i18next";
import { useState, useRef, useEffect, useContext, memo } from "react"
import { RendererDbAPI } from "../../../../Electron/Database/renderer";
import { RESULT_EVENT_NAME } from "../../../Contexts/ResultWrapper";
import { publish } from "../../../Lib/Events";
import { TextEditor } from "../TextEditor/TextEditor";
import { Canvas } from "../Canvas";
import { ConfigurationContext } from "../../../Contexts/Configuration/ConfigurationContext";
import { SaveIcon } from "../../Icons/SaveIcon";
import { isCanvasEmpty } from "../Canvas/helpers";
import { Canvas as CanvasModel } from "../../../../Electron/Database/Models/Canvas";
import { AnimatedSlide } from "../../Animations/AnimatedSlide";
import { CircularLoading } from "../CircularLoading";
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { Button } from "@/src/react/shadcn/components/ui/button";
import { CloudUploadIcon, EyeIcon, FileTypeIcon, FolderCheckIcon, SquarePenIcon } from "lucide-react";
import { Tooltip } from "../Tooltip";

export type EditorProps = {
    hideCanvas?: boolean;
    hideTextEditor?: boolean;
    title?: string;
    text?: string | undefined;
    canvasId?: string;
    setHasUnsavedChanges?: (state: boolean) => void
    onSave?: (text?: string, canvasId?: string) => void | Promise<void>;
    onChange?: (text?: string, canvasId?: string) => void | Promise<void>;
}

export const Editor = memo(function Editor({ hideCanvas = false, hideTextEditor = false, title, text: inputText, canvasId: inputCanvasId, onSave, onChange, setHasUnsavedChanges: setHasUnsavedChangesProperty }: EditorProps) {
    const themeOptions = useContext(ConfigurationContext)!.themeOptions
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

    const imageRef = useRef<HTMLImageElement | null>(null)
    const [imageSrc, setImageSrc] = useState<string>()
    const [status, setStatus] = useState<string>('showing')

    const [contentHasUnsavedChanges, setContentHasUnsavedChangesState] = useState<boolean>(false)
    const [canvasHasUnsavedChanges, setCanvasHasUnsavedChangesState] = useState<boolean>(false)

    const [backgroundColor, setBackgroundColor] = useState<string>()

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

    const canvas = useRef<HTMLCanvasElement | null>(null)

    console.log('Editor', { title, loading, inputText, canvasId, text, status, canvas: canvas.current, imageSrc, contentHasUnsavedChanges, canvasHasUnsavedChanges })

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

            let id: string | undefined = undefined

            if (!canvas.current)
                return

            if (!isCanvasEmpty(canvas)) {
                const dataUrl = canvas.current?.toDataURL()
                if (!dataUrl)
                    return

                const type = dataUrl.split(',')[0].replace(';base64', '').replace('data:', '')
                const data = dataUrl.split(',')[1]
                console.log({ dataUrl, type, data })

                const c: CanvasModel = {
                    width: canvas.current?.width,
                    height: canvas.current?.height,
                    colorSpace: 'srgb',
                    backgroundColor: canvas.current.style.backgroundColor,
                    type,
                    data,
                }
                console.log({ canvasModel: c })
                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(c)

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
                        setBackgroundColor(data.backgroundColor)

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
                        canvas.current.style.backgroundColor = data.backgroundColor

                    const image = new Image()
                    image.onload = () => {
                        canvas.current?.getContext('2d', { willReadFrequently: true })?.drawImage(image, 0, 0);
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

            init().finally(() => console.groupEnd())
        }
        finally { console.groupEnd() }
    }, [status, canvas.current, inputCanvasId, inputText, canvasId])

    return (
        <>
            <AnimatedSlide open={loading}>
                <CircularLoading />
            </AnimatedSlide>

            <div className="flex flex-col items-stretch w-full h-full">
                <div className="flex flex-row justify-center overflow-auto">
                    <div className="overflow-auto text-nowrap">
                        <h6>{title}</h6>
                    </div>
                    <div className="flex flex-row justify-end content-center items-center">
                        <Tooltip tooltipContent={t('Editor.View')}>
                            <Button size='icon' onClick={() => { setStatus('showing') }}>
                                <EyeIcon color={themeOptions.colors.primary} />
                            </Button>
                        </Tooltip>

                        {!hideTextEditor &&
                            <Tooltip tooltipContent={t('Editor.Notes')}>
                                <Button size='icon' onClick={() => { setStatus('typing') }}>
                                    <FileTypeIcon strokeWidth={1.25} color={themeOptions.colors.primary} />
                                </Button>
                            </Tooltip>
                        }

                        {!hideCanvas &&
                            <Tooltip tooltipContent={t('Editor.WhiteBoard')}>
                                <Button size='icon' onClick={() => { setStatus('drawing') }}>
                                    <SquarePenIcon strokeWidth={1.5} color={themeOptions.colors.primary} />
                                </Button>
                            </Tooltip>
                        }
                    </div>
                </div>

                {status === 'showing' &&
                    <>
                        <Separator />

                        <div className="flex flex-col pr-1 overflow-auto flex-grow w-full">
                            {text &&
                                <>
                                    <h5>
                                        {t('Editor.description')}
                                    </h5>

                                    <Separator />

                                    <div dangerouslySetInnerHTML={{ __html: text }} />

                                    <Separator />
                                </>
                            }

                            {canvasId &&
                                <img ref={imageRef} src={imageSrc} style={{ backgroundColor }} />
                            }
                        </div>
                    </>
                }

                {!hideTextEditor && status === 'typing' &&
                    <>
                        <Separator />

                        {onSave &&
                            <Button size='icon' onClick={saveContent} color={contentHasUnsavedChanges ? themeOptions.colors.accent : themeOptions.colors.primary} >
                                {contentHasUnsavedChanges ? <SaveIcon color='warning' /> : <SaveIcon color='success' />}
                            </Button>
                        }

                        <Separator />

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

                {!hideCanvas && status === 'drawing' &&
                    <>
                        <Separator />

                        {onSave &&
                            <Button size='icon' onClick={saveCanvas} color={canvasHasUnsavedChanges ? themeOptions.colors.accent : themeOptions.colors.primary} >
                                {canvasHasUnsavedChanges ? <CloudUploadIcon color={themeOptions.colors.accent} /> : <FolderCheckIcon color={themeOptions.colors.primary} />}
                            </Button>
                        }

                        <Separator />

                        <div className="flex-grow overflow-hidden">
                            <Canvas
                                canvasRef={canvas}
                                onChange={async (empty) => {
                                    setCanvasHasUnsavedChanges(true);
                                    if (onChange)
                                        await onChange(text, canvasId)
                                }}
                            />
                        </div>
                    </>
                }
            </div>
        </>
    )
})
