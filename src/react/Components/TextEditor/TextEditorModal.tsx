import { useState, useEffect } from 'react';
import { IconButton, Modal, Paper, Slide, Stack, Typography } from "@mui/material"

import { TextEditor } from './TextEditor';
import { EditOutlined, RemoveRedEyeOutlined } from '@mui/icons-material';

export function TextEditorModal({ open, onClose, title, defaultContent, onChange }: { open: boolean; onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void; title?: string; defaultContent?: string | undefined; onChange?: (content: string) => void | Promise<void> }) {
    const [content, setContent] = useState<string | undefined>(defaultContent)
    const [editing, setEditing] = useState<boolean>(false)

    console.log('TextEditorModal', { open, onClose, title, defaultContent, onChange, content, editing })

    useEffect(() => { setContent(defaultContent) }, [defaultContent])

    return (
        <>
            <Modal
                onClose={onClose}
                open={open}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={open ? 'up' : 'down'} in={open} timeout={250}>
                    <Paper sx={{ width: '80%', height: '90%', padding: '0.5rem 1rem', overflow: 'auto' }}>
                        <Stack direction='column'>
                            <Stack direction='row' justifyContent='space-between' alignContent='center'>
                                <Typography variant='h5'>
                                    {title}
                                </Typography>
                                <IconButton onClick={() => setEditing(!editing)}>
                                    {editing ? <EditOutlined /> : <RemoveRedEyeOutlined />}
                                </IconButton>
                            </Stack>
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
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}

