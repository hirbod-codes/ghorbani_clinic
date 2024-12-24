import { ComponentProps, ReactNode, useEffect, useRef, useState } from "react"
import { AnimatedSlide } from "../Animations/AnimatedSlide"
import { usePointerOutside } from "./PointerOutside"
import { Button } from "./Button"
import { XIcon } from "lucide-react"
import { cn } from "../../shadcn/lib/utils"
import { Container } from "./Container"

export type ModalProps = {
    children?: ReactNode
    open?: boolean,
    onClose?: () => void,
    containerProps?: ComponentProps<'div'>,
    closeButton?: boolean,
    closeIcon?: ReactNode
}

export function Modal({ children, open = false, onClose, containerProps, closeButton = true, closeIcon }: ModalProps) {
    closeIcon = closeIcon ?? <XIcon className="text-destructive" />
    const ref = useRef(null)

    usePointerOutside(ref, (outside) => {
        if (outside && onClose)
            onClose()
    }, [open])

    return (
        <>
            {open && <div className="h-screen w-screen overflow-hidden absolute top-0 left-0 bg-[black] opacity-70" />}

            <AnimatedSlide open={open} {...containerProps}>
                <Container containerRef={ref} {...containerProps} className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded p-4", containerProps?.className)}>
                    {closeButton &&
                        <Button size='icon' className="absolute right-0 top-0 m-2 bg-transparent" onClick={() => { if (onClose) onClose() }}>
                            {closeIcon}
                        </Button>
                    }
                    {children}
                </Container>
            </AnimatedSlide>
        </>
    )
}

