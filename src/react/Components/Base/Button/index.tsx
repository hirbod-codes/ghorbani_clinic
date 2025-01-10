import { Button as ShadcnButton } from "@/src/react/shadcn/components/ui/button";
import { cn } from "@/src/react/shadcn/lib/utils";
import { ComponentProps, CSSProperties, HTMLAttributes, memo, MouseEvent, ReactNode } from "react";
import { ripple } from "../helpers";
import { ThemeOptions } from "@/src/Electron/Configuration/renderer.d";

export const Buttona = memo(function Button({ children, rippleEffect = true, ...props }: { children?: ReactNode, rippleEffect?: boolean } & ComponentProps<typeof ShadcnButton>) {
    return (
        <ShadcnButton
            {...props}
            className={cn(['overflow-hidden relative bg-primary text-primary-foreground'], props?.className)}
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                if (rippleEffect)
                    ripple(e)
                if (props.onClick)
                    props.onClick(e)
            }}
        >
            <div className="absolute size-full top-0 left-0 bg-white opacity-0 transition-opacity duration-50 hover:opacity-10" style={{ borderRadius: 'inherit' }} />
            {children}
        </ShadcnButton>
    )
})

export type ButtonProps = {
    children?: ReactNode
    rippleEffect?: boolean
    variant?: 'outline' | 'contained' | 'text'
    color?: 'primary' | 'secondary' | 'tertiary' | 'surface' | 'outline' | 'info' | 'success' | 'warning' | 'error'
    size?: 'xl' | 'lg' | 'md' | 'sm' | 'xs'
    isIcon?: boolean
} & ComponentProps<'button'>

export const Button = memo(function Button({ children, rippleEffect = true, variant = 'contained', color = 'primary', size = 'md', isIcon = false, ...buttonProps }: ButtonProps) {
    let style: CSSProperties = {}
    let className: HTMLAttributes<HTMLButtonElement>['className'] = 'overflow-hidden relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
    switch (variant) {
        case 'contained':
            className += ` border-0 bg-${color} text-${color}-foreground`
            style.color = `hsl(var(--${color}-foreground))`
            style.backgroundColor = `hsl(var(--${color}))`
            break;

        case 'outline':
            className += ` border bg-transparent`
            style.color = `hsl(var(--${color}))`
            style.borderColor = `hsl(var(--${color}))`
            break;

        case 'text':
            className += ` border-0 bg-transparent`
            style.color = `hsl(var(--${color}))`
            style.borderColor = `hsl(var(--${color}))`
            break;

        default:
            break;
    }

    switch (size) {
        case 'xl':
            className += ` h-16 ${isIcon ? 'w-16' : ''} ${isIcon ? 'rounded-[50%]' : 'rounded-lg'} py-6 px-8 text-xl`
            break;
        case 'lg':
            className += ` h-14 ${isIcon ? 'w-14' : ''} ${isIcon ? 'rounded-[50%]' : 'rounded-lg'} py-4 px-6 text-lg`
            break;
        case 'md':
            className += ` h-11 ${isIcon ? 'w-11' : ''} ${isIcon ? 'rounded-[50%]' : 'rounded-md'} py-2 px-4 text-md`
            break;
        case 'sm':
            className += ` h-8 ${isIcon ? 'w-8' : ''} ${isIcon ? 'rounded-[50%]' : 'rounded-sm'} py-1.5 px-4 text-xs`
            break;
        case 'xs':
            className += ` h-6 ${isIcon ? 'w-6' : ''} ${isIcon ? 'rounded-[50%]' : 'rounded-sm'} py-0.5 px-2 text-xs`
            break;

        default:
            break;
    }

    className = cn(className, buttonProps?.className)
    style = { ...style, ...buttonProps?.style }

    return (
        <button
            {...buttonProps}
            className={className}
            style={style}
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                if (rippleEffect)
                    ripple(e)
                if (buttonProps?.onClick)
                    buttonProps.onClick(e)
            }}
        >
            <div className="absolute size-full top-0 left-0 bg-white opacity-0 transition-opacity duration-50 hover:opacity-10" style={{ borderRadius: 'inherit' }} />
            {children}
        </button>
    )
})

