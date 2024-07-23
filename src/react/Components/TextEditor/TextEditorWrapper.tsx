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

    const [dataUrl, setDataUrl] = useState<any>()

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

                        // const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(defaultCanvas)
                        // console.log('res', res)
                        // if (res.code !== 200 || !res.data) {
                        //     publish(RESULT_EVENT_NAME, {
                        //         severity: 'error',
                        //         message: t('failedToUploadCanvas')
                        //     })
                        //     return
                        // }

                        // publish(RESULT_EVENT_NAME, {
                        //     severity: 'success',
                        //     message: t('successfullyUploadedCanvas')
                        // })

                        // let src = ''
                        // const reader = new FileReader();
                        // reader.readAsDataURL(new Blob([res.data.data]));
                        // reader.onloadend = function () {
                        //     src = reader.result as string;
                        // }

                        // const url = URL.createObjectURL(b)
                        // const img = new Image();

                        // img.onload = function () {
                        //     // URL.revokeObjectURL(img.src);
                        //     canvas?.current?.getContext('2d', { willReadFrequently: true })?.drawImage(img, canvas?.current?.width, canvas?.current?.height)
                        // };

                        // img.src = src;

                        // Uint8ClampedArray.from(atob(res.data.data))

                        // canvas?.current?.getContext('2d', { willReadFrequently: true })?.putImageData(new ImageData(res.data.data, res.data.width, res.data.height, { colorSpace: res.data.colorSpace }), canvas?.current?.width, canvas?.current?.height)

                        // canvas?.current?.toBlob(async (b) => {
                        //     const image = canvas?.current?.getContext('2d', { willReadFrequently: true })?.getImageData(0, 0, canvas?.current?.width, canvas?.current?.height)
                        //     const data = await b.arrayBuffer()

                        //     let src = ''
                        //     const reader = new FileReader();
                        //     reader.readAsDataURL(b);
                        //     reader.onloadend = function () {
                        //         src = reader.result as string;
                        //     }

                        //     // const url = URL.createObjectURL(b)
                        //     const img = new Image();

                        //     img.onload = function () {
                        //         // URL.revokeObjectURL(img.src);
                        //         canvas?.current?.getContext('2d', { willReadFrequently: true })?.drawImage(img, canvas?.current?.width, canvas?.current?.height)
                        //     };

                        //     img.src = src;

                        //     // const imageData = Uint8ClampedArray.from(data)
                        //     // canvas?.current?.getContext('2d', { willReadFrequently: true })?.putImageData(new ImageData(imageData, res.data.width, res.data.height, { colorSpace: res.data.colorSpace }), canvas?.current?.width, canvas?.current?.height)
                        // })



                        // canvas?.current?.getContext('2d', { willReadFrequently: true })?.putImageData(new ImageData(Uint8ClampedArray.from(atob(res.data.data as string) as any), res.data.width, res.data.height, { colorSpace: res.data.colorSpace }), canvas?.current?.width, canvas?.current?.height)
                    }}>
                        {t('cancel')}
                    </Button>
                    <Button variant='contained' color='info' onClick={async () => {
                        if (!defaultCanvas)
                            return

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.openCanvas(defaultCanvas)
                        console.log('res', res)
                    }}>
                        {t('cancel1')}
                    </Button>

                    <Button variant='contained' color='success' onClick={async () => {
                        if (status !== 'drawing') {
                            if (onChange)
                                await onChange(content, undefined)

                            return
                        }

                        canvas?.current?.toBlob(async (b) => {
                            let canvasId
                            // const image = canvas?.current?.getContext('2d', { willReadFrequently: true })?.getImageData(0, 0, canvas?.current?.width, canvas?.current?.height)
                            // const data = await b.arrayBuffer()

                            const imageData = canvas?.current?.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas?.current?.width, canvas?.current?.height)
                            const data = imageData.data.buffer


                            const src = 'data:image/png;base64,' + _arrayBufferToBase64(data);
                            console.log('src', src)
                            // setDataUrl(src)

                            const uint8ClampedArray = new Uint8ClampedArray(data)
                            const image = new ImageData(uint8ClampedArray, canvas?.current?.width, canvas?.current?.height, { colorSpace: 'srgb' })
                            canvas!.current!.getContext('2d', { willReadFrequently: true }).putImageData(image, 200, 200)
                            // canvas?.current?.getContext('2d', { willReadFrequently: true }).drawImage(await createImageBitmap(), canvas?.current?.width, canvas?.current?.height)

                                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(canvasFileName, { width: image.width, height: image.height, colorSpace: 'srgb', data })
                                console.log('res', res)
                            //     if (res.code !== 200 || !res.data) {
                            //         publish(RESULT_EVENT_NAME, {
                            //             severity: 'error',
                            //             message: t('failedToUploadCanvas')
                            //         })
                            //         return
                            //     }

                            //     publish(RESULT_EVENT_NAME, {
                            //         severity: 'success',
                            //         message: t('successfullyUploadedCanvas')
                            //     })

                            //     canvasId = res.data
                            //     defaultCanvas = res.data

                            //     if (onChange)
                            //         onChange(content, canvasId)
                        },)
                    }} >
                        {t('done')}
                    </Button>
                </Stack>

                {dataUrl &&
                    <img src={dataUrl} width={canvas?.current?.width} height={canvas?.current?.height} />
                }
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
