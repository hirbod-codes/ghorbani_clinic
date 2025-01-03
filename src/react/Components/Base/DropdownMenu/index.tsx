import { ComponentProps, memo, ReactNode, RefObject, useEffect, useReducer, useRef, useState } from "react";
import { usePointerOutside } from "../usePointerOutside";
import { cn } from "@/src/react/shadcn/lib/utils";
import { createPortal } from "react-dom";
import { motion, MotionProps } from 'framer-motion'

export type DropdownMenuProps = {
    children: ReactNode
    anchorRef: RefObject<HTMLElement>
    open?: boolean
    onOpenChange?: (open: boolean) => void
    containerProps?: MotionProps & ComponentProps<'div'>
    verticalPosition?: 'top' | 'center' | 'bottom'
    horizontalPosition?: 'left' | 'center' | 'right'
}

export const DropdownMenu = memo(function DropdownMenu({ children, anchorRef, open = false, onOpenChange, containerProps, verticalPosition = 'bottom', horizontalPosition = 'center' }: DropdownMenuProps) {
    const [display, setDisplay] = useState<string>('none')
    const [opacity, setOpacity] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const updatePosition = () => {
        if (!containerRef.current || !anchorRef.current)
            return

        const aRect = anchorRef.current.getBoundingClientRect()
        const cRect = containerRef.current.getBoundingClientRect()

        // console.log('updatePosition', verticalPosition, horizontalPosition, { visualViewport: window.visualViewport, 'ref': anchorRef.current, 'scrollTop': anchorRef.current.scrollTop, 'offsetTop': anchorRef.current.offsetTop, 'offsetLeft': anchorRef.current.offsetLeft, 'offsetHeight': anchorRef.current.offsetHeight, 'offsetWidth': anchorRef.current.offsetWidth, 'aRect.top': aRect.top, 'aRect.bottom': aRect.bottom, 'aRect.left': aRect.left, 'aRect.right': aRect.right, 'aRect.width': aRect.width, 'aRect.height': aRect.height })
        // console.log('updatePosition', verticalPosition, horizontalPosition, { 'ref': containerRef.current, 'offsetTop': containerRef.current.offsetTop, 'offsetLeft': containerRef.current.offsetLeft, 'offsetHeight': containerRef.current.offsetHeight, 'offsetWidth': containerRef.current.offsetWidth, 'cRect.top': cRect.top, 'cRect.bottom': cRect.bottom, 'cRect.left': cRect.left, 'cRect.right': cRect.right, 'cRect.width': cRect.width, 'cRect.height': cRect.height })

        containerRef.current.style.bottom = ''
        containerRef.current.style.top = ''
        containerRef.current.style.right = ''
        containerRef.current.style.left = ''

        positionElement(containerRef.current, verticalPosition, horizontalPosition, aRect, cRect, window.innerHeight, window.innerWidth)
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
        window.addEventListener('resize', updatePosition)
        return () => window.removeEventListener('resize', updatePosition)
    }, [])

    return createPortal(
        <motion.div
            layout={false}
            // layout='position'
            id="dropdown-container"
            ref={containerRef}
            {...containerProps}
            className={cn(['bg-surface-container absolute z-10 transition-opacity duration-500'], containerProps?.className)}
            style={{ display, opacity }}
            onTransitionEnd={() => {
                if (opacity === 0)
                    setDisplay('none')
            }}
        >
            {display !== 'none' && children}
        </motion.div>
        , document.body
    )
})

function positionElement(element: HTMLElement, verticalPosition: 'top' | 'center' | 'bottom', horizontalPosition: 'left' | 'center' | 'right', anchor: DOMRect, container: DOMRect, screenHeight: number, screenWidth: number, shouldOverlap = false): void {
    switch (verticalPosition) {
        case 'top':
            if (!isTopNegative(anchor, container))
                putTop(element, anchor, container)
            else if (shouldOverlap)
                putAbsoluteTop(element)
            else if (horizontalPosition === 'center')
                if (!isBottomNegative(anchor, container, screenHeight))
                    putBottom(element, anchor)
                else
                    putAbsoluteTop(element)
            else
                putAbsoluteTop(element)
            break;

        case 'center':
            if (shouldOverlap)
                putCenterVertically(element, anchor, container)
            else if (horizontalPosition === 'center')
                throw new Error('horizontalPosition and verticalPosition must not be set to center, when shouldOverlap is set to true.')
            else if (isLeftNegative(anchor, container) && isRightNegative(anchor, container, screenWidth))
                if (!isTopNegative(anchor, container))
                    putTop(element, anchor, container)
                else if (!isBottomNegative(anchor, container, screenHeight))
                    putBottom(element, anchor)
                else
                    putAbsoluteTop(element)
            else if (!isVerticalCenterNegative(anchor, container, screenHeight))
                putCenterVertically(element, anchor, container)
            else if (isVerticalCenterTopNegative(anchor, container))
                putAbsoluteTop(element)
            else if (isVerticalCenterBottomNegative(anchor, container, screenHeight))
                putAbsoluteBottom(element)
            else
                putAbsoluteTop(element)
            break;

        case 'bottom':
            if (!isBottomNegative(anchor, container, screenHeight))
                putBottom(element, anchor)
            else if (shouldOverlap)
                putAbsoluteBottom(element)
            else if (horizontalPosition === 'center')
                if (!isTopNegative(anchor, container))
                    putTop(element, anchor, container)
                else
                    putAbsoluteBottom(element)
            else
                putAbsoluteBottom(element)
            break;

        default:
            throw new Error('Unsupported value for verticalPosition provided, supported values are: top, center, bottom')
    }

    switch (horizontalPosition) {
        case 'left':
            if (!isLeftNegative(anchor, container))
                putLeft(element, anchor, container)
            else if (shouldOverlap)
                putAbsoluteLeft(element)
            else if (verticalPosition === 'center')
                if (!isRightNegative(anchor, container, screenWidth))
                    putRight(element, anchor)
                else
                    putAbsoluteLeft(element)
            else
                putAbsoluteLeft(element)
            break;

        case 'center':
            if (shouldOverlap)
                putCenterHorizontally(element, anchor, container)
            else if (verticalPosition === 'center')
                throw new Error('horizontalPosition and verticalPosition must not be set to center, when shouldOverlap is set to true.')
            else if (isTopNegative(anchor, container) && isBottomNegative(anchor, container, screenWidth))
                if (!isLeftNegative(anchor, container))
                    putLeft(element, anchor, container)
                else if (!isRightNegative(anchor, container, screenHeight))
                    putRight(element, anchor)
                else
                    putAbsoluteLeft(element)
            else if (!isHorizontalCenterNegative(anchor, container, screenWidth))
                putCenterHorizontally(element, anchor, container)
            else if (isHorizontalCenterLeftNegative(anchor, container))
                putAbsoluteLeft(element)
            else if (isHorizontalCenterRightNegative(anchor, container, screenWidth))
                putAbsoluteRight(element)
            else
                putAbsoluteLeft(element)
            break;

        case 'right':
            if (!isRightNegative(anchor, container, screenWidth))
                putRight(element, anchor)
            else if (shouldOverlap)
                putAbsoluteRight(element)
            else if (verticalPosition === 'center')
                if (!isLeftNegative(anchor, container))
                    putLeft(element, anchor, container)
                else
                    putAbsoluteRight(element)
            else
                putAbsoluteRight(element)
            break;

        default:
            throw new Error('Unsupported value for horizontalPosition provided, supported values are: left, center, right')
    }
}

