import { cn } from '@/src/react/shadcn/lib/utils'
import { ComponentProps, ReactNode, RefObject } from 'react'

export function Stack({ children, direction = 'horizontal', size = 1, stackProps }: { children?: ReactNode, size?: number, direction?: 'vertical' | 'horizontal', stackProps?: ComponentProps<'div'>, ref?: RefObject<HTMLDivElement> }) {
    // const my = 'my-1 my-2 my-3 my- my-5 my-6 my-7 my-8 my-9 my-10 not-last:my-1 not-last:my-2 not-last:my-3 not-last:my- not-last:my-5 not-last:my-6 not-last:my-7 not-last:my-8 not-last:my-9 not-last:my-10'
    // const mx = 'mx-1 mx-2 mx-3 mx- mx-5 mx-6 mx-7 mx-8 mx-9 mx-10 not-last:mx-1 not-last:mx-2 not-last:mx-3 not-last:mx- not-last:mx-5 not-last:mx-6 not-last:mx-7 not-last:mx-8 not-last:mx-9 not-last:mx-10'
    // const mr = 'mr-1 mr-2 mr-3 mr- mr-5 mr-6 mr-7 mr-8 mr-9 mr-10 not-last:mr-1 not-last:mr-2 not-last:mr-3 not-last:mr- not-last:mr-5 not-last:mr-6 not-last:mr-7 not-last:mr-8 not-last:mr-9 not-last:mr-10'
    // const mb = 'mb-1 mb-2 mb-3 mb- mb-5 mb-6 mb-7 mb-8 mb-9 mb-10 not-last:mb-1 not-last:mb-2 not-last:mb-3 not-last:mb- not-last:mb-5 not-last:mb-6 not-last:mb-7 not-last:mb-8 not-last:mb-9 not-last:mb-10'
    if (direction === 'horizontal')
        return (
            <div {...stackProps} className={cn([`flex flex-row ltr:[&>:not(:last-child)]:mr-3 rtl:[&>:not(:first-child)]:mr-3`], stackProps?.className)}>
                {children}
            </div>
        )
    else
        return (
            <div {...stackProps} className={cn([`flex flex-col [&>:not(:last-child)]:mb-3`], stackProps?.className)}>
                {children}
            </div>
        )
}

