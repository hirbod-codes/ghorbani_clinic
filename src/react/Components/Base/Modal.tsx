import { ReactNode, useState } from "react"
import {
    Dialog as ShadcnDialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/src/react/shadcn/components/ui/dialog"


export type ModalProps = {
    children?: ReactNode
    trigger?: ReactNode
    open?: boolean
    title?: string
    description?: string
    footer?: ReactNode
    onClose?: () => void
}

export function Modal({ children, trigger, open: openInput = true, title, description, footer, onClose }: ModalProps) {
    const [open, setOpen] = useState<boolean>(openInput)

    return (
        <ShadcnDialog open={open} onOpenChange={() => { setOpen(false); if (onClose) onClose() }} >
            <DialogTrigger>{trigger}</DialogTrigger>
            <DialogContent>
                {title &&
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                }
                {children}
                {footer && <DialogFooter className="sm:justify-start">
                    {footer}
                </DialogFooter>
                }
            </DialogContent>
        </ShadcnDialog>
    )
}

