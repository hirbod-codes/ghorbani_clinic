import { ReactNode } from "react"
import {
    Tooltip as ShadcnToolTip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/src/react/shadcn/components/ui/tooltip"

export function Tooltip({ children, tooltipContent }: { children: ReactNode, tooltipContent: string }) {
    return (
        <TooltipProvider>
            <ShadcnToolTip>
                <TooltipTrigger>{children}</TooltipTrigger>
                <TooltipContent>{tooltipContent}</TooltipContent>
            </ShadcnToolTip>
        </TooltipProvider>
    )
}
