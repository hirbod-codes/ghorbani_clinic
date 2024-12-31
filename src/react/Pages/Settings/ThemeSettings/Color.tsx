import { memo, useEffect, useReducer, useRef, useState } from "react";
import { ColorVariants } from '@/src/Electron/Configuration/renderer.d';
import { Input } from "../../../Components/Base/Input";
import { DropdownMenu } from "../../../Components/Base/DropdownMenu";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../../../Components/Base/Button";
import { ColorPicker } from "../../../Components/ColorPicker";
import { HSV } from "../../../Lib/Colors/HSV";
import { ColorStatic } from "../../../Lib/Colors/ColorStatic";

export type ColorProps = {
    name: string,
    option: ColorVariants,
    onColorOptionChanging?: (key: string, option: ColorVariants) => void,
    onColorOptionChanged?: (key: string, option: ColorVariants) => void
}

export const Color = memo(function Color({ name, option, onColorOptionChanging, onColorOptionChanged }: ColorProps) {
    const [color, setColor] = useState<HSV>(ColorStatic.parse(option.main).toHsv())
    const [open, setOpen] = useState<string>()
    const [text, setText] = useState<string>(ColorStatic.parse(option.main).toHex())
    const anchorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setColor(ColorStatic.parse(option.main).toHsv())
        setText(ColorStatic.parse(option.main).toHex())
    }, [option.main])

    console.log('Color', { k: name, option, color, open, text, anchorRef: anchorRef.current })

    return (
        <div className="border rounded-lg p-2 min-w-40">
            <p>{name}</p>

            <div className="flex flex-col items-center w-full p-4 space-y-2">
                <div className="flex flex-row justify-around items-center w-full">
                    <div
                        className="border rounded-lg p-5"
                        style={{ color: 'grey', backgroundColor: option.dark }}
                    >
                        <MoonIcon />
                    </div>
                    <div
                        className="border rounded-lg p-5"
                        style={{ color: 'grey', backgroundColor: option.light }}
                    >
                        <SunIcon />
                    </div>
                </div>

                <div ref={anchorRef}>
                    <Button
                        className="border w-full"
                        style={{ backgroundColor: option.main }}
                        onClick={() => setOpen(name)}
                    >
                        Change
                    </Button>
                </div>

                <DropdownMenu
                    anchorRef={anchorRef}
                    open={open === name}
                    onOpenChange={(b) => {
                        if (!b)
                            setOpen(undefined)
                    }}
                    containerProps={{ className: 'bg-background' }}
                >
                    <div className="flex flex-col border rounded-lg p-2 z-10">
                        <ColorPicker
                            showValidZone={name !== 'border' && name !== 'input' && name !== 'background' && name !== 'foreground'}
                            containerProps={{ className: 'border-0' }}
                            mode="hsva"
                            controlledColor={color}
                            onColorChanging={(c) => setText(c.toHex())}
                            onColorChanged={(c) => {
                                console.log('Color.onColorChanged', c.toString(), c.toHex())
                                option.main = c.toHsl().toString();
                                setColor(c)

                                if (onColorOptionChanging)
                                    onColorOptionChanging(name, option)
                            }}
                        />

                        <div className="flex flex-row items-center w-full p-0 space-x-1">
                            <Input
                                containerProps={{ className: "w-full p-0" }}
                                className="h-6"
                                placeholder='color hex number'
                                value={text}
                                onChange={(e) => { setText(e.target.value) }}
                            />

                            <Button
                                className="h-6 w-6"
                                size='icon'
                                onClick={() => {
                                    let tc: HSV | undefined = undefined;
                                    try { tc = ColorStatic.parse(text).toHsv() }
                                    catch (e) { return; }
                                    if (!tc)
                                        return;

                                    option.main = tc.toHsl().toString()
                                    setColor(tc)

                                    if (onColorOptionChanging)
                                        onColorOptionChanging(name, option)
                                }}
                            >
                                <CheckIcon />
                            </Button>
                        </div>

                        <Button
                            className="w-full"
                            onClick={() => {
                                if (onColorOptionChanged)
                                    onColorOptionChanged(name, option)

                                setOpen(undefined)
                            }}
                        >
                            <CheckIcon /> Done
                        </Button>
                    </div>
                </DropdownMenu>
            </div>
        </div >
    )
})
