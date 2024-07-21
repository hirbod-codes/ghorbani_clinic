import { useState, useEffect, useRef } from 'react';
import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material"

import { TextEditor } from './TextEditor';
import { DrawOutlined, RemoveRedEyeOutlined, TypeSpecimenOutlined } from '@mui/icons-material';
import { Canvas } from '../Canvas/Canvas';
import { t } from 'i18next';
import { RendererDbAPI } from '../../../Electron/Database/handleDbRendererEvents';
import { publish } from '../../Lib/Events';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';

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

    useEffect(() => {
        setContent(defaultContent);

        // if (defaultCanvas)
        //     (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(defaultCanvas)
        //         .then((res) => {
        //             console.log('res', res)

        //             if (res.code !== 200)
        //                 publish(RESULT_EVENT_NAME, {
        //                     severity: 'error',
        //                     message: t('failedToUploadCanvas')
        //                 })

        //             publish(RESULT_EVENT_NAME, {
        //                 severity: 'success',
        //                 message: t('successfullyUploadedCanvas')
        //             })

        //             const context = canvas?.current?.getContext('2d', { willReadFrequently: true })
        //             context?.putImageData(new ImageData(Uint8ClampedArray.from(Buffer.from(decodeBase64(res.data.data, res.data.data.length))), res.data.width, res.data.height, { colorSpace: res.data.colorSpace }), canvas?.current?.width, canvas?.current?.height)
        //         })
    }, [defaultContent, defaultCanvas])

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
                    <Button variant='contained' color='error' onClick={async () => {
                        if (!defaultCanvas)
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

                        canvas?.current?.getContext('2d', { willReadFrequently: true })?.putImageData(new ImageData(res.data.data, res.data.width, res.data.height, { colorSpace: res.data.colorSpace }), canvas?.current?.width, canvas?.current?.height)
                    }}>
                        {t('cancel')}
                    </Button>

                    <Button variant='contained' color='success' onClick={async () => {
                        let canvasId
                        if (status === 'drawing') {
                            const image = canvas?.current?.getContext('2d', { willReadFrequently: true })?.getImageData(0, 0, canvas?.current?.width, canvas?.current?.height)

                            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(canvasFileName, { width: image.width, height: image.height, colorSpace: 'srgb', data: image.data })
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

                            canvasId = res.data
                            defaultCanvas = res.data
                        }

                        if (onChange)
                            onChange(content, canvasId)
                    }} >
                        {t('done')}
                    </Button>
                </Stack>
            </Stack>
        </>
    )
}

