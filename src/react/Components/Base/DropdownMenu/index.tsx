import {
    DropdownMenu as ShadcnDropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/react/shadcn/components/ui/dropdown-menu"
import { ComponentProps, ReactNode } from "react";

export type DropdownMenuProps = {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
    trigger?: ReactNode
    triggerProps?: ComponentProps<typeof DropdownMenuTrigger>
    containerProps?: ComponentProps<typeof DropdownMenuContent>
    contents: ({
        type: 'label'
        options?: ComponentProps<typeof DropdownMenuLabel>
        content?: any
    } | {
        type: 'separator'
        options?: ComponentProps<typeof DropdownMenuSeparator>
    } | {
        type: 'item'
        options?: ComponentProps<typeof DropdownMenuItem>
        content?: any
    })[]
}

export function DropdownMenu({ open, onOpenChange, defaultOpen, contents, trigger, triggerProps, containerProps }: DropdownMenuProps) {
    return (
        <ShadcnDropdownMenu open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} >
            <DropdownMenuTrigger {...triggerProps} >{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent {...containerProps}>
                {contents.map((c, i) => {
                    switch (c.type) {
                        case 'label':
                            return <DropdownMenuLabel key={i} {...c?.options}>{c?.content}</DropdownMenuLabel>
                        case 'separator':
                            return <DropdownMenuSeparator key={i} {...c?.options} />
                        case 'item':
                            return <DropdownMenuItem key={i} {...c?.options}>{c?.content}</DropdownMenuItem>
                    }
                })}
            </DropdownMenuContent>
        </ShadcnDropdownMenu>
    )
}
