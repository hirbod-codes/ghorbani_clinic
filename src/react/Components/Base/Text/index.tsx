import { cn } from "@/src/react/shadcn/lib/utils";
import { ComponentProps, ReactNode } from "react";

export function Text({ children, ...props }: { children?: ReactNode } & ComponentProps<'div'>) {
    return (
        <div {...props} className={cn(["text-nowrap text-ellipsis overflow-hidden size-full"], props?.className)}>
            {children}
        </div>
    )
}
