import { ComponentProps, memo, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { usePointerOutside } from "../usePointerOutside";
import { cn } from "@/src/react/shadcn/lib/utils";

export type DropdownMenuProps = {
    children: ReactNode
    anchorRef: RefObject<HTMLElement>
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
    containerProps?: ComponentProps<'div'>
}

export const DropdownMenu = memo(function DropdownMenu({ children, anchorRef, open: controlledOpen, onOpenChange, defaultOpen, containerProps }: DropdownMenuProps) {
    const [display, setDisplay] = useState<string>('none')
    const [opacity, setOpacity] = useState<number>(0)
    const [open, setOpen] = useState<boolean>(defaultOpen ?? false)
    const containerRef = useRef<HTMLDivElement>(null)

    console.log('DropdownMenu', { open, container: containerRef.current, display, opacity, controlledOpen, anchor: anchorRef.current })

    usePointerOutside(containerRef, (isOutside) => {
        if (isOutside)
            setOpen(false)
    })

    useEffect(() => {
        if (containerRef.current) {
            if (open)
                setDisplay('block')
            else
                setOpacity(0)
        }

        if (onOpenChange)
            onOpenChange(open)
    }, [open])

    useEffect(() => {
        setOpen(controlledOpen ?? false)
    }, [controlledOpen])

    useEffect(() => {
        if (display === 'block')
            setTimeout(() => { setOpacity(1) }, 1)
    }, [display])

    useEffect(() => {
        if (containerRef.current && anchorRef.current) {
            containerRef.current.style.top = `${anchorRef.current.offsetTop + anchorRef.current.offsetHeight}px`
            containerRef.current.style.left = `${anchorRef.current.offsetLeft + (anchorRef.current.offsetWidth / 2) - (containerRef.current.clientWidth / 2)}px`
        }
    }, [display])

    return (
        <div
            id="dropdown-container"
            ref={containerRef}
            {...containerProps}
            className={cn(['absolute z-10 transition-opacity duration-500'], containerProps?.className)}
            style={{ display, opacity }}
            onTransitionEnd={() => {
                if (opacity === 0)
                    setDisplay('none')
            }}
        >
            {children}
        </div>
    )
})
