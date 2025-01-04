import { memo, useEffect, useRef, useState } from "react";
import { Color as ColorType } from '@/src/Electron/Configuration/renderer.d';
import { CheckIcon } from "lucide-react";
import { Button } from "@/src/react/Components/Base/Button";
import { Input } from "@/src/react/Components/Base/Input";
import { usePointerOutside } from "@/src/react/Components/Base/usePointerOutside";

export type ColorShadeProps<T extends { [k: string]: string }> = {
    options: ColorType<T>
    mode: keyof ColorType<T>
    variant: keyof T
    fg: string
    onChange?: (shade: number) => void | Promise<void>
    onChangeCancel?: () => void | Promise<void>
}

export const ColorShade = memo(function ColorShade<T extends { [k: string]: string }>({ options, mode, variant, fg, onChange, onChangeCancel }: ColorShadeProps<T>) {
    const [editingShade, setEditingShade] = useState<boolean>(false)
    const [error, setError] = useState<string | undefined>(undefined)

    const [text, setText] = useState<string>(options[mode + '-shades'][variant])

    useEffect(() => {
        setEditingShade(false)
        setText(options[mode + '-shades'][variant])
    }, [options[mode + '-shades'][variant]])

    const ref = useRef<HTMLDivElement>(null)

    usePointerOutside(ref, (isOutside) => {
        if (editingShade && isOutside) {
            setEditingShade(false)
            if (onChangeCancel)
                onChangeCancel()
        }
    }, [ref])

    console.log('ColorShade', { error, text, editingShade, ref: ref.current, options, mode, variant, fg })

    return (
        <div ref={ref} className="w-fit hover:opacity-50" onClick={(e) => { e.stopPropagation(); setEditingShade(true) }}>
            {editingShade
                ?
                <div className="flex flex-row space-x-1">
                    <Input
                        containerProps={{ className: 'w-[1cm]' }}
                        className="size-full p-0"
                        style={{ backgroundColor: options[mode as string][variant], color: fg, borderColor: fg }}
                        value={text}
                        errorText={error}
                        onChange={(e) => {
                            e.stopPropagation();
                            setText(e.target.value)

                            let n = Number(e.target.value)
                            if (Number.isNaN(n) || n === Infinity)
                                setError('Value must be a number.')
                            else if (n < 0 || n > 100)
                                setError('Value must be between 0 and 100.')
                            else
                                setError(undefined)
                        }}
                    />
                    <Button
                        size='icon'
                        className="size-5 p-0 m-0"
                        onClick={async () => {
                            if (error !== undefined)
                                return

                            setEditingShade(false)

                            if (onChange)
                                await onChange(Number(text))
                        }}
                        style={{ backgroundColor: fg }}
                        color={fg}
                    >
                        <CheckIcon
                            color={options[mode as string][variant]}
                        />
                    </Button>
                </div>
                : 'P-' + options[mode + '-shades'][variant]
            }
        </div>
    )
})
