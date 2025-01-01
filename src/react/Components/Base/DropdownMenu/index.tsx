import { ComponentProps, memo, ReactNode, RefObject, useEffect, useReducer, useRef, useState } from "react";
import { usePointerOutside } from "../usePointerOutside";
import { cn } from "@/src/react/shadcn/lib/utils";
import { createPortal } from "react-dom";

export type DropdownMenuProps = {
    children: ReactNode
    anchorRef: RefObject<HTMLElement>
    open?: boolean
    onOpenChange?: (open: boolean) => void
    containerProps?: ComponentProps<'div'>
}

export const DropdownMenu = memo(function DropdownMenu({ children, anchorRef, open = false, onOpenChange, containerProps }: DropdownMenuProps) {
    const [display, setDisplay] = useState<string>('none')
    const [opacity, setOpacity] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const updatePosition = () => {
        if (!containerRef.current || !anchorRef.current)
            return

        const aRect = anchorRef.current.getBoundingClientRect()
        const cRect = containerRef.current.getBoundingClientRect()

        let height = window.innerHeight
        let width = window.innerWidth

        console.log('updatePosition', { width }, { visualViewport: window.visualViewport, 'ref': anchorRef.current, 'scrollTop': anchorRef.current.scrollTop, 'offsetTop': anchorRef.current.offsetTop, 'offsetLeft': anchorRef.current.offsetLeft, 'offsetHeight': anchorRef.current.offsetHeight, 'offsetWidth': anchorRef.current.offsetWidth, 'aRect.top': aRect.top, 'aRect.bottom': aRect.bottom, 'aRect.left': aRect.left, 'aRect.right': aRect.right, 'aRect.width': aRect.width, 'aRect.height': aRect.height })
        console.log('updatePosition', { height }, { 'ref': containerRef.current, 'offsetTop': containerRef.current.offsetTop, 'offsetLeft': containerRef.current.offsetLeft, 'offsetHeight': containerRef.current.offsetHeight, 'offsetWidth': containerRef.current.offsetWidth, 'cRect.top': cRect.top, 'cRect.bottom': cRect.bottom, 'cRect.left': cRect.left, 'cRect.right': cRect.right, 'cRect.width': cRect.width, 'cRect.height': cRect.height })

        containerRef.current.style.bottom = ''
        containerRef.current.style.top = ''
        containerRef.current.style.right = ''
        containerRef.current.style.left = ''

        if ((aRect.top + aRect.height + cRect.height) > height)
            containerRef.current.style.bottom = '10px'
        else
            containerRef.current.style.top = `${(aRect.top + aRect.height)}px`

        if ((aRect.left + (aRect.width / 2) + (cRect.width / 2)) > width)
            containerRef.current.style.right = '10px'
        else
            containerRef.current.style.left = `${Math.max(0, aRect.left + (aRect.width / 2) - (cRect.width / 2))}px`
    }

    usePointerOutside(containerRef, (isOutside) => {
        if (isOutside && onOpenChange)
            onOpenChange(false)
    })

    useEffect(() => {
        updatePosition()

        if (containerRef.current) {
            if (open)
                setDisplay('block')
            else
                setOpacity(0)
        }

        if (onOpenChange)
            onOpenChange(open)
    }, [open, display, anchorRef.current, containerRef.current])

    useEffect(() => {
        if (display === 'block')
            setTimeout(() => { setOpacity(1) }, 1)
    }, [display])

    useEffect(() => {
        updatePosition()
    }, [])

    return createPortal(
        <div
            id="dropdown-container"
            ref={containerRef}
            {...containerProps}
            className={cn(['bg-background absolute z-10 transition-opacity duration-500'], containerProps?.className)}
            style={{ display, opacity }}
            onTransitionEnd={() => {
                if (opacity === 0)
                    setDisplay('none')
            }}
        >
            {display !== 'none' && children}
        </div>
        , document.body
    )
})
