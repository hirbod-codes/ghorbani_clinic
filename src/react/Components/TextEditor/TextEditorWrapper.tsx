import { useState, useEffect } from 'react';
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material"

import { TextEditor } from './TextEditor';
import { DrawOutlined, RemoveRedEyeOutlined, TypeSpecimenOutlined } from '@mui/icons-material';
import { Canvas } from '../Canvas/Canvas';

export function TextEditorWrapper({ title, defaultContent, onChange }: { title?: string; defaultContent?: string | undefined; onChange?: (content: string) => void | Promise<void> }) {
    const [content, setContent] = useState<string | undefined>(defaultContent)
    const [status, setStatus] = useState<string>('showing')

    console.log('TextEditorWrapper', { title, defaultContent, onChange, content, status })

    useEffect(() => { setContent(defaultContent) }, [defaultContent])

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
                        onChange={(c) => {
                            setContent(c)
                            if (onChange)
                                onChange(c)
                        }}
                    />
                }

                {
                    status === 'drawing'
                    &&
                    <Box sx={{ flexGrow: 2, width: '100%', height: '100%' }}>
                        <Canvas />
                    </Box>
                }

                {status === 'showing'
                    &&
                    <Typography variant='body1'>
                        {content}
                    </Typography>
                }
            </Stack>
        </>
    )
}

