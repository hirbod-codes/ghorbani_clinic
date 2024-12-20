import { InputWithIcon as ReferenceInput } from "../InputWithIcon";
import { Label } from "@/src/react/shadcn/components/ui/label";
import { ComponentProps } from "react";

export function Input({ label, labelId, ...props }: { label?: string, labelId?: string } & ComponentProps<typeof ReferenceInput>) {
    const input = <ReferenceInput id={labelId} {...props} />

    if (label && labelId)
        return (
            <div className="flex items-center space-x-2">
                <Label htmlFor={labelId}>
                    {label}
                </Label>
                {input}
            </div>
        )
    else
        return input
}