function isTopNegative(anchor: DOMRect, container: DOMRect): boolean {
    return anchor.top - container.height < 0
}

function isLeftNegative(anchor: DOMRect, container: DOMRect): boolean {
    return anchor.left - container.width < 0
}

function isBottomNegative(anchor: DOMRect, container: DOMRect, screenHeight: number): boolean {
    return anchor.top + anchor.height + container.height > screenHeight
}

function isRightNegative(anchor: DOMRect, container: DOMRect, screenWidth: number): boolean {
    return anchor.left + anchor.width + container.width > screenWidth
}

function isVerticalCenterNegative(anchor: DOMRect, container: DOMRect, screenHeight: number): boolean {
    return isVerticalCenterTopNegative(anchor, container) || isVerticalCenterBottomNegative(anchor, container, screenHeight)
}

function isVerticalCenterTopNegative(anchor: DOMRect, container: DOMRect): boolean {
    return anchor.top + (anchor.height / 2) - (container.height / 2) < 0
}

function isVerticalCenterBottomNegative(anchor: DOMRect, container: DOMRect, screenHeight: number): boolean {
    return (anchor.top + (anchor.height / 2) - (container.height / 2) + container.height) > screenHeight
}

function isHorizontalCenterNegative(anchor: DOMRect, container: DOMRect, screenWidth: number): boolean {
    return isHorizontalCenterLeftNegative(anchor, container) || isHorizontalCenterRightNegative(anchor, container, screenWidth)
}

function isHorizontalCenterRightNegative(anchor: DOMRect, container: DOMRect, screenWidth: number): boolean {
    return (anchor.left + (anchor.width / 2) + (container.width / 2)) > screenWidth
}

function isHorizontalCenterLeftNegative(anchor: DOMRect, container: DOMRect): boolean {
    return (anchor.left + (anchor.width / 2) - (container.width / 2)) < 0
}

function putAbsoluteTop(containerElement: HTMLElement, margin = 0): void {
    containerElement.style.top = `${margin.toFixed(0)}px`
}

function putAbsoluteRight(containerElement: HTMLElement, margin = 0): void {
    containerElement.style.right = `${margin.toFixed(0)}px`
}

function putAbsoluteBottom(containerElement: HTMLElement, margin = 0): void {
    containerElement.style.bottom = `${margin.toFixed(0)}px`
}

function putAbsoluteLeft(containerElement: HTMLElement, margin = 0): void {
    containerElement.style.left = `${margin.toFixed(0)}px`
}

function putTop(containerElement: HTMLElement, anchor: DOMRect, container: DOMRect): void {
    containerElement.style.top = `${anchor.top - container.height}px`
}

function putRight(containerElement: HTMLElement, anchor: DOMRect): void {
    containerElement.style.left = `${anchor.left + anchor.width}px`
}

function putBottom(containerElement: HTMLElement, anchor: DOMRect): void {
    containerElement.style.top = `${anchor.top + anchor.height}px`
}

function putLeft(containerElement: HTMLElement, anchor: DOMRect, container: DOMRect): void {
    containerElement.style.left = `${anchor.left - container.width}px`
}

function putCenterHorizontally(containerElement: HTMLElement, anchor: DOMRect, container: DOMRect): void {
    containerElement.style.left = `${anchor.left + (anchor.width / 2) - (container.width / 2)}px`
}

function putCenterVertically(containerElement: HTMLElement, anchor: DOMRect, container: DOMRect): void {
    containerElement.style.top = `${anchor.top + (anchor.height / 2) - (container.height / 2)}px`
}
