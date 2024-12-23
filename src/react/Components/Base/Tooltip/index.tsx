import { ComponentProps, ReactNode } from "react"
import {
    Tooltip as ShadcnToolTip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/src/react/shadcn/components/ui/tooltip"

export function Tooltip({ children, tooltipContent, contentProps, delayDuration, skipDelayDuration }: { children: ReactNode, contentProps?: ComponentProps<typeof TooltipContent>, tooltipContent: ReactNode, delayDuration?: number, skipDelayDuration?: number }) {
    return (
        <TooltipProvider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
            <ShadcnToolTip>
                <TooltipTrigger>{children}</TooltipTrigger>
                <TooltipContent {...contentProps}>{tooltipContent}</TooltipContent>
            </ShadcnToolTip>
        </TooltipProvider>
    )
}
