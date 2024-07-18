import { useState } from 'react';
import { Modal, Paper, Slide } from "@mui/material"

import { TextEditor } from './TextEditor';

export function TextEditorModal({ open, onClose, defaultText: defaultContent, onChange }: { open: boolean; onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void; defaultText?: string | undefined; onChange?: (address: string) => void | Promise<void> }) {
    const [text, setText] = useState<string | undefined>(defaultContent)

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
                        <TextEditor
                            defaultContent={defaultContent}
                            onSave={(content) => {
                                setText(content)
                                if (onChange)
                                    onChange(content)
                            }}
                        />
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}

