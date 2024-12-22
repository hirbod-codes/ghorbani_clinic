import {
    DropdownMenu as ShadcnDropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/react/shadcn/components/ui/dropdown-menu"
import React, { ReactNode } from "react";

export type DropdownMenuProps = {
    trigger: ReactNode,
    contents: ({
        type: 'label'
        options?: React.ComponentProps<typeof DropdownMenuLabel>
        content?: any
    } | {
        type: 'separator'
        options?: React.ComponentProps<typeof DropdownMenuSeparator>
    } | {
        type: 'item'
        options?: React.ComponentProps<typeof DropdownMenuItem>
        content?: any
    })[]
}

export function DropdownMenu({ trigger, contents }: DropdownMenuProps) {
    return (
        <>
            <ShadcnDropdownMenu>
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                <DropdownMenuContent>
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
        </>
    )
}
