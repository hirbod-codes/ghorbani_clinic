import { cn } from '@/src/react/shadcn/lib/utils'
import { ComponentProps, ReactNode, RefObject } from 'react'

export function Stack({ children, direction = 'horizontal', size = 1, stackProps }: { children?: ReactNode, size?: number, direction?: 'vertical' | 'horizontal', stackProps?: ComponentProps<'div'>, ref?: RefObject<HTMLDivElement> }) {
    // const my = 'my-1 my-2 my-3 my- my-5 my-6 my-7 my-8 my-9 my-10 *:my-1 *:my-2 *:my-3 *:my- *:my-5 *:my-6 *:my-7 *:my-8 *:my-9 *:my-10'
    // const mx = 'mx-1 mx-2 mx-3 mx- mx-5 mx-6 mx-7 mx-8 mx-9 mx-10 *:mx-1 *:mx-2 *:mx-3 *:mx- *:mx-5 *:mx-6 *:mx-7 *:mx-8 *:mx-9 *:mx-10'
    // const mr = 'mr-1 mr-2 mr-3 mr- mr-5 mr-6 mr-7 mr-8 mr-9 mr-10 *:mr-1 *:mr-2 *:mr-3 *:mr- *:mr-5 *:mr-6 *:mr-7 *:mr-8 *:mr-9 *:mr-10'
    // const mb = 'mb-1 mb-2 mb-3 mb- mb-5 mb-6 mb-7 mb-8 mb-9 mb-10 *:mb-1 *:mb-2 *:mb-3 *:mb- *:mb-5 *:mb-6 *:mb-7 *:mb-8 *:mb-9 *:mb-10'
    if (direction === 'horizontal')
        return (
            <div {...stackProps} className={cn([`flex flex-row my-${size} *:mr-${size} last:mr-0`], stackProps?.className)}>
                {children}
            </div>
        )
    else
        return (
            <div {...stackProps} className={cn([`flex flex-col mx-${size} *:mb-${size} last:mb-0`], stackProps?.className)}>
                {children}
            </div>
        )
}

