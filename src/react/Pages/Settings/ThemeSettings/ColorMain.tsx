import { memo, useRef, ReactNode, ComponentProps } from "react";
import { ColorDropdown } from "./ColorDropdown";

export type ColorMainProps = {
    children?: ReactNode
    anchorChildren?: ReactNode
    color: string
    colorKey?: string
    onColorChange?: (color: string, colorKey?: string) => Promise<void> | void
    containerProps?: ComponentProps<'div'>
}

export const ColorMain = memo(function ColorMain({ children, anchorChildren, color, onColorChange, colorKey, containerProps }: ColorMainProps) {
    const ref = useRef<HTMLDivElement>(null);

    const cancel = useRef<boolean>(true);

    console.log('ColorVariant', { cancel, color, ref: ref.current });

    return (
        <ColorDropdown
            color={color}
            colorKey={colorKey}
            containerProps={containerProps}
            onColorChange={onColorChange}
            anchorChildren={anchorChildren}
        >
            {children}
        </ColorDropdown>
    );
});
