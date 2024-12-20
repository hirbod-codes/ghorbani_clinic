import {
    Select as ShadcnSelect,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/src/react/shadcn/components/ui/select"
import { ComponentProps } from "react"

export type SelectProps = {
    selectOptions: {
        type: 'items'
        items: { value: string, displayValue: string }[]
    } | {
        type: 'group'
        groups: {
            label: string
            items: { value: string, displayValue: string }[]
        }[]
    }
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    triggerProps?: ComponentProps<typeof SelectTrigger>
}

export function Select({ value, onValueChange, selectOptions, placeholder, triggerProps }: SelectProps) {
    return (
        <ShadcnSelect onValueChange={onValueChange} value={value}>
            <SelectTrigger {...triggerProps}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {selectOptions.type === 'group'
                    ? selectOptions.groups.map((g, i) =>
                        <SelectGroup key={i}>
                            {g.label && <SelectLabel>{g.label}</SelectLabel>}
                            {g.items.map((item, i) =>
                                <SelectItem value={item.value}>{item.displayValue}</SelectItem>
                            )}
                        </SelectGroup>
                    )
                    : selectOptions.items.map((item, i) =>
                        <SelectItem key={i} value={item.value}>{item.displayValue}</SelectItem>
                    )
                }
            </SelectContent>
        </ShadcnSelect>
    )
}

