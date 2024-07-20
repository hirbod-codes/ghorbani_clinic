import { useState } from 'react'
import { t } from "i18next";
import { TextEditorModal } from '../TextEditor/TextEditorModal';

export function Address({ open, onClose, defaultAddress, defaultCanvas, onChange }: { open: boolean, onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void, defaultAddress: string; defaultCanvas?: string; onChange?: (address: string, canvasId?: string) => void | Promise<void> }) {
    console.log('Address', { open, onClose, defaultAddress, onChange })

    return (
        <>
            <TextEditorModal
                open={open}
                onClose={onClose}
                defaultCanvas={defaultCanvas}
                defaultContent={defaultAddress}
                onChange={onChange}
                title={t('address')}
            />
        </>
    )
}

