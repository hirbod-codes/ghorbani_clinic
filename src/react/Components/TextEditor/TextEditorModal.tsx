import { Modal, Paper, Slide } from "@mui/material"

import { TextEditorWrapper } from './TextEditorWrapper';

export function TextEditorModal({ open, onClose, title, defaultContent, defaultCanvas, onChange }: { open: boolean; onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void; title?: string; defaultContent?: string | undefined; defaultCanvas?: string; onChange?: (content: string) => void | Promise<void> }) {
    console.log('TextEditorModal', { open, onClose, title, defaultContent, onChange })

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
                        <TextEditorWrapper
                            title={title}
                            defaultCanvas={defaultCanvas}
                            defaultContent={defaultContent}
                            onChange={onChange}
                        />
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}

