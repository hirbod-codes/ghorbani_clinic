import { memo, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/src/react/Components/Base/Button";
import { Input } from "@/src/react/Components/Base/Input";
import { usePointerOutside } from "@/src/react/Components/Base/usePointerOutside";

export type ColorShadeProps = {
    shade: number
    bg: string
    fg: string
    onChange?: (shade: number) => void | Promise<void>
}

export const ColorShade = memo(function ColorShade({ shade, bg, fg, onChange }: ColorShadeProps) {
    const [editingShade, setEditingShade] = useState<boolean>(false)
    const [error, setError] = useState<string | undefined>(undefined)

    const [text, setText] = useState<string>(shade.toString())

    const shadeContainerRef = useRef<HTMLDivElement>(null)

    let memoizedShade: string | undefined
    memoizedShade = useMemo(() => {
        if (editingShade === true)
            return shade.toString()
        else
            return memoizedShade ?? shade.toString()
    }, [editingShade])

    usePointerOutside(shadeContainerRef, (isOutside) => {
        if (editingShade && isOutside) {
            if (onChange)
                onChange(Number(memoizedShade))
            setEditingShade(false)
        }
    }, [shadeContainerRef])

    useEffect(() => {
        setEditingShade(false)
        setText(shade.toString())
    }, [shade])

    useEffect(() => {
        if (editingShade === true) {
            setText(shade.toString())
            setError(undefined)
        }
    }, [editingShade])

    console.log('ColorShade', { shade, bg, fg, error, text, editingShade, memoizedShade, ref: shadeContainerRef.current })

    return (
        <div ref={shadeContainerRef} className="w-fit hover:opacity-50" onClick={(e) => { e.stopPropagation(); setEditingShade(true) }}>
            {editingShade
                ?
                <div className="flex flex-row space-x-1">
                    <Input
                        containerProps={{ className: 'w-[1cm]' }}
                        className="size-full p-0"
                        style={{ backgroundColor: bg, color: fg, borderColor: fg }}
                        value={text}
                        errorText={error}
                        onChange={async (e) => {
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
                        isIcon
                        className="size-5 p-0 m-0"
                        onClick={async () => {
                            if (error !== undefined)
                                return

                            setEditingShade(false)

                            if (onChange)
                                await onChange(Number(text))
                        }}
                        style={{ backgroundColor: fg }}
                        fgColor={fg as any}
                    >
                        <CheckIcon color={bg} />
                    </Button>
                </div>
                : 'P-' + shade
            }
        </div>
    )
})
