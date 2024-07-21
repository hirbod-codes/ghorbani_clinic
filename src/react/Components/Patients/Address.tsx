import { t } from "i18next";
import { TextEditorModal } from '../TextEditor/TextEditorModal';

export function Address({ open, onClose, defaultAddress, defaultCanvas, canvasFileName, onChange }: { open: boolean, onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void, defaultAddress: string; defaultCanvas?: string; canvasFileName?: string; onChange?: (address: string, canvasId?: string) => void | Promise<void> }) {
    console.log('Address', { open, onClose, defaultAddress, onChange })

    return (
        <>
            <TextEditorModal
                open={open}
                onClose={onClose}
                defaultCanvas={defaultCanvas}
                defaultContent={defaultAddress}
                canvasFileName={canvasFileName}
                onChange={onChange}
                title={t('address')}
            />
        </>
    )
}

