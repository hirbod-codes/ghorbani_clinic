import { ComponentProps, memo, ReactNode, useRef, useState } from "react";
import { Color as ColorType } from '@/src/Electron/Configuration/renderer.d';
import { RGB } from "@/src/react/Lib/Colors/RGB";
import { ColorPicker } from "@/src/react/Components/ColorPicker";
import { HSV } from "@/src/react/Lib/Colors/HSV";
import { DropdownMenu } from "@/src/react/Components/Base/DropdownMenu";
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic";
import { cn } from "@/src/react/shadcn/lib/utils";

export type ColorVariantProps<T extends { [k: string]: string }> = {
    children?: ReactNode
    options: ColorType<T>
    mode: keyof ColorType<T>
    variant: keyof T
    onColorChanged?: (options: ColorType<T>) => void | Promise<void>
    onColorChangeCancel?: () => void | Promise<void>
    calculateShades?: boolean
    containerProps?: ComponentProps<'div'>
    anchorProps?: ComponentProps<'div'>
    anchorChildren?: ReactNode
}

export const ColorVariant = memo(function ColorVariant<T extends { [k: string]: string }>({ children, anchorChildren, anchorProps, options, mode, variant, onColorChanged, onColorChangeCancel, containerProps, calculateShades = true }: ColorVariantProps<T>) {
    const ref = useRef<HTMLDivElement>(null)

    const [cancel, setCancel] = useState<boolean>(true)

    const [open, setOpen] = useState<boolean>(false)
    const [color, setColor] = useState<HSV>(ColorStatic.parse(options[mode][variant as string]).toHsv())

    return (
        <div {...containerProps}>
            <div
                ref={ref}
                style={{ backgroundColor: color.toHex() }}
                onClick={() => setOpen(true)}
                {...anchorProps}
                className={cn(['cursor-pointer'], anchorProps?.className)}
            >
                {anchorChildren}
            </div>
            <DropdownMenu
                anchorRef={ref}
                open={open}
                onOpenChange={(b) => {
                    if (!b) {
                        if (cancel && onColorChangeCancel)
                            onColorChangeCancel()
                        if (!cancel)
                            setCancel(false)
                        setOpen(false)
                    }
                }}
            >
                <ColorPicker
                    controlledColor={color}
                    onColorChanging={(c) => {
                        if (ref.current)
                            ref.current.style.backgroundColor = c.toHex()
                    }}
                    onColorChanged={(c) => {
                        setColor(c)
                        if (onColorChanged) {
                            if (variant === 'main' && calculateShades) {
                                options[mode][variant as string] = {
                                    main: c.toHex(),
                                    foreground: (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades'].foreground); return rgb.toHex() })(),
                                    container: (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades'].container); return rgb.toHex() })(),
                                    'container-foreground': (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades']['container-foreground']); return rgb.toHex() })(),
                                    fixed: (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades'].fixed); return rgb.toHex() })(),
                                    'fixed-dim': (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades']['fixed-dim']); return rgb.toHex() })(),
                                    'fixed-foreground': (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades']['fixed-foreground']); return rgb.toHex() })(),
                                    'fixed-foreground-variant': (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades']['fixed-foreground-variant']); return rgb.toHex() })(),
                                }
                            } else {
                                let rgb = RGB.fromHex(c.toHex())
                                rgb.shadeColor(options[mode + '-shades'][variant as string])
                                options[mode][variant as string] = rgb.toHex()
                            }

                            onColorChanged(options)
                        }
                    }}
                />
            </DropdownMenu>
            {children}
        </div>
    )
})
