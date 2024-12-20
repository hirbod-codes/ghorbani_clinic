import { Canvas } from ".";
import { Modal } from "../Modal";

export function CanvasModal({ open, onClose, title, defaultContent, onChange }: { open: boolean; onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void; title?: string; defaultContent?: string | undefined; onChange?: (content: string) => void | Promise<void> }) {
    console.log('CanvasModal', { open, onClose, title, defaultContent, onChange })

    return (
        <>
            <Modal
                onClose={onClose}
                open={open}
                closeAfterTransition
                disableAutoFocus
            >
                <div className='w-10/12 h-5/6 px-1 py-2 overflow-auto'>
                    <Canvas />
                </div>
            </Modal>
        </>
    )
}

