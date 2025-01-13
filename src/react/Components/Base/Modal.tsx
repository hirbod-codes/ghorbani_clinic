import { ComponentProps, ReactNode, RefObject, useEffect, useRef } from "react"
import { AnimatedSlide } from "../Animations/AnimatedSlide"
import { usePointerOutside } from "./usePointerOutside"
import { Button } from "./Button"
import { XIcon } from "lucide-react"
import { cn } from "../../shadcn/lib/utils"
import { Container } from "./Container"
import { createPortal } from "react-dom"
import { variants } from "../Animations/AnimatedSlide/variants"

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

    // useEffect(() => {
    //     function handleClickOutside(e) {
    //         e.preventDefault()
    //         e.stopPropagation()

    //         if (!containerRef || !containerRef?.current || !onClose)
    //             return

    //         const d = containerRef.current.getBoundingClientRect()

    //         console.log(containerRef.current, e.target, e.currentTarget, d, e.clientX, e.clientY, e.clientX < d.left || e.clientX > d.right || e.clientY < d.top || e.clientY > d.bottom)

    //         if (e.clientX < d.left || e.clientX > d.right || e.clientY < d.top || e.clientY > d.bottom)
    //             onClose()
    //     }

    //     document.body.addEventListener("pointerdown", handleClickOutside);

    //     return () => {
    //         document.body.removeEventListener("pointerdown", handleClickOutside);
    //     };
    // }, [containerRef, containerRef?.current]);

    let i = 0
    for (const child of document.body.children) {
        if (child.id !== 'modal')
            continue
        else
            i++
    }

    console.log({ i })

    closeIcon = closeIcon ?? <XIcon className="text-error" />

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
                        className: cn("size-50 absolute top-0 left-0 h-screen w-screen", animatedSlideProps?.motionDivProps?.className),
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

                <Container
                    {...modalContainerProps}
                    containerRef={containerRef}
                    className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[80%] overflow-auto", modalContainerProps?.className)}
                    style={{ zIndex: 22 + i, ...modalContainerProps?.style }}
                >
                    <div ref={childrenContainerRef} {...childrenContainerProps} className={cn("bg-surface-container rounded py-4 px-10", childrenContainerProps?.className)}>
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
