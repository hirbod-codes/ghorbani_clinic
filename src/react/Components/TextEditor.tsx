import { useState } from 'react'
import { Box, Modal, Paper, Slide } from "@mui/material"
import ReactQuill from 'react-quill'
// import {} from 'react-quill'
// import 'react-quill/dist/quill.snow.css'

export function TextEditor({ open, onClose, defaultText, onChange }: { open: boolean; onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void; defaultText?: string | undefined; onChange?: (address: string) => void | Promise<void> }) {
    const [text, setText] = useState<string | undefined>(defaultText)

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
                    <Paper sx={{ width: '80%', height: '90%', padding: '0.5rem 2rem', overflow: 'hidden' }}>
                        <ReactQuill
                            // height='100%'
                            value={text}
                            style={{ height: '100%', border: 0 }}
                            onChange={(t) => {
                                console.log(t);

                                setText(t)
                                if (onChange)
                                    onChange(t)
                            }}
                        // theme="snow"
                        />
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}

