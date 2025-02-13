import { useCallback, useState } from "react";
import { t } from "i18next";
import { Editor, EditorProps } from "./Editor";
import { Modal } from "../Modal";
import { Stack } from "../Stack";
import { Button } from "../Button";

export type TextEditorModalProps = EditorProps & {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
}

export function EditorModal({ hideCanvas = false, hideTextEditor = false, open, onClose, title, text, canvasId, onChange, onSave, setHasUnsavedChanges: setHasUnsavedChangesProperty }: TextEditorModalProps) {
    console.log('EditorModal', { open, onClose, title, text, canvasId })

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
    }
    const [dialog, setDialog] = useState(initDialog)
    const closeDialog = () => setDialog(initDialog)

    const [hasUnsavedChanges, setHasUnsavedChangesState] = useState(false)

    const setHasUnsavedChanges = useCallback((state: boolean) => {
        setHasUnsavedChangesState(state)

        if (setHasUnsavedChangesProperty)
            setHasUnsavedChangesProperty(state)
    }, [])

    return (
        <>
            <Modal
                onClose={() => {
                    if (hasUnsavedChanges)
                        setDialog({
                            open: true,
                            title: t('EditorModal.exiting'),
                            content: t('EditorModal.areYouSure?YouHaveUnsavedChanges'),
                        })
                    else if (onClose)
                        onClose(dialog.e, dialog.r)
                }}
                open={open}
                modalContainerProps={{ className: 'h-[66%]', id: 'editorModal' }}
            >
                <Editor
                    hideCanvas={hideCanvas}
                    hideTextEditor={hideTextEditor}
                    title={title}
                    text={text}
                    canvasId={canvasId}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    onSave={onSave}
                    onChange={onChange}
                />
            </Modal>

            <Modal
                open={dialog.open}
                onClose={() => setDialog({ ...dialog, open: false })}
            >
                <Stack direction="vertical">
                    {dialog.content}

                    <Stack>
                        <Button
                            onClick={() => {
                                if (onClose)
                                    onClose(dialog.e, dialog.r)
                                closeDialog()
                            }}
                        >
                            {t('EditorModal.Yes')}
                        </Button>

                        <Button
                            onClick={() => {
                                closeDialog()
                            }}
                        >
                            {t('EditorModal.No')}
                        </Button>
                    </Stack>
                </Stack>
            </Modal>
        </>
    )
}
