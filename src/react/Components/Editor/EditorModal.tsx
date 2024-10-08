import { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material"
import { t } from "i18next";
import { Editor, EditorProps } from "./Editor";
import { Modal } from "../Modal";

export type TextEditorModalProps = EditorProps & {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
}

export function EditorModal({ open, onClose, title, text, canvasId, onChange, onSave, setHasUnsavedChanges: setHasUnsavedChangesProperty }: TextEditorModalProps) {
    console.log('EditorModal', { open, onClose, title, text, canvasId })

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        e: undefined,
        r: undefined,
    }
    const [dialog, setDialog] = useState(initDialog)
    const closeDialog = () => setDialog(initDialog)

    const [hasUnsavedChanges, setHasUnsavedChangesState] = useState(false)

    const setHasUnsavedChanges = (state: boolean) => {
        setHasUnsavedChangesState(state)

        if (setHasUnsavedChangesProperty)
            setHasUnsavedChangesProperty(state)
    }

    return (
        <>
            <Modal
                onClose={(e, r) => {
                    if (hasUnsavedChanges)
                        setDialog({
                            open: true,
                            title: t('EditorModal.exiting'),
                            content: t('EditorModal.areYouSure?YouHaveUnsavedChanges'),
                            e,
                            r
                        })
                    else if (onClose)
                        onClose(dialog.e, dialog.r)
                }}
                open={open}
            >
                <Editor
                    title={title}
                    text={text}
                    canvasId={canvasId}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    onSave={onSave}
                    onChange={onChange}
                />
            </Modal>

            <Dialog open={dialog.open} onClose={closeDialog} >
                <DialogTitle>
                    {dialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText whiteSpace={'break-spaces'}>
                        {dialog.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>{t('EditorModal.No')}</Button>
                    <Button onClick={() => {
                        if (onClose)
                            onClose(dialog.e, dialog.r)

                        closeDialog()
                    }}>{t('EditorModal.Yes')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
