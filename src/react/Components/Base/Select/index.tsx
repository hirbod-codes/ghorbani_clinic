import { ComponentProps, createContext, ReactElement, ReactNode, useContext, useRef, useState } from "react"
import { Stack } from "../Stack"
import { DropdownMenu } from "../DropdownMenu"
import { Button } from "../Button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/src/react/shadcn/lib/utils"
import { Input } from "../Input"

const SelectContext = createContext<{ updateSelection: ({ value, displayValue }: { value: string, displayValue: string }) => void } | undefined>(undefined)

export function Select({ defaultValue, defaultDisplayValue, label, onValueChange, children }: { defaultValue?: string, defaultDisplayValue?: string, label?: string, onValueChange: (v) => void | Promise<void>, children: ReactElement[] }) {
    const [value, setValue] = useState(defaultValue)
    const [displayValue, setDisplayValue] = useState(defaultDisplayValue)
    const [open, setOpen] = useState(false)

    const ref = useRef<HTMLInputElement>(null)

    return (
        <>
            {/* <Button variant='outline' buttonRef={ref} onClick={() => setOpen(true)}> */}
            <Input value={displayValue} ref={ref} onClick={() => setOpen(true)} label={label} labelId={label} endIcon={open ? <ChevronUp /> : <ChevronDown />} />
            {/* </Button> */}

            <DropdownMenu
                anchorRef={ref}
                open={open}
                onOpenChange={(b) => { if (!b) setOpen(false) }}
            >
                <SelectContext.Provider value={{
                    updateSelection: ({ value, displayValue }) => {
                        setValue(value)
                        setDisplayValue(displayValue)
                        if (onValueChange)
                            onValueChange(value)
                    }
                }}>
                    <Stack direction="vertical">
                        {children}
                    </Stack>
                </SelectContext.Provider>
            </DropdownMenu>
        </>
    )
}

Select.Item = ({ children, value, displayValue, containerProps }: { children: ReactNode, value: string, displayValue: string, containerProps?: ComponentProps<typeof Button> }) => {
    const c = useContext(SelectContext)

    return (
        <Button variant='text' fgColor='surface-foreground' {...containerProps} onClick={() => c?.updateSelection({ value, displayValue })}>
            {children}
        </Button>
    )
}
