import { Modal as MuiModal, Paper, Slide } from "@mui/material"
import { ReactNode } from "react"

export type ModalProps = {
    children?: ReactNode;
    open: boolean
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void | Promise<void>;
    paperProps?: any;
    closeAfterTransition?: boolean;
    disableAutoFocus?: boolean;
    timeout?: number
}

export function Modal({
    children,
    open,
    onClose,
    paperProps = {
        sx: {
            width: '80%',
            height: '90%',
            padding: '0.5rem 1rem',
            overflow: 'auto'
        }
    },
    closeAfterTransition = true,
    disableAutoFocus = true,
    timeout = 250
}: ModalProps) {
    if (!paperProps)
        paperProps = {
            sx: {
                width: '80%',
                height: '90%',
                padding: '0.5rem 1rem',
                overflow: 'auto'
            }
        }

    return (
        <MuiModal
            onClose={(e, r) => {
                if (onClose)
                    onClose(e, r)
            }}
            open={open}
            closeAfterTransition={closeAfterTransition}
            disableAutoFocus={disableAutoFocus}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
            slotProps={{ backdrop: { sx: { top: '2rem' } } }}
        >
            <Slide direction={open ? 'up' : 'down'} in={open} timeout={timeout}>
                <Paper {...paperProps}>
                    {children}
                </Paper>
            </Slide>
        </MuiModal>
    )
}

