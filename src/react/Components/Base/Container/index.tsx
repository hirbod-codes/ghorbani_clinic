import { cn } from '@/src/react/shadcn/lib/utils'
import { ComponentProps, ReactNode, RefObject } from 'react'

export function Container({ children, containerRef, layout = false, ...props }: { children?: ReactNode, containerRef?: RefObject<HTMLDivElement>, layout?: boolean | "position" | "size" | "preserve-aspect" | undefined } & ComponentProps<'div'>) {
    return (
        <div ref={containerRef} className={cn(['lg:w-6/12 md:w-8/12 sm:w-10/12 w-11/12'], props?.className)}>
            {children}
        </div>
    )
}
