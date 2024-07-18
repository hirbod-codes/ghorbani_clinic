import { useState } from 'react';
import { IconButton, Modal, Paper, Slide, Stack, Typography } from "@mui/material"

import { TextEditor } from './TextEditor';
import { EditOutlined, WatchOutlined } from '@mui/icons-material';

export function TextEditorModal({ open, onClose, title, defaultText: defaultContent, onChange }: { open: boolean; onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void; title?: string; defaultText?: string | undefined; onChange?: (address: string) => void | Promise<void> }) {
    const [text, setText] = useState<string | undefined>(undefined)
    const [editing, setEditing] = useState<boolean>(false)

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
                                    {editing ? <WatchOutlined /> : <EditOutlined />}
                                </IconButton>
                            </Stack>
                            {editing
                                ? <TextEditor
                                    defaultContent={defaultContent}
                                    onSave={(content) => {
                                        setText(text)
                                        if (onChange)
                                            onChange(content)
                                    }}
                                />
                                : <Typography variant='body1'>
                                    {text}
                                </Typography>
                            }
                        </Stack>
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}

