import { Button as ShadcnButton } from "@/src/react/shadcn/components/ui/button";
import { cn } from "@/src/react/shadcn/lib/utils";
import { ComponentProps, memo, MouseEvent, ReactNode } from "react";
import { ripple } from "../helpers";

export const Button = memo(function Button({ children, rippleEffect = true, ...props }: { children?: ReactNode, rippleEffect?: boolean } & ComponentProps<typeof ShadcnButton>) {
    return (
        <ShadcnButton
            {...props}
            className={cn(['overflow-hidden relative'], props?.className)}
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

