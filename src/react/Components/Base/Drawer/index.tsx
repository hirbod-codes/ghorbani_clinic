import {
    Drawer as ShadcnDrawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/src/react/shadcn/components/ui/drawer"
import { ReactNode } from "react"

export function Drawer({ open, onOpenChange, children, footer, title, description }: { children?: ReactNode, onOpenChange?: ((open: boolean) => void), open?: boolean, footer?: ReactNode, title?: string, description?: string }) {
    return (
        <ShadcnDrawer open={open} onOpenChange={onOpenChange}>
            {/* <DrawerTrigger>Open</DrawerTrigger> */}
            <DrawerContent>
                {title &&
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                    </DrawerHeader>
                }
                {children}
                {footer &&
                    <DrawerFooter>
                        {footer}
                    </DrawerFooter>
                }
            </DrawerContent>
        </ShadcnDrawer>
    )
}

