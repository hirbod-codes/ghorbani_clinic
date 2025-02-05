import { ComponentProps, ReactNode, RefObject, useEffect, useRef } from "react"
import { AnimatedSlide } from "../Animations/AnimatedSlide"
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
    useResponsiveContainer?: boolean
    childrenContainerProps?: ComponentProps<'div'>
    childrenContainerRef?: RefObject<HTMLDivElement>
    closeButton?: boolean,
    closeIcon?: ReactNode
}

export function Modal({ children, open = false, onClose, useResponsiveContainer = true, modalContainerProps, childrenContainerProps, childrenContainerRef, animatedSlideProps, closeButton = true, closeIcon }: ModalProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    let i = 0
    for (const child of document.body.children) {
        if (child.id !== 'modal')
            continue
        else
            i++
    }

    closeIcon = closeIcon ?? <XIcon className="text-error" />

    let ModalContainer
    if (useResponsiveContainer)
        ModalContainer = ({ children }: { children?: ReactNode }) =>
            <Container
                {...modalContainerProps}
                containerRef={containerRef}
                className={cn("relative max-h-[80%]", modalContainerProps?.className)}
                style={{ zIndex: 22 + i, ...modalContainerProps?.style }}
            >
                {children}
            </Container>
    else
        ModalContainer = ({ children }: { children?: ReactNode }) =>
            <div
                {...modalContainerProps}
                ref={containerRef}
                className={cn("relative max-h-[80%]", modalContainerProps?.className)}
                style={{ zIndex: 22 + i, ...modalContainerProps?.style }}
            >
                {children}
            </div>

    return createPortal(
        <>
            <AnimatedSlide
                motionKey={open.toString()}
                open={open}
                layout={true}
                {...{
                    ...animatedSlideProps,
                    motionDivProps: {
                        ...animatedSlideProps?.motionDivProps,
                        id: 'modal',
                        className: cn("absolute top-0 left-0 h-screen w-screen flex flex-col justify-center items-center", animatedSlideProps?.motionDivProps?.className),
                        style: { ...animatedSlideProps?.motionDivProps?.style, zIndex: 20 + i },
                    }
                }}
            >
                {open &&
                    <div
                        id='modalScreen'
                        className="h-screen w-screen overflow-hidden absolute top-0 left-0 bg-[black] my-12 opacity-70"
                        onClick={() => { if (onClose) onClose() }}
                        style={{ zIndex: 21 + i }}
                    />}

                <ModalContainer>
                    <div ref={childrenContainerRef} {...childrenContainerProps} className={cn("bg-surface-container overflow-auto rounded py-4 px-10 size-full", childrenContainerProps?.className)}>
                        {children}
                    </div>

                    {closeButton &&
                        <Button isIcon variant='text' fgColor='error' className="absolute right-0 top-0 m-2" onClick={() => { if (onClose) onClose() }}>
                            {closeIcon}
                        </Button>
                    }
                </ModalContainer>
            </AnimatedSlide>
        </>
        , document.body
    )
}
