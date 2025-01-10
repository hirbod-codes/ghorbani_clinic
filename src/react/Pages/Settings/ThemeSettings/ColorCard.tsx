import { ComponentProps, memo, ReactNode, useRef } from "react";
import { Text } from "@/src/react/Components/Base/Text";
import { ClipboardCopyIcon } from "lucide-react";
import { cn } from "@/src/react/shadcn/lib/utils";
import { Button } from "@/src/react/Components/Base/Button";

export type ColorCardProps = {
    bg: string,
    fg: string,
    text: string,
    textProps?: ComponentProps<typeof Text>,
    subText?: ReactNode,
    containerProps?: ComponentProps<'div'>
}

export const ColorCard = memo(function ColorCard({ bg, fg, text, textProps, subText, containerProps }: ColorCardProps) {
    const ref = useRef<HTMLDivElement>(null)

    return (
        <div
            style={{ backgroundColor: bg, color: fg }}
            {...containerProps}
            className={cn(['relative flex flex-row justify-between *:min-w-[36px]'], containerProps?.className)}
            onPointerOver={() => { if (ref.current) ref.current.style.opacity = '1' }}
            onPointerOut={() => { if (ref.current) ref.current.style.opacity = '0' }}
        >
            <div className="flex flex-col items-start">
                <Text {...textProps}>
                    {text}
                </Text>
                {subText}
            </div>

            <div className="flex flex-col justify-end">
                <div
                    ref={ref}
                    className="transition"
                    style={{ opacity: 0 }}
                    onClick={async (e) => { e.stopPropagation(); if (navigator.clipboard) await navigator.clipboard.writeText(bg) }}
                >
                    <Button isIcon style={{ backgroundColor: 'transparent' }}>
                        <ClipboardCopyIcon color={fg} />
                    </Button>
                </div>
            </div>
        </div>
    )
})
