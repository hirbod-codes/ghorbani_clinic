import { useState } from "react";
import { Modal, Paper, Slide, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material"

import { TextEditorWrapper } from './TextEditorWrapper';
import { t } from "i18next";

export function TextEditorModal({ open, onClose, title, defaultContent, defaultCanvas, canvasFileName, onChange }: { open: boolean; onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void; title?: string; defaultContent?: string | undefined; defaultCanvas?: string; canvasFileName?: string; onChange?: (content: string) => void | Promise<void> }) {
    console.log('TextEditorModal', { open, onClose, title, defaultContent, onChange })

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        e: undefined,
        r: undefined,
    }
    const [dialog, setDialog] = useState(initDialog)
    const closeDialog = () => setDialog(initDialog)

    return (
        <>
            <Modal
                onClose={(e, r) => {
                    setDialog({
                        open: true,
                        title: t('exiting'),
                        content: t('areYouSure?'),
                        e,
                        r
                    })
                }}
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
                            canvasFileName={canvasFileName}
                            onChange={onChange}
                        />
                    </Paper>
                </Slide>
            </Modal>

            <Dialog open={dialog.open} onClose={closeDialog} >
                <DialogTitle>
                    {dialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialog.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>{t('No')}</Button>
                    <Button onClick={() => {
                        if (onClose)
                            onClose(dialog.e, dialog.r)

                        closeDialog()
                    }}>{t('Yes')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

