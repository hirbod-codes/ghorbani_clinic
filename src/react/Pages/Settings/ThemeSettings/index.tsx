import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ConfigurationContext } from '../../../Contexts/Configuration/ConfigurationContext';
import { t } from 'i18next';
import { ColorVariants, configAPI, ThemeOptions } from '@/src/Electron/Configuration/renderer.d';
import { Switch } from "../../../Components/Base/Switch";
import { Input } from "../../../Components/Base/Input";
import { Color } from "./Color";
import { Button } from "@/src/react/Components/Base/Button";
import { SaveIcon } from "@/src/react/Components/Icons/SaveIcon";
import { RGB } from "@/src/react/Lib/Colors/RGB";
import { IColor } from "@/src/react/Lib/Colors/IColor";
import { HSV } from "@/src/react/Lib/Colors/HSV";
import { HSL } from "@/src/react/Lib/Colors/HSL";
import { ColorPicker } from "@/src/react/Components/ColorPicker";
import { Checkbox } from "@mui/material";
import { DropdownMenu } from "@/src/react/Components/Base/DropdownMenu";
import { ColorStatic } from "@/src/react/Lib/Colors/ColorStatic";

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    // JSON is slow but acceptable for this use case
    const [themeOptions, setThemeOptions] = useState<ThemeOptions>(() => JSON.parse(JSON.stringify(c.themeOptions)))

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

    const onColorOptionChange = useCallback((k: string, option: ColorVariants) => {
        themeOptions.colors[k] = option
        setThemeOptions({ ...themeOptions })
    }, [])

    const onColorOptionChangeCancel = useCallback(async (k: string, option: ColorVariants) => {
        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
        themeOptions.colors[k] = conf.themeOptions.colors[k]
        setThemeOptions({ ...themeOptions })
    }, [])

    console.log('ThemeSettings', { c, themeOptions, colorCoefficient, foregroundCoefficient, showGradientBackground, loadingGradientBackground })

    return (
        <>
            {/* <div className="grid grid-cols-12">
                <div className="grid md:col-span-4">
                    <div className="size-full flex flex-col items-stretch space-y-4 px-2">
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

                        <div className="flex flex-row rounded-3xl bg-gray-500 p-1 space-x-3">
                            <div className="rounded-full size-[1.2cm]" style={{ backgroundColor: 'blue' }} />
                            <div>
                                <p className="text-xl text-nowrap">Primary</p>
                                <p className="text-sm text-nowrap">Acts as custom source color</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid">
                </div>
            </div> */}
            <div className="flex flex-row flex-wrap items-start content-start size-full p-3 *:m-1 overflow-y-auto">
                {/* Color tones */}
                <ColorTones />
                <Button className="absolute z-10 bottom-3 right-3" size='lg' onClick={() => c.updateTheme(undefined, themeOptions)}>
                    <SaveIcon /> Save
                </Button>

                {/* 
                    <Color
                        key={k}
                        name={k}
                        colorCoefficient={themeOptions.colorCoefficient}
                        option={themeOptions.colors[k]}
                        onColorOptionChange={onColorOptionChange}
                        onColorOptionChangeCancel={onColorOptionChangeCancel}
                    />
                */}

                {Object.keys(themeOptions.colors.palette).map((k, i) =>
                    Object.keys(themeOptions.colors.palette[k][themeOptions.mode])
                        .map((kk) =>
                            <SingleColor color={themeOptions.colors.palette[k][themeOptions.mode][kk]} name={`${k + '-' + kk}`} />
                        )
                )}

                {Object.keys(themeOptions.colors.surface[themeOptions.mode]).map((k, i) =>
                    <SingleColor color={themeOptions.colors.surface[themeOptions.mode][k]} name={`surface-${k}`} />
                )}

                <div className="border rounded-lg p-2 min-w-40">
                    <Input
                        className="w-[2cm]"
                        label={t('ThemeSettings.radius')}
                        labelId={t('ThemeSettings.radius')}
                        value={themeOptions.radius.replace('rem', '')}
                        onChange={(e) => {
                            if (e.target.value.match(/[^0-9 .]/) !== null)
                                return

                            themeOptions.radius = e.target.value + 'rem'
                            setThemeOptions({ ...themeOptions })
                        }}
                    />
                </div>

                <div className="border rounded-lg p-2 min-w-40">
                    <Input
                        className="w-[2cm]"
                        label={t('ThemeSettings.foregroundCoefficient')}
                        labelId={t('ThemeSettings.foregroundCoefficient')}
                        value={foregroundCoefficient}
                        onChange={(e) => {
                            if (e.target.value.match(/[^0-9 .]/) !== null)
                                return

                            setForegroundCoefficient(e.target.value)

                            const n = Number(e.target.value)
                            if (Number.isNaN(n) || Number.isFinite(n) || n < 0 || n > 1)
                                return

                            themeOptions.foregroundCoefficient = n
                            setThemeOptions({ ...themeOptions })
                        }}
                    />
                </div>

                <div className="border rounded-lg p-2">
                    <Input
                        className="w-[2cm]"
                        label={t('ThemeSettings.colorCoefficient')}
                        labelId={t('ThemeSettings.colorCoefficient')}
                        value={colorCoefficient}
                        errorText={(Number(colorCoefficient) > 1 || Number(colorCoefficient) < 0) ? 'Value Must be between 0 and 1' : undefined}
                        onChange={(e) => {
                            if (e.target.value.match(/[^0-9 .]/) !== null)
                                return

                            setColorCoefficient(e.target.value)

                            const n = Number(e.target.value)
                            if (Number.isNaN(n) || !Number.isFinite(n) || n < 0 || n > 1)
                                return

                            themeOptions.colorCoefficient = n
                            setThemeOptions({ ...themeOptions })
                        }}
                    />
                </div>

                <div className="border rounded-lg p-2 min-w-40">
                    <Switch
                        label={t('ThemeSettings.showGradientBackground')}
                        labelId={t('ThemeSettings.showGradientBackground')}
                        checked={showGradientBackground}
                        disabled={loadingGradientBackground}
                        onCheckedChange={async (e) => await updateShowGradientBackground(e)}
                    />
                </div>
            </div >
        </>
    )
})

