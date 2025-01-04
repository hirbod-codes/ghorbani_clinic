import { ComponentProps, memo, useEffect, useRef } from "react";
import { Text } from "@/src/react/Components/Base/Text";
import { ClipboardCopyIcon } from "lucide-react";
import { cn } from "@/src/react/shadcn/lib/utils";
import { Button } from "@/src/react/Components/Base/Button";

export const ColorCard = memo(function ColorCard({ bg, fg, text, subText, containerProps }: { bg: string, fg: string, text: string, subText?: string, containerProps?: ComponentProps<'div'> }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
    }, [ref.current])

    return (
        <div
            style={{ backgroundColor: bg, color: fg }}
            {...containerProps}
            className={cn(['flex flex-row justify-between *:min-w-0'], containerProps?.className)}
            onPointerOver={() => { if (ref.current) ref.current.style.opacity = '1' }}
            onPointerOut={() => { if (ref.current) ref.current.style.opacity = '0' }}
        >
            <Text>
                {text}
            </Text>

            <div
                ref={ref}
                className="transition"
                style={{ opacity: 0 }}
                onClick={async (e) => { e.stopPropagation(); if (navigator.clipboard) await navigator.clipboard.writeText(bg) }}
            >
                <Button size='icon' style={{ backgroundColor: 'transparent' }}>
                    <ClipboardCopyIcon size={18} color={fg} />
                </Button>
            </div>
        </div>
    )
})
