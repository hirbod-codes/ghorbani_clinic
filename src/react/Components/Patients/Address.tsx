import { t } from "i18next";
import { Editor } from "../Editor/Editor";

export type AddressProps = {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    defaultAddress: string;
    defaultCanvas?: string;
    canvasFileName?: string;
    onSave?: (address: string, canvasId?: string) => void | Promise<void>
    onChange?: () => void | Promise<void>
}

export function Address({ open, onClose, defaultAddress, defaultCanvas, canvasFileName, onSave, onChange }: AddressProps) {
    console.log('Address', { open, defaultAddress })

    return (
        <>
            <Editor
                open={open}
                onClose={onClose}
                canvasId={defaultCanvas}
                text={defaultAddress}
                canvasFileName={canvasFileName}
                onChange={onChange}
                onSave={onSave}
                title={t('address')}
            />
        </>
    )
}

