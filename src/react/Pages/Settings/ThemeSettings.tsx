import { memo, useContext, useMemo, useReducer, useRef, useState } from "react";
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { t } from 'i18next';
import { configAPI } from '../../../Electron/Configuration/renderer.d';
import { Switch } from "../../Components/Base/Switch";
import { Input } from "../../Components/Base/Input";
import { DropdownMenu } from "../../Components/Base/DropdownMenu";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../../Components/Base/Button";
import * as colors from 'tailwindcss/colors'
import { ColorPicker } from "../../Components/ColorPicker";
import { HSV } from "../../Lib/Colors/HSV";
import { HSL } from "../../Lib/Colors/HSL";
import { ColorStatic } from "../../Lib/Colors/ColorStatic";
import { RGB } from "../../Lib/Colors/RGB";
import { IColor } from "../../Lib/Colors/IColor";

export const ThemeSettings = memo(function ThemeSettings() {
    const [, rerender] = useReducer(x => x + 1, 0)

    const c = useContext(ConfigurationContext)!

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState<boolean>(false)

    const [open, setOpen] = useState<string>()
    const [color, setColor] = useState<HSV>()
    const colorRef = useRef<string>()
    const anchorRef = useRef<HTMLDivElement>(null)

    const [textColors, setTextColors] = useState<{ [k: string]: string }>({})

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

    console.log('ThemeSettings', { c, color, open, textColors, colorCoefficient, foregroundCoefficient, showGradientBackground, loadingGradientBackground })

    const tailwindColors: {
        name: string
        '50': string
        '100': string
        '200': string
        '300': string
        '400': string
        '500': string
        '600': string
        '700': string
        '800': string
        '900': string
        '950': string
    }[] = Object.entries(colors).filter(f => f[0] !== 'default' && typeof f[1] !== 'string').map(([k, v], i) => ({ ...v, name: k }))

    const themeOptionsColors = useMemo(() => {
        return Object.keys(c.themeOptions.colors).map((k) => {
            const v: any = {}

            v.main = ColorStatic.parse(c.themeOptions.colors[k].main)

            v.dark = ColorStatic.parse(c.themeOptions.colors[k].main)
            v.dark.darken(c.themeOptions.colorCoefficient)

            v.light = ColorStatic.parse(c.themeOptions.colors[k].main)
            v.light.lighten(c.themeOptions.colorCoefficient)

            if (c.themeOptions.colors[k]['dark-foreground']) {
                v['light-foreground'] = ColorStatic.toHsv(v.dark as IColor).getValue() > 50 ? '#000000' : '#ffffff';
                v['dark-foreground'] = ColorStatic.toHsv(v.dark as IColor).getValue() > 50 ? '#000000' : '#ffffff';
            }

            return [k, v];
        })
    }, [c.themeOptions.colors])

    return (
        <div className="flex flex-row flex-wrap items-start content-start size-full p-3 *:m-1 overflow-y-auto">
            <div className="border rounded-lg p-2 min-w-40">
                <Switch
                    label={t('ThemeSettings.showGradientBackground')}
                    labelId={t('ThemeSettings.showGradientBackground')}
                    checked={showGradientBackground}
                    disabled={loadingGradientBackground}
                    onCheckedChange={async (e) => await updateShowGradientBackground(e)}
                />
            </div>

            {[themeOptionsColors[0]].map((k, i) => {
                console.log({ k: k[0] })

                return <div key={i} className="border rounded-lg p-2 min-w-40">
                    <p>
                        {k[0]}
                    </p>
                    <div className="flex flex-col items-center w-full p-4 space-y-2">
                        <div className="flex flex-row justify-around items-center w-full">
                            <div
                                className="border rounded-lg p-1"
                                style={{ color: 'grey', backgroundColor: k[1].dark.toString() }}
                            >
                                <MoonIcon />
                            </div>
                            <div
                                className="border rounded-lg p-1"
                                style={{ color: 'grey', backgroundColor: k[1].light.toString() }}
                            >
                                <SunIcon />
                            </div>
                        </div>

                        <div ref={anchorRef}>
                            <Button
                                className="border w-full"
                                style={{ backgroundColor: k[1].main.toString() }}
                                onClick={() => { setColor(ColorStatic.toHsv(ColorStatic.parse(c.themeOptions.colors[k[0]].main)) as HSV); setOpen(k[0]); }}
                            >
                                Change
                            </Button>
                        </div>

                        <DropdownMenu
                            anchorRef={anchorRef}
                            open={open === k[0]}
                            onOpenChange={(b) => {
                                console.log('DropdownMenu.onOpenChanged')
                                setOpen(b ? k[0] : undefined)

                                if (!color)
                                    return

                                c.themeOptions.colors[k[0]].main = color.toHex();
                                color.setValue(80)

                                c.themeOptions.colors[k[0]].light = color.toHex();
                                color.setValue(20)

                                c.themeOptions.colors[k[0]].dark = color.toHex();
                                if (c.themeOptions.colors[k[0]]['light-foreground']) {
                                    c.themeOptions.colors[k[0]]['light-foreground'] = '#000000';
                                    c.themeOptions.colors[k[0]]['dark-foreground'] = '#ffffff';
                                }

                                // if (!b)
                                //     c.updateTheme(undefined, c.themeOptions)
                            }}
                            containerProps={{ className: 'bg-background' }}
                        >
                            <ColorPicker
                                mode="hsva"
                                defaultColor={ColorStatic.toHsv(ColorStatic.parse(c.themeOptions.colors[k[0]].main))}
                                onColorChanged={(c) => { setColor(c); rerender() }}
                            />
                        </DropdownMenu>

                        <div className="flex flex-row items-center w-full p-0 space-x-1">
                            <Input containerProps={{ className: "w-full p-0", }} className="h-6" placeholder='color hex number' onChange={(e) => setTextColors({ ...textColors, k: e.target.value })} value={textColors.k ?? ''} />

                            <Button
                                className="h-6 w-6"
                                size='icon'
                                onClick={() => {
                                    let tc: string | undefined = undefined;
                                    try { tc = HSL.fromHex(textColors.k).toHex() }
                                    catch (e) { return; }
                                    if (!tc)
                                        return;

                                    c.themeOptions.colors[k[0]].main = tc;

                                    c.updateTheme(undefined, c.themeOptions);
                                }}
                            >
                                <CheckIcon />
                            </Button>
                        </div>
                    </div>
                </div>;
            })}

            <div className="border rounded-lg p-2 min-w-40">
                <Input
                    className="w-[2cm]"
                    label={t('ThemeSettings.radius')}
                    labelId={t('ThemeSettings.radius')}
                    value={c.themeOptions.radius.replace('rem', '')}
                    onChange={(e) => {
                        if (e.target.value.match(/[^0-9 .]/) !== null)
                            return

                        c.themeOptions.radius = e.target.value + 'rem'
                        c.updateTheme(undefined, c.themeOptions)
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

                        setColorCoefficient(e.target.value)

                        const n = Number(e.target.value)
                        if (Number.isNaN(n) || Number.isFinite(n) || n < 0 || n > 1)
                            return

                        c.themeOptions.foregroundCoefficient = n
                        c.updateTheme(undefined, c.themeOptions)
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

                        c.themeOptions.colorCoefficient = n
                        c.updateTheme(undefined, c.themeOptions)
                    }}
                />
            </div>
        </div>
    )
})


