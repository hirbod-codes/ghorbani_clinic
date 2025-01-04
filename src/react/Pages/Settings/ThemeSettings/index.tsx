import { ComponentProps, memo, useContext, useRef, useState } from "react";
import { ConfigurationContext } from '../../../Contexts/Configuration/ConfigurationContext';
import { Color as ColorType, configAPI, PaletteVariants, ThemeMode, ThemeOptions } from '@/src/Electron/Configuration/renderer.d';
import { RGB } from "@/src/react/Lib/Colors/RGB";
import { IColor } from "@/src/react/Lib/Colors/IColor";
import { HSV } from "@/src/react/Lib/Colors/HSV";
import { HSL } from "@/src/react/Lib/Colors/HSL";
import { ColorPicker } from "@/src/react/Components/ColorPicker";
import { Checkbox } from "@mui/material";
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { Text } from "@/src/react/Components/Base/Text";
import { ClipboardCopyIcon, SaveIcon } from "lucide-react";
import { ColorVariant } from "./ColorVariant";
import { cn } from "@/src/react/shadcn/lib/utils";
import { Button } from "@/src/react/Components/Base/Button";
import { PaletteColorCards } from "./PaletteColorCards";

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [themeOptions, setThemeOptions] = useState<ThemeOptions>(() => structuredClone(c.themeOptions))

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState<boolean>(false)

    const [colorCoefficient, setColorCoefficient] = useState<string>(c.themeOptions.colorCoefficient.toString())
    const [foregroundCoefficient, setForegroundCoefficient] = useState<string>(c.themeOptions.foregroundCoefficient.toString())

    const updateShowGradientBackground = async (v: boolean) => {
        setLoadingGradientBackground(true)

        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!

        conf.showGradientBackground = v;

        await (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig(conf)
        setLoadingGradientBackground(false)

        c.setShowGradientBackground(v)
        setShowGradientBackground(v)
    }

    console.log('ThemeSettings', { c, themeOptions, colorCoefficient, foregroundCoefficient, showGradientBackground, loadingGradientBackground })

    const paletteColorCards = (k, i) =>
        <PaletteColorCards
            key={i}
            options={themeOptions.colors.palette[k]}
            name={k as keyof (typeof themeOptions.colors.palette)}
            mode={themeOptions.mode}
            onOptionChangeCancel={async () => {
                const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                themeOptions.colors.palette[k] = conf.themeOptions.colors.palette[k]
                setThemeOptions({ ...themeOptions })
            }}
            onOptionChange={(option: ColorType<PaletteVariants>) => {
                themeOptions.colors.palette[k] = option[k]
                setThemeOptions({ ...themeOptions })
            }}
        />

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow grid grid-cols-12 grid-rows-1 items-stretch size-full p-2 overflow-hidden *:m-2">
                <div id='grid-item-1' className="col-span-5 row-span-1 flex flex-row">
                    <div className="w-full flex flex-col items-stretch space-y-4 px-2 overflow-y-auto">
                        <div>
                            <p className="text-xl">Core Colors</p>
                            <p className="text-sm ">Override or set key colors that will be used to generate tonal palettes and schemes.</p>
                        </div>
                        <div>
                            <p className="text-xl">Color match</p>
                            <div className="flex flex-row items-center justify-between w-full">
                                <p className="text-sm ">Stay true to my color inputs.</p>
                                <Checkbox defaultChecked={true} size='small' />
                            </div>
                        </div>

                        {Object.keys(themeOptions.colors.palette).map((k, i) =>
                            <ColorVariant
                                key={i}
                                mode={themeOptions.mode}
                                options={themeOptions.colors.palette[k]}
                                variant='main'
                                anchorProps={{
                                    className: "rounded-full size-[1.2cm]"
                                }}
                                containerProps={{
                                    className: "flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3",
                                    style: {
                                        color: themeOptions.colors.surface[themeOptions.mode].inverse,
                                        backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground']
                                    }
                                }}
                                onColorChanged={(o) => {
                                    themeOptions.colors.palette[k] = o[k]
                                    setThemeOptions({ ...themeOptions })
                                }}
                                onColorChangeCancel={async () => {
                                    const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                    themeOptions.colors.palette[k] = conf.themeOptions.colors.palette[k]
                                    setThemeOptions({ ...themeOptions })
                                }}
                            >
                                <div>
                                    <p className="text-xl text-nowrap">{k}</p>
                                    {k === 'primary' &&
                                        <p className="text-sm text-nowrap">Acts as custom source color</p>
                                    }
                                </div>
                            </ColorVariant>
                        )}
                        <div className="flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3" style={{ color: themeOptions.colors.surface[themeOptions.mode].inverse, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'] }}>
                            <div className="rounded-full size-[1.2cm]" style={{ backgroundColor: themeOptions.colors.natural }} />
                            <div>
                                <p className="text-xl text-nowrap">Natural</p>
                                <p className="text-sm text-nowrap">Used for background and surfaces</p>
                            </div>
                        </div>
                        <div className="flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3" style={{ color: themeOptions.colors.surface[themeOptions.mode].inverse, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'] }}>
                            <div className="rounded-full size-[1.2cm]" style={{ backgroundColor: themeOptions.colors.naturalVariant }} />
                            <div>
                                <p className="text-xl text-nowrap">Natural Variants</p>
                                <p className="text-sm text-nowrap">Used for medium emphasis and variants</p>
                            </div>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="mx-4 my-8 h-auto" />
                </div>

                <div id='grid-item-2' className="col-span-7 row-span-1">
                    <div className="size-full bg-surface-container rounded-xl p-2">
                        <div className='grid grid-cols-4 items-start size-full content-start overflow-y-auto pr-2 *:m-2 *:text-xs'>
                            <div className="col-span-4 flex flex-row justify-between">
                                {
                                    Object
                                        .keys(themeOptions.colors.palette)
                                        .filter(f => ['primary', 'secondary', 'tertiary'].includes(f))
                                        .map((k, i) =>
                                            <div key={i} className="flex flex-col space-y-1" style={{ width: 'calc((100% - 1rem)/3)' }}>
                                                {paletteColorCards(k, i)}
                                            </div>
                                        )
                                }
                            </div>
                            <div className="col-span-3 flex flex-row space-x-1">
                                <Text className="h-20 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode].dim }}>
                                    surface dim
                                </Text>
                                <Text className="h-20 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode].main }}>
                                    surface
                                </Text>
                                <Text className="h-20 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode].bright }}>
                                    surface bright
                                </Text>
                            </div>
                            <div className="col-span-1 row-span-2 flex flex-col space-y-1">
                                <Text className="h-20 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'], backgroundColor: themeOptions.colors.surface[themeOptions.mode].inverse }}>
                                    surface inverse
                                </Text>
                                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].inverse, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'] }}>
                                    surface inverse foreground
                                </Text>
                                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-primary-foreground'] }}>
                                    surface inverse primary foreground
                                </Text>
                            </div>
                            <div className="col-span-3 flex flex-row space-x-1">
                                <Text className="h-20 w-1/5 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode].dim }}>
                                    surface dim
                                </Text>
                                <Text className="h-20 w-1/5 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode].main }}>
                                    surface
                                </Text>
                                <Text className="h-20 w-1/5 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode].bright }}>
                                    surface bright
                                </Text>
                                <Text className="h-20 w-1/5 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode].main }}>
                                    surface
                                </Text>
                                <Text className="h-20 w-1/5 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.surface[themeOptions.mode].bright }}>
                                    surface bright
                                </Text>
                            </div>
                            <div className="col-span-4 flex flex-row space-x-1">
                                <Text className="py-2 w-1/4 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].main, backgroundColor: themeOptions.colors.surface[themeOptions.mode].foreground }}>
                                    surface foreground
                                </Text>
                                <Text className="py-2 w-1/4 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].main, backgroundColor: themeOptions.colors.surface[themeOptions.mode]["foreground-variant"] }}>
                                    surface foreground variant
                                </Text>
                                <Text className="py-2 w-1/4 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].main, backgroundColor: themeOptions.colors.outline[themeOptions.mode].main }}>
                                    outline
                                </Text>
                                <Text className="py-2 w-1/4 p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].foreground, backgroundColor: themeOptions.colors.outline[themeOptions.mode].variant }}>
                                    outline variant
                                </Text>
                            </div>
                            {
                                Object
                                    .keys(themeOptions.colors.palette)
                                    .filter(f => !['primary', 'secondary', 'tertiary'].includes(f))
                                    .map((k, i) =>
                                        <div key={i} className="col-span-4 row-span-1">
                                            <div className="flex flex-row space-x-1 size-full *:w-1/3">
                                                {paletteColorCards(k, i)}
                                            </div>
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row-reverse px-4 py-2">
                <Button onClick={() => c.updateTheme(themeOptions.mode, themeOptions)}>
                    <SaveIcon /> Save
                </Button>
            </div>
        </div>
    )
})

export function ColorTones() {
    const count = 21
    // const hex = '#000000'
    const [hex, setHex] = useState('#415f91')
    const mid = Math.floor(count / 2)

    function getModifiedColor(hex: string, n: number, total: number): IColor {
        const color = RGB.fromHex(hex)
        const mid = Math.floor(total / 2)

        if (n >= mid)
            color.lighten((n - mid) / mid)
        else
            color.darken(1 - (n / mid))

        return color
    }

    return (
        <>
            <ColorPicker
                controlledColor={HSV.fromHex(hex) as HSV}
                onColorChanging={(c) => setHex(c.toHex())}
            />
            <div className="w-full overflow-auto m-1 border rounded-lg">
                <div className="h-14 flex flex-row space-x-1">
                    {Array.from(Array(count).keys()).map((n, i) => {
                        const c = HSL.fromHex(hex)
                        if (n <= mid)
                            c.darken(1 - (n / mid))
                        else
                            c.lighten((n - mid) / mid)

                        return (
                            <div key={i} className="size-14 flex flex-col justify-center items-center text-gray-500" style={{ backgroundColor: c.toHex() }}>
                                {n * 5}
                            </div>
                        )
                    })}
                </div>
                <div className="h-14 flex flex-row space-x-1">
                    {Array.from(Array(count).keys()).map((n, i) => {
                        const c = HSL.fromHex(hex)
                        if (n <= mid)
                            c.darken(1 - (n / mid))
                        else
                            c.lighten((n - mid) / mid)

                        return (
                            <div key={i} className="size-14 flex flex-col justify-center items-center text-gray-500" style={{ backgroundColor: c.toHex() }}>
                                {n * 5}
                            </div>
                        )
                    })}
                </div>
                <div className="h-14 flex flex-row space-x-1">
                    {Array.from(Array(count).keys()).map((n, i) => {
                        const c = RGB.fromHex(hex)
                        if (n <= mid)
                            c.darken(1 - (n / mid))
                        else
                            c.lighten((n - mid) / mid)

                        return (
                            <div key={i} className="size-14 flex flex-col justify-center items-center text-gray-500" style={{ backgroundColor: c.toHex() }}>
                                {n * 5}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="size-14 flex flex-col justify-center items-center text-gray-500" style={{ backgroundColor: getModifiedColor(hex, 80, 100).toHex() }}>
                80
            </div>
            <div className="size-[1.5cm] rounded-full" style={{ backgroundColor: '#d6e3ff' }} />
        </>
    )
}

