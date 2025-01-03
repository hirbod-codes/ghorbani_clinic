import { ComponentProps, memo, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ConfigurationContext } from '../../../Contexts/Configuration/ConfigurationContext';
import { t } from 'i18next';
import { Color as ColorType, configAPI, PaletteVariants, SurfaceVariants, ThemeOptions } from '@/src/Electron/Configuration/renderer.d';
import { Switch } from "../../../Components/Base/Switch";
import { Input } from "../../../Components/Base/Input";
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
import { Separator } from "@/src/react/shadcn/components/ui/separator";
import { cn } from "@/src/react/shadcn/lib/utils";

export function Text({ children, ...props }: { children?: ReactNode } & ComponentProps<'div'>) {
    return (
        <div {...props} className={cn(["text-nowrap text-ellipsis overflow-hidden size-full"], props?.className)}>
            {children}
        </div>
    )
}

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

    const p = (k, i) =>
        <div key={i} className="col-span-1 row-span-1 flex flex-col space-y-1 *:text-nowrap *:text-xs">
            <div id='main' className="flex flex-col">
                <Text className="h-20 w-full p-1" style={{ color: themeOptions.colors.palette[k][themeOptions.mode].foreground, backgroundColor: themeOptions.colors.palette[k][themeOptions.mode].main }}>
                    {`${k}`}
                </Text>
                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode]['inverse-primary-foreground'], backgroundColor: themeOptions.colors.palette[k][themeOptions.mode].foreground }}>
                    {`${k} foreground`}
                </Text>
            </div>
            <div id='container' className="flex flex-col">
                <Text className="h-20 w-full p-1" style={{ color: themeOptions.colors.palette[k][themeOptions.mode]['container-foreground'], backgroundColor: themeOptions.colors.palette[k][themeOptions.mode].container }}>
                    {`${k} container`}
                </Text>
                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].container, backgroundColor: themeOptions.colors.palette[k][themeOptions.mode]['container-foreground'] }}>
                    {`${k} container foreground`}
                </Text>
            </div>
            <div id='fixed' className="flex flex-col">
                <Text className="h-20 w-full p-1" style={{ color: themeOptions.colors.palette[k][themeOptions.mode]['fixed-foreground'], backgroundColor: themeOptions.colors.palette[k][themeOptions.mode].fixed }}>
                    {`${k} fixed`}
                </Text>
                <Text className="h-20 w-full p-1" style={{ color: themeOptions.colors.palette[k][themeOptions.mode]['fixed-foreground'], backgroundColor: themeOptions.colors.palette[k][themeOptions.mode]['fixed-dim'] }}>
                    {`${k} fixed dim`}
                </Text>
                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.palette[k][themeOptions.mode].fixed, backgroundColor: themeOptions.colors.palette[k][themeOptions.mode]['fixed-foreground'] }}>
                    {`${k} fixed foreground`}
                </Text>
                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.palette[k][themeOptions.mode].fixed, backgroundColor: themeOptions.colors.palette[k][themeOptions.mode]['fixed-foreground-variant'] }}>
                    {`${k} fixed foreground variant`}
                </Text>
            </div>
        </div>

    return (
        <>
            <div className="grid grid-cols-12 grid-rows-1 items-stretch size-full p-2 overflow-hidden *:m-2">
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
                            <Variant<PaletteVariants>
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
                                    themeOptions.colors.palette[k] = o
                                    setThemeOptions({ ...themeOptions })
                                }}
                                onColorChangeCancel={async () => {
                                    const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                                    themeOptions.colors.palette[k][themeOptions.mode] = conf.themeOptions.colors.palette[k][themeOptions.mode]
                                    setThemeOptions({ ...themeOptions })
                                }}
                            >
                                <div>
                                    <p className="text-xl text-nowrap">{k}</p>
                                    {k === 'primary' &&
                                        <p className="text-sm text-nowrap">Acts as custom source color</p>
                                    }
                                </div>
                            </Variant>
                        )}
                        <div className="flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3" style={{ color: themeOptions.colors.surface[themeOptions.mode].inverse, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'] }}>
                            <div className="rounded-full size-[1.2cm]" style={{ backgroundColor: themeOptions.colors.palette.primary.main }} />
                            <div>
                                <p className="text-xl text-nowrap">Natural</p>
                                <p className="text-sm text-nowrap">Used for background and surfaces</p>
                            </div>
                        </div>
                        <div className="flex flex-row items-center rounded-3xl bg-gray-500 p-2 space-x-3" style={{ color: themeOptions.colors.surface[themeOptions.mode].inverse, backgroundColor: themeOptions.colors.surface[themeOptions.mode]['inverse-foreground'] }}>
                            <div className="rounded-full size-[1.2cm]" style={{ backgroundColor: themeOptions.colors.palette.primary.main }} />
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
                        <div className='grid grid-cols-4 items-start *:m-2 size-full content-start overflow-y-auto *:text-xs'>
                            {
                                Object
                                    .keys(themeOptions.colors.palette)
                                    .filter(f => ['primary', 'secondary', 'tertiary', 'error'].includes(f))
                                    .map(p)
                            }
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
                                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].main, backgroundColor: themeOptions.colors.surface[themeOptions.mode].foreground }}>
                                    surface foreground
                                </Text>
                                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].main, backgroundColor: themeOptions.colors.surface[themeOptions.mode]["foreground-variant"] }}>
                                    surface foreground variant
                                </Text>
                                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].main, backgroundColor: themeOptions.colors.outline[themeOptions.mode].main }}>
                                    outline
                                </Text>
                                <Text className="py-2 w-full p-1" style={{ color: themeOptions.colors.surface[themeOptions.mode].main, backgroundColor: themeOptions.colors.outline[themeOptions.mode].variant }}>
                                    outline variant
                                </Text>
                            </div>
                            {
                                Object
                                    .keys(themeOptions.colors.palette)
                                    .filter(f => !['primary', 'secondary', 'tertiary', 'error'].includes(f))
                                    .map(p)
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )



















    return (
        <>


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
                    <Variant<PaletteVariants>
                        mode={themeOptions.mode}
                        options={themeOptions.colors.palette[k]}
                        variant='main'
                        onColorChanged={(o) => {
                            themeOptions.colors.palette[k] = o
                            setThemeOptions({ ...themeOptions })
                        }}
                        onColorChangeCancel={async () => {
                            const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
                            themeOptions.colors.palette[k][themeOptions.mode] = conf.themeOptions.colors.palette[k][themeOptions.mode]
                            setThemeOptions({ ...themeOptions })
                        }}
                    >
                        <div>
                            <p className="text-xl text-nowrap">{k}</p>
                            {k === 'primary' &&
                                <p className="text-sm text-nowrap">Acts as custom source color</p>
                            }
                        </div>
                    </Variant>
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

export type VariantProps<T extends { [k: string]: string }> = {
    children?: ReactNode
    options: ColorType<T>
    mode: keyof ColorType<T>
    variant: keyof T
    onColorChanged?: (options: ColorType<T>) => void | Promise<void>
    onColorChangeCancel?: () => void | Promise<void>
    calculateShades?: boolean
    containerProps?: ComponentProps<'div'>
    anchorProps?: ComponentProps<'div'>
    anchorChildren?: ReactNode
}

export function Variant<T extends { [k: string]: string }>({ children, anchorChildren, anchorProps, options, mode, variant, onColorChanged, onColorChangeCancel, containerProps, calculateShades = true }: VariantProps<T>) {
    const ref = useRef<HTMLDivElement>(null)

    const [open, setOpen] = useState<boolean>(false)
    const [color, setColor] = useState<HSV>(ColorStatic.parse(options[mode][variant as string]).toHsv())

    return (
        <div {...containerProps}>
            <div
                ref={ref}
                style={{ backgroundColor: color.toHex() }}
                onClick={() => setOpen(true)}
                {...anchorProps}
                className={cn(['cursor-pointer'], anchorProps?.className)}
            >
                {anchorChildren}
            </div>
            <DropdownMenu
                anchorRef={ref}
                open={open}
                onOpenChange={(b) => {
                    if (!b) {
                        setOpen(false)
                        if (onColorChangeCancel)
                            onColorChangeCancel()
                    }
                }}
            >
                <ColorPicker
                    controlledColor={color}
                    onColorChanging={(c) => {
                        if (ref.current)
                            ref.current.style.backgroundColor = c.toHex()
                    }}
                    onColorChanged={(c) => {
                        setColor(c)
                        if (onColorChanged) {
                            if (variant === 'main' && calculateShades) {
                                options[mode][variant as string] = {
                                    main: c.toHex(),
                                    foreground: (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades'].foreground); return rgb.toHex() })(),
                                    container: (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades'].container); return rgb.toHex() })(),
                                    'container-foreground': (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades']['container-foreground']); return rgb.toHex() })(),
                                    fixed: (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades'].fixed); return rgb.toHex() })(),
                                    'fixed-dim': (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades']['fixed-dim']); return rgb.toHex() })(),
                                    'fixed-foreground': (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades']['fixed-foreground']); return rgb.toHex() })(),
                                    'fixed-foreground-variant': (() => { let rgb = RGB.fromHex(c.toHex()); rgb.shadeColor(options[mode + '-shades']['fixed-foreground-variant']); return rgb.toHex() })(),
                                }
                            } else {
                                let rgb = RGB.fromHex(c.toHex())
                                rgb.shadeColor(options[mode + '-shades'][variant as string])
                                options[mode][variant as string] = rgb.toHex()
                            }

                            onColorChanged(options)
                        }
                    }}
                />
            </DropdownMenu>
            {children}
        </div>
    )
}

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

