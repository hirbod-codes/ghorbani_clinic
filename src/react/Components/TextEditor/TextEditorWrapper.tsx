import { useState, useEffect, useRef } from 'react';
import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material"

import { TextEditor } from './TextEditor';
import { DrawOutlined, RemoveRedEyeOutlined, TypeSpecimenOutlined } from '@mui/icons-material';
import { Canvas } from '../Canvas/Canvas';
import { t } from 'i18next';
import { RendererDbAPI } from '../../../Electron/Database/handleDbRendererEvents';
import { publish } from '../../Lib/Events';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';

export function TextEditorWrapper({ title, defaultContent, defaultCanvas, onChange }: { title?: string; defaultContent?: string | undefined; defaultCanvas?: string; onChange?: (content: string, canvasId?: string) => void | Promise<void> }) {
    const [content, setContent] = useState<string | undefined>(defaultContent)
    const [status, setStatus] = useState<string>('showing')

    console.log('TextEditorWrapper', { title, defaultContent, onChange, content, status })

    const canvas = useRef<HTMLCanvasElement>()

    useEffect(() => {
        setContent(defaultContent);

        (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.downloadCanvas(defaultCanvas)
            .then((c) => {
                const context = canvas?.current?.getContext('2d', { willReadFrequently: true })
                context?.putImageData(c, canvas?.current?.width, canvas?.current?.height)
            })
    }, [defaultContent])

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
                        <IconButton onClick={() => setStatus('drawing')}>
                            <DrawOutlined />
                        </IconButton>
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
                    status === 'drawing'
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
                    <Button variant='contained' color='error' onClick={() => { }}>
                        {t('cancel')}
                    </Button>

                    <Button variant='contained' color='success' onClick={async () => {
                        let canvasId
                        if (status === 'drawing') {
                            console.log(
                                'TextEditorWrapper',
                                'onDone',
                                canvas?.current,
                                canvas?.current?.getContext('2d'),
                                canvas?.current?.getContext('2d', { willReadFrequently: true })?.getImageData(0, 0, canvas?.current?.width, canvas?.current?.height),
                            );

                            const image = canvas?.current?.getContext('2d', { willReadFrequently: true })?.getImageData(0, 0, canvas?.current?.width, canvas?.current?.height)

                            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadCanvas(image)
                            if (res.code !== 200)
                                publish(RESULT_EVENT_NAME, {
                                    severity: 'error',
                                    message: t('failedToUploadCanvas')
                                })
                            else
                                canvasId = res.data
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

