import { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material"
import { t } from "i18next";
import { Editor, EditorProps } from "./Editor";
import { Modal } from "../Modal";

export type TextEditorModalProps = EditorProps & {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
}

export function EditorModal({ open, onClose, title, text, canvasId, canvasFileName, onChange, onSave, setHasUnsavedChanges: setHasUnsavedChangesProperty }: TextEditorModalProps) {
    console.log('EditorModal', { open, onClose, title, text, canvasId, canvasFileName })

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
                            title: t('exiting'),
                            content: t('areYouSure?YouHaveUnsavedChanges'),
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
                    canvasFileName={canvasFileName}
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
