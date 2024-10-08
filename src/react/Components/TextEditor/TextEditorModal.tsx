import { useEffect, useState } from "react";
import { Modal, Paper, Slide, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Stack, Divider, IconButton } from "@mui/material"

import { TextEditor, TextEditorProps } from './TextEditor';
import { t } from "i18next";
import { SaveAltOutlined } from "@mui/icons-material";

export type TextEditorModalProps = TextEditorProps & {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    onChange: () => void | Promise<void>;
    onSave: (text: string) => void | Promise<void>;
}

export function TextEditorModal({ open, onClose, onSave: onChange, onSave, placeholder, text: inputText }: TextEditorModalProps) {
    const [text, setText] = useState(inputText)
    useEffect(() => {
        setText(inputText)
    }, [inputText])

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        e: undefined,
        r: undefined,
    }
    const [dialog, setDialog] = useState(initDialog)
    const closeDialog = () => setDialog(initDialog)

    console.log('TextEditorModal', { open, dialog, placeholder, text })

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    return (
        <>
            <Modal
                onClose={(e, r) => {
                    if (hasUnsavedChanges)
                        setDialog({
                            open: true,
                            title: t('TextEditorModal.exiting'),
                            content: t('TextEditorModal.areYouSure?YouHaveUnsavedChanges'),
                            e,
                            r
                        })
                    else if (onClose)
                        onClose(dialog.e, dialog.r)
                }}
                open={open}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={open ? 'up' : 'down'} in={open} timeout={250}>
                    <Paper sx={{ width: '80%', height: '90%', padding: '0.5rem 1rem', overflow: 'auto' }}>
                        <Stack direction='column' spacing={1} sx={{ width: '100%', height: '100%' }}>
                            <IconButton
                                onClick={async () => {
                                    if (onSave)
                                        await onSave(text)
                                    setHasUnsavedChanges(false)
                                }}
                                color={hasUnsavedChanges ? 'warning' : 'default'}
                            >
                                <SaveAltOutlined />
                            </IconButton>
                            <Divider />
                            <TextEditor
                                placeholder={placeholder}
                                text={text}
                                onChange={(t: string) => {
                                    setHasUnsavedChanges(true)
                                    setText(t)
                                    if (onChange)
                                        onChange(t)
                                }}
                            />
                        </Stack>
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
                    <Button onClick={closeDialog}>{t('TextEditorModal.No')}</Button>
                    <Button onClick={() => {
                        if (onClose)
                            onClose(dialog.e, dialog.r)

                        closeDialog()
                    }}>{t('TextEditorModal.Yes')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

