import { t } from "i18next";
import { useState, useRef, useEffect, useContext, memo, useReducer, createRef } from "react"
import { RendererDbAPI } from "../../../../Electron/Database/renderer";
import { RESULT_EVENT_NAME } from "../../../Contexts/ResultWrapper";
import { publish } from "../../../Lib/Events";
import { TextEditor } from "../TextEditor/TextEditor";
import { Canvas } from "../Canvas";
import { ConfigurationContext } from "../../../Contexts/Configuration/ConfigurationContext";
import { SaveIcon } from "../../Icons/SaveIcon";
import { buildShapes, isCanvasEmpty } from "../Canvas/helpers";
import { Canvas as CanvasModel } from "../../../../Electron/Database/Models/Canvas";
import { CircularLoadingIcon } from "../CircularLoadingIcon";
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { Button } from "@/src/react/Components/Base/Button";
import { CloudUploadIcon, EyeIcon, FileTypeIcon, FolderCheckIcon, SquarePenIcon } from "lucide-react";
import { Tooltip } from "../Tooltip";
import { Stack } from "../Stack";
import { IShape } from "../Canvas/Shapes/IShape";
import { ObjectId } from "mongodb";
import { Shapes } from "../Canvas/Shapes/Shapes";

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

    const canvasShapes = useRef<IShape[]>()

    const [contentHasUnsavedChanges, setContentHasUnsavedChangesState] = useState<boolean>(false)
    const [canvasHasUnsavedChanges, setCanvasHasUnsavedChangesState] = useState<boolean>(false)

    const [backgroundColor, setBackgroundColor] = useState<string>()

    const [, rerender] = useReducer(x => x + 1, 0)

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
                let shapes = canvasShapes.current?.map(s => s.getSerializableModel())
                if (!shapes)
                    return

                const c: CanvasModel = {
                    width: canvas.current?.width,
                    height: canvas.current?.height,
                    backgroundColor: canvas.current.style.backgroundColor,
                    data: shapes,
                }
                console.log({ canvasModel: c })
                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(c)

                console.log({ res })
                if (res.code !== 200 || !res.data || !res.data.acknowledged) {
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

                if (canvasId)
                    console.log(await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteCanvas(canvasId))

                setCanvasId(res.data.insertedId.toString())

                id = res.data.insertedId.toString()
            } else if (canvasId)
                console.log(await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteCanvas(canvasId))

            if (onSave)
                await onSave(text, id)

            setCanvasHasUnsavedChanges(false)
        } finally {
            console.groupEnd()
        }
    }

    const getCanvas = async (id: string): Promise<{
        schemaVersion?: string | undefined;
        _id?: string | ObjectId | undefined;
        backgroundColor: string;
        width: number;
        height: number;
        data: any[];
    } | undefined> => {
        console.log('Editor', 'getCanvas')

        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getCanvas(id)
        console.log({ res })

        if (res.code !== 200 || !res.data)
            return

        return res.data
    }

    const dataRef = useRef<{
        schemaVersion?: string | undefined;
        _id?: string | ObjectId | undefined;
        backgroundColor: string;
        width: number;
        height: number;
        data: any[];
    } | undefined>(undefined)

    const init = async () => {
        console.log('Editor', 'init')

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

        dataRef.current = await getCanvas(canvasId)
        if (dataRef.current)
            dataRef.current.data = buildShapes(dataRef.current.data)

        setLoading(false)

        if (!dataRef.current) {
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
    }

    const initCanvas = () => {
        console.log('Editor', 'initCanvas')

        if (loading) {
            console.log('still loading!')
            return
        }

        if (!dataRef.current) {
            console.log('no canvas data')
            return
        }

        console.log({ status, loading, canvas: canvas.current, dataRef: dataRef.current })

        if (status === 'typing')
            return

        if (!dataRef.current) {
            console.log('no canvas data')
            return
        }

        if (!canvas.current) {
            console.log('no canvas ref')
            return
        }

        if (dataRef.current.backgroundColor)
            setBackgroundColor(dataRef.current.backgroundColor)

        canvas.current.style.backgroundColor = dataRef.current.backgroundColor
        canvas.current.width = dataRef.current.width
        canvas.current.height = dataRef.current.height
        let ctx = canvas.current.getContext('2d')!
        new Shapes(dataRef.current.data).draw({ canvasRef: canvas, ctx })

        rerender()
    }

    useEffect(() => {
        init()
    }, [canvasId])

    useEffect(() => {
        initCanvas()
    }, [status, canvas.current, dataRef.current, loading])

    return (
        <>
            <div className="size-full relative overflow-hidden">
                {!loading &&
                    <Stack direction='vertical' stackProps={{ className: "mx-0 items-stretch size-full min-h-96", id: 'editor-container' }}>
                        <Stack stackProps={{ className: "justify-between items-center overflow-auto" }}>
                            <div className="overflow-auto text-nowrap">
                                <Tooltip tooltipContent={title}>
                                    <h6>{title}</h6>
                                </Tooltip>
                            </div>
                            <Stack stackProps={{ className: "content-center items-center" }}>
                                <Tooltip tooltipContent={t('Editor.View')}>
                                    <Button isIcon variant='text' onClick={() => { setStatus('showing') }}>
                                        <EyeIcon />
                                    </Button>
                                </Tooltip>

                                {!hideTextEditor &&
                                    <Tooltip tooltipContent={t('Editor.Notes')}>
                                        <Button isIcon variant='text' onClick={() => { setStatus('typing') }}>
                                            <FileTypeIcon />
                                        </Button>
                                    </Tooltip>
                                }

                                {!hideCanvas &&
                                    <Tooltip tooltipContent={t('Editor.WhiteBoard')}>
                                        <Button isIcon variant='text' onClick={() => { setStatus('drawing') }}>
                                            <SquarePenIcon />
                                        </Button>
                                    </Tooltip>
                                }
                            </Stack>
                        </Stack>

                        {status === 'showing' &&
                            <>
                                <Separator />

                                <Stack direction='vertical' stackProps={{ className: 'pr-1 overflow-auto flex-grow w-full' }}>
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
                                        <canvas ref={canvas} />
                                    }
                                </Stack>
                            </>
                        }

                        {!hideTextEditor && status === 'typing' &&
                            <>
                                <Separator />

                                {onSave &&
                                    <Button isIcon variant='text' onClick={saveContent} fgColor={contentHasUnsavedChanges ? 'warning' : 'primary'} >
                                        {contentHasUnsavedChanges ? <SaveIcon color='inherit' /> : <SaveIcon color='inherit' />}
                                    </Button>
                                }

                                <Separator />

                                <div className="flex-grow">
                                    <TextEditor
                                        text={inputText}
                                        onChange={async (html) => {
                                            setContentHasUnsavedChanges(true)
                                            setText(html)
                                            if (onChange)
                                                await onChange(html, canvasId)
                                        }}
                                    />
                                </div>
                            </>
                        }

                        {!hideCanvas && status === 'drawing' &&
                            <>
                                <Separator />

                                {onSave &&
                                    <Button isIcon variant='text' onClick={saveCanvas} fgColor={canvasHasUnsavedChanges ? 'warning' : 'primary'}>
                                        {canvasHasUnsavedChanges ? <CloudUploadIcon color={themeOptions.colors.warning[themeOptions.mode].main} /> : <FolderCheckIcon color={themeOptions.colors.primary[themeOptions.mode].main} />}
                                    </Button>
                                }

                                <Separator />

                                <div className="flex-grow">
                                    <Canvas
                                        canvasRef={canvas}
                                        onChange={async (shapes, empty) => {
                                            setCanvasHasUnsavedChanges(true);
                                            canvasShapes.current = shapes
                                            if (onChange)
                                                await onChange(text, canvasId)
                                        }}
                                        canvasBackground={dataRef.current?.backgroundColor}
                                        defaultShapes={dataRef.current?.data}
                                    />
                                </div>
                            </>
                        }
                    </Stack>
                }
                {loading &&
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2'>
                        <CircularLoadingIcon />
                    </div>
                }
            </div>
        </>
    )
})
