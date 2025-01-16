import { cn } from '@/src/react/shadcn/lib/utils'
import { ComponentProps, ReactNode, RefObject } from 'react'

export function Stack({ children, direction = 'horizontal', stackProps }: { children?: ReactNode, direction?: 'vertical' | 'horizontal', stackProps?: ComponentProps<'div'>, ref?: RefObject<HTMLDivElement> }) {
    if (direction === 'horizontal')
        return (
            <div {...stackProps} className={cn(['flex flex-row my-1 *:mr-1 last:mr-0'], stackProps?.className)}>
                {children}
            </div>
        )
    else
        return (
            <div {...stackProps} className={cn(['flex flex-col mx-1 *:mb-1 last:mb-0'], stackProps?.className)}>
                {children}
            </div>
        )
}

