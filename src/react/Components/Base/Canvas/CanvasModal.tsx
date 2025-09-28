import { Canvas } from ".";
import { Modal } from "../Modal";
import { IShape } from "./Shapes/IShape";

export function CanvasModal({ open, onClose, title, defaultContent, onChange }: { open: boolean; onClose?: () => void; title?: string; defaultContent?: string | undefined; onChange?: (shapes: IShape[], empty?: boolean) => void | Promise<void> }) {
    console.log('CanvasModal', { open, onClose, title, defaultContent, onChange })

    return (
        <>
            <Modal
                onClose={onClose}
                open={open}
            >
                <div className='w-10/12 h-5/6 px-1 py-2 overflow-auto'>
                    <Canvas onChange={onChange} />
                </div>
            </Modal>
        </>
    )
}

