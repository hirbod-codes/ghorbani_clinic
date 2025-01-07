import { ComponentProps, memo, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/src/react/Components/Base/Button";
import { ColorCard } from "./ColorCard";
import { DropdownMenu } from "@/src/react/Components/Base/DropdownMenu";
import { HSV } from "@/src/react/Lib/Colors/HSV";
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic";
import { cn } from "@/src/react/shadcn/lib/utils";
import { ColorPicker } from "@/src/react/Components/ColorPicker";
import { Input } from "@/src/react/Components/Base/Input";
import { Text } from "@/src/react/Components/Base/Text";
import { ColorShade } from "./ColorShade";

export type ColorVariantProps<T extends { [k: string]: string }> = {
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

export const ColorVariant = memo(function ColorVariant<T extends { [k: string]: string }>({ children, color: bg, fg, shade, label, onColorChange, onShadeChange, colorKey, shadeKey, containerProps, colorCardContainerProps, colorCardTextProps }: ColorVariantProps<T>) {
    const ref = useRef<HTMLDivElement>(null)

    const cancel = useRef<boolean>(true)

    const [open, setOpen] = useState<boolean>(false)
    const [color, setColor] = useState<HSV>(ColorStatic.parse(bg).toHsv())
    const [inputString, setInputString] = useState<string>(ColorStatic.parse(bg).toHex())

    useEffect(() => {
        setColor(ColorStatic.parse(bg).toHsv())
        setInputString(ColorStatic.parse(bg).toHsv().toHex())
    }, [bg])

    let memoizedColor: string | undefined
    memoizedColor = useMemo(() => {
        if (open === true)
            return bg
        else
            return memoizedColor ?? bg
    }, [open])

    const colorUpdate = (c: HSV) => {
        if (onColorChange)
            onColorChange(c.toHex(), colorKey)
    }

    console.log('ColorVariant', { cancel, open, color, shade, memoizedColor, ref: ref.current })

    return (
        <>
            <div
                ref={ref}
                style={{ backgroundColor: color.toHex() }}
                onClick={() => { setOpen(true) }}
                {...containerProps}
                className={cn(['cursor-pointer'], containerProps?.className)}
            >
                <ColorCard
                    bg={bg}
                    fg={fg}
                    text={label}
                    textProps={colorCardTextProps}
                    containerProps={colorCardContainerProps}
                    // containerProps={{ className: "h-24 p-1" }}
                    subText={
                        <ColorShade
                            shade={shade}
                            bg={color.toHex()}
                            fg={fg}
                            onChange={(s) => { if (onShadeChange) onShadeChange(s, shadeKey) }}
                        />
                    }
                />
            </div>

            <DropdownMenu
                anchorRef={ref}
                open={open}
                containerProps={{ className: 'rounded-md border p-2 space-y-2' }}
                onOpenChange={(b) => {
                    if (!b && open) {
                        if (cancel.current === false)
                            colorUpdate(ColorStatic.parse(memoizedColor!).toHsv())
                        else
                            cancel.current = true
                        setOpen(false)
                    }
                }}
            >
                <ColorPicker
                    containerProps={{ className: 'border-0 p-0 m-0' }}
                    controlledColor={color}
                    onColorChanging={(c) => {
                        if (ref.current)
                            ref.current.style.backgroundColor = c.toHex()
                        setInputString(c.toHex())
                    }}
                    onColorChanged={(c) => {
                        setColor(c)
                        colorUpdate(c)
                    }}
                />
                <Input
                    placeholder='color hex number'
                    value={inputString}
                    onChange={(e) => {
                        setInputString(e.target.value)

                        try {
                            setColor(ColorStatic.parse(e.target.value).toHsv())
                        } catch (e) { }
                    }}
                />
                <Button size='sm' className="w-full" onClick={() => { cancel.current = false; setOpen(false) }}>
                    Apply
                </Button>
            </DropdownMenu>
            {children}
        </>
    )
})
