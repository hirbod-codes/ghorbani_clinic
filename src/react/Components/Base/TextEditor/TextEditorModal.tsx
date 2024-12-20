import { useContext, useEffect, useState } from "react";
import { TextEditor, TextEditorProps } from './TextEditor';
import { t } from "i18next";
import { Modal } from "../Modal";
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { Button } from "@/src/react/shadcn/components/ui/button";
import { ConfigurationContext } from "@/src/react/Contexts/Configuration/ConfigurationContext";
import { SaveIcon } from "../../Icons/SaveIcon";

export type TextEditorModalProps = TextEditorProps & {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    onChange: () => void | Promise<void>;
    onSave: (text?: string) => void | Promise<void>;
}

export function TextEditorModal({ open, onClose, onSave: onChange, onSave, placeholder, text: inputText }: TextEditorModalProps) {
    const themeOptions = useContext(ConfigurationContext)!.themeOptions

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
                onClose={() => {
                    if (hasUnsavedChanges)
                        setDialog({
                            open: true,
                            title: t('TextEditorModal.exiting'),
                            content: t('TextEditorModal.areYouSure?YouHaveUnsavedChanges'),
                        })
                    else if (onClose)
                        onClose(dialog.e, dialog.r)
                }}
                open={open}
            >
                <div className="w-10/2 h-5/6 py-1 px-2 overflow-auto">
                    <div className="flex flex-col w-full h-full">
                        <Button
                            size='icon'
                            onClick={async () => {
                                if (onSave)
                                    await onSave(text)
                                setHasUnsavedChanges(false)
                            }}
                            color={hasUnsavedChanges ? themeOptions.colors.accent : themeOptions.colors.primary}
                        >
                            <SaveIcon />
                        </Button>

                        <Separator />

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
                    </div>
                </div>
            </Modal>

            <Modal
                open={dialog.open}
                onClose={() => {
                    if (onClose)
                        onClose(dialog.e, dialog.r)
                    closeDialog()
                }}
                title={dialog.title}
            >
                {dialog.content}
            </Modal>
        </>
    )
}

