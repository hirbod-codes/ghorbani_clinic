import { ComponentProps, ReactNode, RefObject, useRef } from "react"
import { AnimatedSlide } from "../Animations/AnimatedSlide"
import { usePointerOutside } from "./usePointerOutside"
import { Button } from "./Button"
import { XIcon } from "lucide-react"
import { cn } from "../../shadcn/lib/utils"
import { Container } from "./Container"
import { createPortal } from "react-dom"

export type ModalProps = {
    children?: ReactNode
    open?: boolean,
    onClose?: () => void,
    animatedSlideProps?: ComponentProps<typeof AnimatedSlide>,
    containerProps?: ComponentProps<'div'>,
    closeButton?: boolean,
    closeIcon?: ReactNode
}

export function Modal({ children, open = false, onClose, containerProps, animatedSlideProps, closeButton = true, closeIcon }: ModalProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    closeIcon = closeIcon ?? <XIcon className="text-destructive" />

    usePointerOutside(containerRef, (outside) => {
        if (outside && onClose)
            onClose()
    }, [open])

    return createPortal(
        <>
            {open && <div className="h-screen w-screen overflow-hidden absolute top-0 left-0 bg-[black] opacity-70 my-12" />}

            <AnimatedSlide
                motionKey={open.toString()}
                open={open}
                layout={true}
                {...{ ...animatedSlideProps, motionDivProps: { ...animatedSlideProps?.motionDivProps, className: cn("absolute top-0 left-0 h-screen w-screen z-10", animatedSlideProps?.motionDivProps?.className) } }}
            >
                <Container containerRef={containerRef} {...containerProps} className={cn("bg-surface-container rounded py-4 px-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", containerProps?.className)}>
                    {closeButton &&
                        <Button isIcon variant='text' color='error' className="absolute right-0 top-0 m-2" onClick={() => { if (onClose) onClose() }}>
                            {closeIcon}
                        </Button>
                    }
                    {children}
                </Container>
            </AnimatedSlide>
        </>
        , document.body
    )
}
