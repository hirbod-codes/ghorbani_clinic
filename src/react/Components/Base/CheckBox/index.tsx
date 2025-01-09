import { cn } from "@/src/react/shadcn/lib/utils"
import { ComponentProps, memo, ReactNode } from "react"
import { ripple } from "../helpers"
import { IColor } from "@/src/react/Lib/Colors/IColor"
import { validateColor } from "@/src/react/Lib/Colors/helpers"

export type CheckBoxProps = {
    children?: ReactNode,
    label?: string,
    inputId?: string,
    rippleEffect?: boolean,
    color?: string | IColor,
    effectColor?: string | IColor,
    colorForeground?: string | IColor,
    containerProps?: ComponentProps<'label'>,
    inputProps?: ComponentProps<'input'>
}

export const CheckBox = memo(function CheckBox({ label, inputId = 'checkboxId', rippleEffect = true, color = 'primary', colorForeground = 'primary-foreground', effectColor = 'rgba(255, 255, 255, 0.7)', containerProps, inputProps }: CheckBoxProps) {
    color = validateColor(color)
    effectColor = validateColor(effectColor)
    colorForeground = validateColor(colorForeground)

    return (
        <label htmlFor={inputId} {...containerProps} className={cn(["select-none cursor-pointer flex flex-row items-center"], containerProps?.className)}>
            <p className="align-middle">{label}</p>

            <div className="overflow-hidden relative rounded-full block size-7 m-1" onClick={(e) => { if (rippleEffect) ripple(e, color, true) }}>
                <input type="checkbox" id={inputId} {...inputProps} className={cn(["hidden invisible peer"], inputProps?.className)} />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border rounded-sm size-3.5 peer-checked:*:block">
                    <svg
                        style={{ backgroundColor: color }}
                        className="hidden"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        stroke-width="1"
                    >
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                </div>

                <div
                    className="absolute size-full top-0 left-0 opacity-0 transition-opacity duration-100 hover:opacity-10"
                    style={{ borderRadius: 'inherit', backgroundColor: effectColor }}
                />
            </div>
        </label>
    )
})

