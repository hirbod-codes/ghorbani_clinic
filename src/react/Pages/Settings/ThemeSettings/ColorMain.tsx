import { memo, useRef, ReactNode, ComponentProps } from "react";
import { ColorDropdown } from "./ColorDropdown";

export type ColorMainProps = {
    color: string
    colorKey?: string
    onColorChange?: (color: string, colorKey?: string) => Promise<void> | void
    containerProps?: ComponentProps<'div'>
}

export const ColorMain = memo(function ColorMain({ color, onColorChange, colorKey, containerProps }: ColorMainProps) {
    const ref = useRef<HTMLDivElement>(null);

    const cancel = useRef<boolean>(true);

    console.log('ColorVariant', { cancel, color, ref: ref.current });

    return (
        <ColorDropdown
            color={color}
            colorKey={colorKey}
            containerProps={containerProps}
            onColorChange={onColorChange}
            anchorChildren={<div className="rounded-full size-[1.2cm]" style={{ backgroundColor: color }} />}
        >
            <div>
                <p className="text-xl text-nowrap">{colorKey?.split('.')[0]}</p>
                {colorKey?.split('.')[0] === 'primary' &&
                    <p className="text-sm text-nowrap">Acts as custom source color</p>
                }
            </div>
        </ColorDropdown>
    );
});
