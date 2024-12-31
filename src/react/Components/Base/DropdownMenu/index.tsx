import { ComponentProps, memo, ReactNode, RefObject, useEffect, useReducer, useRef, useState } from "react";
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

    const updatePosition = () => {
        if (containerRef.current && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect()
            const cRect = containerRef.current.getBoundingClientRect()

            console.log('updatePosition', 'ref', anchorRef.current, 'offsetTop', anchorRef.current.offsetTop, 'offsetLeft', anchorRef.current.offsetLeft, 'offsetHeight', anchorRef.current.offsetHeight, 'offsetWidth', anchorRef.current.offsetWidth, 'getBoundingClientRect', anchorRef.current.getBoundingClientRect())

            containerRef.current.style.top = `${rect.bottom}px`
            containerRef.current.style.left = `${rect.left + (rect.width / 2) - (cRect.width / 2)}px`
        }
    }

    useEffect(() => {
        updatePosition()
    }, [display])

    useEffect(() => {
        document.addEventListener('scroll', updatePosition)
        return () => document.removeEventListener('scroll', updatePosition)
    }, [])

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
            {display !== 'none' && children}
        </div>
    )
})
