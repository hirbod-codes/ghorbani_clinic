import { ComponentProps, createContext, ReactElement, ReactNode, useContext, useEffect, useRef, useState } from "react"
import { Stack } from "../Stack"
import { DropdownMenu } from "../DropdownMenu"
import { Button } from "../Button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "../Input"
import { Label } from "@/src/react/shadcn/components/ui/label"
import { CircularLoadingIcon } from "../CircularLoadingIcon"

const SelectContext = createContext<{ updateSelection: ({ value, displayValue }: { value: string, displayValue: string }) => void } | undefined>(undefined)

export function Select({ defaultValue, defaultDisplayValue, label, onValueChange, children, loading = false }: { defaultValue?: string, defaultDisplayValue?: string, label?: string, onValueChange: (v) => void | Promise<void>, children: ReactElement[], loading?: boolean }) {
    const [value, setValue] = useState(defaultValue)
    const [displayValue, setDisplayValue] = useState(defaultDisplayValue)
    const [open, setOpen] = useState(false)

    const [width, setWidth] = useState('auto')

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (inputRef?.current)
            setWidth(inputRef.current.getBoundingClientRect().width.toFixed(0) + 'px')
    }, [inputRef, inputRef?.current])

    return (
        <>
            <Stack stackProps={{ className: "items-center justify-center size-full last:mr-0" }}>
                {loading
                    ? <>
                        <Button className="w-full [&_svg]:size-8" size='sm' variant="text" style={{ width }}>
                            <CircularLoadingIcon />
                        </Button>
                    </>
                    : <>
                        {label &&
                            <Label htmlFor={label}>
                                {label}
                            </Label>
                        }
                        <Input inputRef={inputRef} id={label} className="cursor-pointer" containerProps={{ className: 'flex-grow' }} value={displayValue} readOnly onClick={(e) => { setOpen(!open) }} endIcon={open ? <ChevronUp /> : <ChevronDown />} />
                    </>
                }
            </Stack>

            <DropdownMenu
                anchorRef={inputRef}
                open={open}
                onOpenChange={(b) => { if (!b) setOpen(false) }}
                containerProps={{ className: 'rounded-md bg-surface-container-high my-0 shadow-md', style: { width } }}
            >
                <SelectContext.Provider value={{
                    updateSelection: ({ value, displayValue }) => {
                        setValue(value)
                        setDisplayValue(displayValue)
                        setOpen(false)
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
