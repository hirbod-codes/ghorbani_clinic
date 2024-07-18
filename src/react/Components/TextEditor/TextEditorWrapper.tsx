import { useState, useEffect } from 'react';
import { Divider, IconButton, Stack, Typography } from "@mui/material"

import { TextEditor } from './TextEditor';
import { EditOutlined, RemoveRedEyeOutlined } from '@mui/icons-material';

export function TextEditorWrapper({ title, defaultContent, onChange }: { title?: string; defaultContent?: string | undefined; onChange?: (content: string) => void | Promise<void> }) {
    const [content, setContent] = useState<string | undefined>(defaultContent)
    const [editing, setEditing] = useState<boolean>(false)

    console.log('TextEditorWrapper', { title, defaultContent, onChange, content, editing })

    useEffect(() => { setContent(defaultContent) }, [defaultContent])

    return (
        <>
            <Stack direction='column' spacing={1}>
                <Stack direction='row' justifyContent='space-between' alignContent='center'>
                    <Typography variant='h5'>
                        {title}
                    </Typography>
                    <IconButton onClick={() => setEditing(!editing)}>
                        {editing ? <EditOutlined /> : <RemoveRedEyeOutlined />}
                    </IconButton>
                </Stack>
                <Divider />
                {editing
                    ? <TextEditor
                        defaultContent={defaultContent}
                        onChange={(c) => {
                            setContent(c)
                            if (onChange)
                                onChange(c)
                        }}
                    />
                    : <Typography variant='body1'>
                        {content}
                    </Typography>
                }
            </Stack>
        </>
    )
}

