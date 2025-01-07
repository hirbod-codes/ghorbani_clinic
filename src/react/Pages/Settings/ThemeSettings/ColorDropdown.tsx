import { Button } from "@/src/react/Components/Base/Button";
import { DropdownMenu } from "@/src/react/Components/Base/DropdownMenu";
import { Input } from "@/src/react/Components/Base/Input";
import { ColorPicker } from "@/src/react/Components/ColorPicker";
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic";
import { HSV } from "@/src/react/Lib/Colors/HSV";
import { cn } from "@/src/react/shadcn/lib/utils";
import { memo, useRef, useState, useEffect, useMemo, ReactNode, ComponentProps } from "react";

export type ColorDropdownProps = {
    children?: ReactNode
    anchorChildren?: ReactNode
    color: string
    colorKey?: string
    onColorChange?: (color: string, colorKey?: string) => Promise<void> | void
    containerProps?: ComponentProps<'div'>
}

export const ColorDropdown = memo(function ColorDropdown({ children, anchorChildren, color: bg, onColorChange, colorKey, containerProps }: ColorDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);

    const cancel = useRef<boolean>(true);

    const [open, setOpen] = useState<boolean>(false);
    const [color, setColor] = useState<HSV>(ColorStatic.parse(bg).toHsv());
    const [inputString, setInputString] = useState<string>(ColorStatic.parse(bg).toHex());

    useEffect(() => {
        setColor(ColorStatic.parse(bg).toHsv());
        setInputString(ColorStatic.parse(bg).toHsv().toHex());
    }, [bg]);

    let memoizedColor: string | undefined;
    memoizedColor = useMemo(() => {
        if (open === true)
            return bg;

        else
            return memoizedColor ?? bg;
    }, [open]);

    const colorUpdate = (c: HSV) => {
        if (onColorChange)
            onColorChange(c.toHex(), colorKey);
    };

    console.log('ColorVariant', { cancel, open, color, memoizedColor, ref: ref.current });

    return (
        <>
            <div
                ref={ref}
                style={{ backgroundColor: color.toHex() }}
                onClick={() => { setOpen(true); }}
                {...containerProps}
                className={cn(['cursor-pointer'], containerProps?.className)}
            >
                {anchorChildren}
            </div>

            <DropdownMenu
                anchorRef={ref}
                open={open}
                containerProps={{ className: 'rounded-md border p-2 space-y-2' }}
                onOpenChange={(b) => {
                    if (!b && open) {
                        if (cancel.current === false)
                            colorUpdate(ColorStatic.parse(memoizedColor!).toHsv());

                        else
                            cancel.current = true;
                        setOpen(false);
                    }
                }}
            >
                <ColorPicker
                    containerProps={{ className: 'border-0 p-0 m-0' }}
                    controlledColor={color}
                    onColorChanging={(c) => {
                        if (ref.current)
                            ref.current.style.backgroundColor = c.toHex();
                        setInputString(c.toHex());
                    }}
                    onColorChanged={(c) => {
                        setColor(c);
                        colorUpdate(c);
                    }} />
                <Input
                    placeholder='color hex number'
                    value={inputString}
                    onChange={(e) => {
                        setInputString(e.target.value);

                        try {
                            setColor(ColorStatic.parse(e.target.value).toHsv());
                        } catch (e) { }
                    }} />
                <Button size='sm' className="w-full" onClick={() => { cancel.current = false; setOpen(false); }}>
                    Apply
                </Button>
            </DropdownMenu>
            {children}
        </>
    );
});
