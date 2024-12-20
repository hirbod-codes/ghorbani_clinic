import { cn } from "@/src/react/shadcn/lib/utils";
import { Select } from "../Select";

export function InputGroup({ fields = [], inputBorderRadius = 'md' }: { fields?: ({ type: 'input', props?: React.ComponentProps<'input'> } | { type: 'select', props: React.ComponentProps<typeof Select> })[], inputBorderRadius?: 'sm' | 'md' | 'lg' | 'none' | 'xl' | '2xl' | '3xl' | 'full' }) {
    return (
        fields.map(((f, i) => {
            let roundness = '';
            if (i === 0)
                roundness += ` rounded-l-${inputBorderRadius}`
            if (i === (fields.length - 1))
                roundness += ` rounded-r-${inputBorderRadius}`

            let rightBorder = ''
            if (fields.length > 1 && i !== (fields.length - 1))
                rightBorder = 'border-r-0'

            if (f.type === 'input')
                return <input
                    key={i}
                    {...f.props}
                    className={cn(`w-20 py-1 px-2 bg-background text-foreground border ${rightBorder} border-accent ${roundness}`, f?.props?.className)}
                />

            if (f.type === 'select')
                return <Select
                    key={i}
                    {...f.props}
                    triggerProps={{ className: cn(`w-20 py-1 px-2 bg-background text-foreground border ${rightBorder} border-accent ${roundness}`, f.props?.triggerProps?.className) }}
                />
        }))
    )
}
