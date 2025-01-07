import { ComponentProps, memo, ReactNode, useRef } from "react";
import { ColorCard } from "./ColorCard";
import { Text } from "@/src/react/Components/Base/Text";
import { ColorShade } from "./ColorShade";
import { ColorDropdown } from "./ColorDropdown";

export type ColorVariantProps = {
    children?: ReactNode
    color: string
    fg: string
    shade: number
    label: string
    colorKey?: string
    shadeKey?: string
    onColorChange?: (color: string, colorKey?: string) => Promise<void> | void
    onShadeChange?: (shade: number, shadeKey?: string) => Promise<void> | void
    colorCardContainerProps?: ComponentProps<'div'>
    colorCardTextProps?: ComponentProps<typeof Text>
    containerProps?: ComponentProps<'div'>
}

export const ColorVariant = memo(function ColorVariant({ children, color, fg, shade, label, onColorChange, onShadeChange, colorKey, shadeKey, containerProps, colorCardContainerProps, colorCardTextProps }: ColorVariantProps) {
    const ref = useRef<HTMLDivElement>(null)

    const cancel = useRef<boolean>(true)

    console.log('ColorVariant', { cancel, shade, ref: ref.current })

    return (
        <ColorDropdown
            color={color}
            colorKey={colorKey}
            containerProps={containerProps}
            onColorChange={onColorChange}
            anchorChildren={
                <ColorCard
                    bg={color}
                    fg={fg}
                    text={label}
                    textProps={colorCardTextProps}
                    containerProps={colorCardContainerProps}
                    subText={
                        <ColorShade
                            shade={shade}
                            bg={color}
                            fg={fg}
                            onChange={(s) => { if (onShadeChange) onShadeChange(s, shadeKey) }}
                        />
                    }
                />
            }
        >
            {children}
        </ColorDropdown>
    )
})
