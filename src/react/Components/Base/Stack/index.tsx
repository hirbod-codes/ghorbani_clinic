import { cn } from '@/src/react/shadcn/lib/utils'
import { ComponentProps, ReactNode, RefObject } from 'react'

export function Stack({ children, direction = 'horizontal', stackProps }: { children?: ReactNode, direction?: 'vertical' | 'horizontal', stackProps?: ComponentProps<'div'>, ref?: RefObject<HTMLDivElement> }) {
    if (direction === 'horizontal')
        return (
            <div {...stackProps} className={cn(['flex flex-row my-1 *:mx-1 first:mx-0'], stackProps?.className)}>
                {children}
            </div>
        )
    else
        return (
            <div {...stackProps} className={cn(['flex flex-col mx-1 *:my-1 first:my-0'], stackProps?.className)}>
                {children}
            </div>
        )
}

