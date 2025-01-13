import { ComponentProps, ReactNode, RefObject, useEffect, useRef } from "react"
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
    modalContainerProps?: ComponentProps<'div'>
    childrenContainerProps?: ComponentProps<'div'>
    childrenContainerRef?: RefObject<HTMLDivElement>
    closeButton?: boolean,
    closeIcon?: ReactNode
}

export function Modal({ children, open = false, onClose, modalContainerProps, childrenContainerProps, childrenContainerRef, animatedSlideProps, closeButton = true, closeIcon }: ModalProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    closeIcon = closeIcon ?? <XIcon className="text-destructive" />

    usePointerOutside(containerRef, (outside) => {
        if (outside && onClose)
            onClose()
    }, [open])

    useEffect(() => {
        function handleClickOutside(e) {
            e.preventDefault()
            e.stopPropagation()

            if (!containerRef || !containerRef?.current || !onClose)
                return

            const d = containerRef.current.getBoundingClientRect()

            console.log(containerRef.current, e.target, e.currentTarget, d, e.clientX, e.clientY, e.clientX < d.left || e.clientX > d.right || e.clientY < d.top || e.clientY > d.bottom)

            if (e.clientX < d.left || e.clientX > d.right || e.clientY < d.top || e.clientY > d.bottom)
                onClose()
        }

        document.body.addEventListener("pointerdown", handleClickOutside);

        return () => {
            document.body.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [containerRef, containerRef?.current]);

    return createPortal(
        <>
            {open && <div className="h-screen w-screen overflow-hidden absolute top-0 left-0 bg-[black] opacity-70 my-12" />}

            <AnimatedSlide
                motionKey={open.toString()}
                open={open}
                layout={true}
                {...{ ...animatedSlideProps, motionDivProps: { ...animatedSlideProps?.motionDivProps, className: cn("absolute top-0 left-0 h-screen w-screen z-20", animatedSlideProps?.motionDivProps?.className) } }}
            >
                <Container containerRef={containerRef} {...modalContainerProps} className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", modalContainerProps?.className)}>
                    <div ref={childrenContainerRef} {...childrenContainerProps} className={cn("bg-surface-container rounded py-4 px-10 size-full absolute top-0 left-0", childrenContainerProps?.className)}>
                        {children}
                    </div>

                    {closeButton &&
                        <Button isIcon variant='text' fgColor='error' className="absolute right-0 top-0 m-2" onClick={() => { if (onClose) onClose() }}>
                            {closeIcon}
                        </Button>
                    }
                </Container>
            </AnimatedSlide>
        </>
        , document.body
    )
}
