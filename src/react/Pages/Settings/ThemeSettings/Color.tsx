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
    name: string
    option: ColorVariants
    colorCoefficient: number
    onColorOptionChanging?: (name: string, option: ColorVariants) => void
    onColorOptionChanged?: (name: string, option: ColorVariants) => void
    onColorOptionChangeCancel?: (name: string, option: ColorVariants) => void
}

export const Color = memo(function Color({ name, option, colorCoefficient, onColorOptionChanging, onColorOptionChanged, onColorOptionChangeCancel }: ColorProps) {
    const [color, setColor] = useState<HSV>(ColorStatic.parse(option.main).toHsv())
    const [open, setOpen] = useState<string | undefined>(undefined)
    const [text, setText] = useState<string>(ColorStatic.parse(option.main).toHex())
    const lightRef = useRef<HTMLDivElement>(null)
    const darkRef = useRef<HTMLDivElement>(null)
    const mainRef = useRef<HTMLDivElement>(null)
    const anchorRef = useRef<any>(null)

    useEffect(() => {
        setColor(ColorStatic.parse(option.main).toHsv())
        setText(ColorStatic.parse(option.main).toHex())
    }, [option.main])

    console.log('Color', { k: name, option, color, open, text, anchorRef: anchorRef.current })

    return (
        <div className="border rounded-lg p-2 min-w-40">
            <p>{name}</p>

            <div className="flex flex-col items-stretch w-full py-4 space-y-1">
                <div className="flex flex-row justify-around items-stretch w-full space-x-1">
                    <div ref={darkRef} className="w-full">
                        <Button
                            className="border text-gray-500 rounded-lg p-5 w-full"
                            style={{ backgroundColor: option.dark }}
                            onClick={() => { if (darkRef.current) anchorRef.current = darkRef.current; setOpen('dark') }}
                        >
                            <MoonIcon />
                        </Button>
                    </div>
                    <div ref={lightRef} className="w-full">
                        <Button
                            className="border text-gray-500 rounded-lg p-5 w-full"
                            style={{ backgroundColor: option.light }}
                            onClick={() => { if (lightRef.current) anchorRef.current = lightRef.current; setOpen('light') }}
                        >
                            <SunIcon />
                        </Button>
                    </div>
                </div>

                <div ref={mainRef}>
                    <Button
                        className="border w-full"
                        style={{ backgroundColor: option.main }}
                        onClick={() => { if (mainRef.current) anchorRef.current = mainRef.current; setOpen('main') }}
                    >
                        Change
                    </Button>
                </div>

                <DropdownMenu
                    anchorRef={anchorRef}
                    open={open !== undefined}
                    onOpenChange={(b) => {
                        if (!b) {
                            if (onColorOptionChangeCancel)
                                onColorOptionChangeCancel(name, option)
                            setOpen(undefined)
                        }
                    }}
                    containerProps={{ className: 'bg-background' }}
                >
                    <div className="flex flex-col border rounded-lg p-2 z-10">
                        <ColorPicker
                            containerProps={{ className: 'border-0' }}
                            controlledColor={color}
                            onColorChanging={(c) => setText(c.toHex())}
                            onColorChanged={(c) => {
                                setColor(c)

                                if (!onColorOptionChanging)
                                    return

                                if (open === 'main') {
                                    option.main = c.toHex()

                                    // creates new instance
                                    let light = ColorStatic.parse(c.toHex()).toHsv()
                                    light.setValue((1 - colorCoefficient) * 100)

                                    option.light = light.toHsl().toString()

                                    // creates new instance
                                    let dark = ColorStatic.parse(c.toHex()).toHsv()
                                    dark.setValue(colorCoefficient * 100)

                                    option.dark = dark.toHsl().toString()
                                }

                                if (open === 'light')
                                    option.light = c.toHex()

                                if (open === 'dark')
                                    option.dark = c.toHex()

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