export function SingleColor({ name = '', color: defaultColor }: { name?: string, color: string }) {
    const [open, setOpen] = useState(false)
    const [color, setColor] = useState<HSV>()
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        try {
            setColor(ColorStatic.parse(defaultColor).toHsv())
        } catch (e) { console.error(e) }
    }, [defaultColor])
    return (
        <>
            <div ref={ref} className="text-center text-gray-500 min-h-[2cm] rounded-full border cursor-pointer" onClick={() => setOpen(true)} style={{ backgroundColor: color?.toHex() }}>
                {name}
            </div>
            <DropdownMenu
                anchorRef={ref}
                open={open}
                onOpenChange={(b) => {
                    if (!b)
                        setOpen(b)
                }}
            >
                <ColorPicker
                    onColorChanging={(c) => {
                        if (ref.current)
                            ref.current.style.backgroundColor = c.toHex()
                    }}
                    onColorChanged={(c) => {
                        setColor(c)
                    }}
                />
            </DropdownMenu>
        </>
    )
}


const calculateTintAndShade = (
    hexColor, // using #663399 as an example
    percentage = 0.1 // using 10% as an example
) => {
    const r = parseInt(hexColor.slice(1, 3), 16); // r = 102
    const g = parseInt(hexColor.slice(3, 5), 16); // g = 51
    const b = parseInt(hexColor.slice(5, 7), 16); // b = 153

    /* 
       From this part, we are using our two formulas
       in this case, here is the formula for tint,
       please be aware that we are performing two validations
       we are using Math.min to set the max level of tint to 255,
       so we don't get values like 280 ;)
       also, we have the Math.round so we don't have values like 243.2
       both validations apply for both tint and shade as you can see */
    const tintR = Math.round(Math.min(255, r + (255 - r) * percentage)); // 117
    const tintG = Math.round(Math.min(255, g + (255 - g) * percentage)); // 71
    const tintB = Math.round(Math.min(255, b + (255 - b) * percentage)); // 163


    const shadeR = Math.round(Math.max(0, r - r * percentage)); // 92
    const shadeG = Math.round(Math.max(0, g - g * percentage)); // 46
    const shadeB = Math.round(Math.max(0, b - b * percentage)); // 138


    /* 
       Now with all the values calculated, the only missing stuff is 
       getting our color back to hexadecimal, to achieve that, we are going
       to perform a toString(16) on each value, so we get the hex value
       for each color, and then we just append each value together and voilà!*/
    return {
        tint: {
            r: tintR,
            g: tintG,
            b: tintB,
            hex:
                '#' +
                [tintR, tintG, tintB]
                    .map(x => x.toString(16).padStart(2, '0'))
                    .join(''), // #7547a3 
        },
        shade: {
            r: shadeR,
            g: shadeG,
            b: shadeB,
            hex:
                '#' +
                [shadeR, shadeG, shadeB]
                    .map(x => x.toString(16).padStart(2, '0'))
                    .join(''), // #5c2e8a 
        },
    };
};

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
                        let color
                        if (n <= mid)
                            color = calculateTintAndShade(hex, 1 - (n / mid)).shade.hex
                        else
                            color = calculateTintAndShade(hex, -1 + (n / mid)).tint.hex

                        return (
                            <div key={i} className="size-14 flex flex-col justify-center items-center text-gray-500" style={{ backgroundColor: color }}>
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

