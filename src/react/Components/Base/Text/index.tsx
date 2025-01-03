import { cn } from "@/src/react/shadcn/lib/utils";
import { ComponentProps, ReactNode } from "react";
import { Tooltip } from "../Tooltip";

export function Text({ children, ...props }: { children?: ReactNode } & ComponentProps<'div'>) {
    return (
        <div {...props}>
            <Tooltip tooltipContent={children} triggerProps={{ className: 'text-nowrap text-ellipsis overflow-hidden max-w-full' }}>
                {children}
            </Tooltip>
        </div>
    )
}
