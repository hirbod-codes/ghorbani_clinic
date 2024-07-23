import { useState, useEffect, useRef } from 'react';
import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material"

import { TextEditor } from './TextEditor';
import { DrawOutlined, RemoveRedEyeOutlined, TypeSpecimenOutlined } from '@mui/icons-material';
import { Canvas } from '../Canvas/Canvas';
import { t } from 'i18next';
import { RendererDbAPI } from '../../../Electron/Database/handleDbRendererEvents';
import { publish } from '../../Lib/Events';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';

import '../Canvas/styles.css'

export type TextEditorWrapperProps = {
    title?: string;
    defaultContent?: string | undefined;
    defaultCanvas?: string;
    canvasFileName?: string;
    onChange?: (content: string, canvasId?: string) => void | Promise<void>;
}

export function TextEditorWrapper({ title, defaultContent, defaultCanvas, canvasFileName, onChange }: TextEditorWrapperProps) {
    const [content, setContent] = useState<string | undefined>(defaultContent)
    const [status, setStatus] = useState<string>('showing')

    console.log('TextEditorWrapper', { title, defaultContent, defaultCanvas, onChange, content, status })

    const canvas = useRef<HTMLCanvasElement>()

    const init = async () => {
        setContent(defaultContent);

        if (!defaultCanvas || !canvas.current)
            return

        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(defaultCanvas)
        console.log('res', res)
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

        const uint8ClampedArray = new Uint8ClampedArray((res.data.data as any).data)
        console.log('uint8ClampedArray', uint8ClampedArray)
        const image = new ImageData(uint8ClampedArray, res.data.width, res.data.height, { colorSpace: res.data.colorSpace })
        console.log('image', image)
        canvas.current?.getContext('2d', { willReadFrequently: true }).putImageData(image, 0, 0)
    }

    useEffect(() => {
        init()
    }, [defaultContent, defaultCanvas, canvas.current])

    return (
        <>
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

                {status === 'typing'
                    &&
                    <TextEditor
                        defaultContent={defaultContent}
                        onChange={(c) => setContent(c)}
                    />
                }

                {
                    canvasFileName && status === 'drawing'
                    &&
                    <Box sx={{ flexGrow: 2, width: '100%', height: '100%' }}>
                        <Canvas outRef={canvas} />
                    </Box>
                }

                {status === 'showing'
                    &&
                    <Typography variant='body1'>
                        {content}
                    </Typography>
                }

                <Stack direction='row' justifyContent='space-between' alignContent='center'>
                    <Button variant='contained' color='error' onClick={async () => { }}>
                        {t('cancel')}
                    </Button>

                    <Button variant='contained' color='success' onClick={async () => {
                        if (status !== 'drawing') {
                            if (onChange)
                                await onChange(content, undefined)

                            return
                        }

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
                                return
                            }

                            publish(RESULT_EVENT_NAME, {
                                severity: 'success',
                                message: t('successfullyUploadedCanvas')
                            })

                            defaultCanvas = res.data

                            if (onChange)
                                onChange(content, res.data)
                        },)
                    }} >
                        {t('done')}
                    </Button>
                </Stack>
            </Stack >
        </>
    )
}
function _arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
