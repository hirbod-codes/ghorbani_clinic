import { memo, useContext, useState } from "react";
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { HexAlphaColorPicker, HslColorPicker, HslaStringColorPicker } from 'react-colorful';
import { t } from 'i18next';
import { configAPI } from '../../../Electron/Configuration/renderer.d';
import { Switch } from "../../Components/Base/Switch";
import { Input } from "../../Components/Base/Input";
import { DropdownMenu } from "../../Components/Base/DropdownMenu";
import { shadeColor, stringify, toHex, toHsl, toRgb } from "../../Lib/Colors";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../../Components/Base/Button";
import * as colors from 'tailwindcss/colors'
import { DataGrid } from "../../Components/DataGrid";
import { ColorPicker } from "../../Components/ColorPicker";

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState<boolean>(false)

    const [open, setOpen] = useState<string>()
    const [color, setColor] = useState<any>('#000')

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

    const myColors = tailwindColors
        .map(c => [c.name, Object.fromEntries(Object.entries(c).filter(f => f[0] !== 'name'))])
        .map(([k, v], i) => [k, v['500']])
        .map(([k, v]) =>
            [k,
                Object.fromEntries(Array.from({ length: 11 })
                    .map((n, i) =>
                        [
                            (i * 10).toString(),
                            i <= 5
                                ? stringify({
                                    type: 'rgb',
                                    value: [toRgb(v).value[0], toRgb(v).value[1], toRgb(v).value[2]]
                                        .map(n => n * i * 0.2)
                                        .map(n => +(n).toFixed(1))
                                })
                                : stringify({
                                    type: 'rgb',
                                    value: [toRgb(v).value[0], toRgb(v).value[1], toRgb(v).value[2]]
                                        .map(n => n + ((255 - n) * ((i - 5) * 0.2)))
                                        .map(n => +(n).toFixed(1))
                                })
                        ]
                    )
                    .reverse()
                )])
        .map(([k, v]) => ({ ...v, name: k }))

    console.log('ThemeSettings', { tailwindColors, myColors })


    return (
        <>
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

                {Object.keys(c.themeOptions.colors).filter(f => !['white', 'black', 'background', 'foreground'].includes(f)).map((k, i) =>
                    <div key={i} className="border rounded-lg p-2 min-w-40">
                        <p>
                            {k}
                        </p>
                        <div className="flex flex-col items-center w-full p-4 space-y-2">
                            <div className="flex flex-row justify-around items-center w-full">
                                <div
                                    className="border rounded-lg p-1"
                                    style={{ color: 'grey', backgroundColor: k.includes('foreground') ? stringify(shadeColor(c.themeOptions.colors[k], c.themeOptions.foregroundCoefficient)) : stringify(shadeColor(c.themeOptions.colors[k], -c.themeOptions.colorCoefficient)) }}
                                >
                                    <MoonIcon />
                                </div>
                                <div
                                    className="border rounded-lg p-1"
                                    style={{ color: 'grey', backgroundColor: k.includes('foreground') ? stringify(shadeColor(c.themeOptions.colors[k], -c.themeOptions.foregroundCoefficient)) : stringify(shadeColor(c.themeOptions.colors[k], c.themeOptions.colorCoefficient)) }}
                                >
                                    <SunIcon />
                                </div>
                            </div>

                            <Button
                                className="border w-full"
                                style={{ backgroundColor: stringify(c.themeOptions.colors[k]) }}
                                onClick={() => { setColor(stringify(toHex(c.themeOptions.colors[k]))); setOpen(k) }}
                            >
                                Change
                            </Button>

                            <div className="flex flex-row items-center w-full p-0 space-x-1">
                                <Input containerProps={{ className: "w-full p-0", }} className="h-6" placeholder='color hex number' onChange={(e) => setTextColors({ ...textColors, k: e.target.value })} value={textColors.k ?? ''} />

                                <Button
                                    className="h-6 w-6"
                                    size='icon'
                                    onClick={() => {
                                        let tc: string | undefined = undefined
                                        try { tc = stringify(toHex(textColors.k)) }
                                        catch (e) { return }
                                        if (!tc)
                                            return

                                        c.themeOptions.colors[k] = tc

                                        c.updateTheme(undefined, c.themeOptions)
                                    }}
                                >
                                    <CheckIcon />
                                </Button>
                            </div>


                            <div
                                className="border rounded-lg p-1 py-4 w-full text-center"
                                style={{
                                    color: stringify({ ...toHsl(c.themeOptions.colors[k]), value: [toHsl(c.themeOptions.colors[k]).value[0], toHsl(c.themeOptions.colors[k]).value[1], 20] }),
                                    backgroundColor: stringify({ ...toHsl(c.themeOptions.colors[k]), value: [toHsl(c.themeOptions.colors[k]).value[0], toHsl(c.themeOptions.colors[k]).value[1], 50] })
                                }}
                            >
                                Primary
                            </div>

                            <div
                                className="border rounded-lg p-1 py-4 w-full text-center"
                                style={{
                                    color: stringify({ ...toHsl(c.themeOptions.colors[k]), value: [toHsl(c.themeOptions.colors[k]).value[0], toHsl(c.themeOptions.colors[k]).value[1], 50] }),
                                    backgroundColor: stringify({ ...toHsl(c.themeOptions.colors[k]), value: [toHsl(c.themeOptions.colors[k]).value[0], toHsl(c.themeOptions.colors[k]).value[1], 80] })
                                }}
                            >
                                Primary Container
                            </div>

                            <div
                                className="border rounded-lg p-1 py-4 w-full text-center"
                                style={{ color: 'grey', backgroundColor: 0.2126 * toRgb(c.themeOptions.colors[k]).value[0] + 0.7152 * toRgb(c.themeOptions.colors[k]).value[1] + 0.0722 * toRgb(c.themeOptions.colors[k]).value[2] > 0.5 ? 'black' : 'white' }}
                            >
                                on Primary
                            </div>

                            <div
                                className="border rounded-lg p-1 py-4 w-full text-center"
                                style={{ color: 'grey', backgroundColor: stringify({ ...toHsl(c.themeOptions.colors[k]), value: [toHsl(c.themeOptions.colors[k]).value[0], toHsl(c.themeOptions.colors[k]).value[1], 50] }) }}
                            >
                                on Primary Container
                            </div>

                            <DropdownMenu
                                open={open === k}
                                onOpenChange={(b) => {
                                    c.themeOptions.colors[k] = color

                                    // if (!b)
                                    //     c.updateTheme(undefined, c.themeOptions)

                                    // setOpen(b ? k : undefined)
                                }}
                                contents={[
                                    {
                                        type: 'item',
                                        content: <ColorPicker mode="hex" />
                                    },
                                    {
                                        type: 'item',
                                        content: <HslaStringColorPicker
                                            color={color}
                                            onChange={(color) => setColor(stringify({ ...toHsl(color), value: [toHsl(color).value[0], toHsl(color).value[1], 50] }))} />
                                    }
                                ]} />
                        </div>
                    </div>
                )}

                <div className="overflow-auto w-full h-full border border-green-500">
                    <div className="overflow-hidden w-[80cm] h-1/2">
                        <DataGrid
                            data={tailwindColors}
                            overWriteColumns={Object.keys(tailwindColors[0]).filter(f => f !== 'name').map(k => ({
                                id: k,
                                accessorKey: k,
                                cell: (props) => <div className="py-2 px-5" style={{ backgroundColor: props.getValue() as string, color: 'grey' }}>{stringify(toHsl(props.getValue() as string))}</div>
                            }))}
                            defaultColumnOrderModel={['name']}
                            showColumnHeaders={false}
                            addCounterColumn={false}
                        />
                    </div>

                    <div className="overflow-hidden w-[80cm] h-1/2">
                        <DataGrid
                            data={myColors}
                            overWriteColumns={Object.keys(myColors[0]).filter(f => f !== 'name').map(k => ({
                                id: k,
                                accessorKey: k,
                                cell: (props) => {
                                    // console.log(props.getValue() as string)
                                    return <div className="py-2 px-5" style={{ backgroundColor: props.getValue() as string, color: 'grey' }}>{stringify(toHsl(props.getValue() as string))}</div>;
                                }
                            }))}
                            defaultColumnOrderModel={['name']}
                            showColumnHeaders={false}
                            addCounterColumn={false}
                        />
                    </div>
                </div>

                {/* {Object.entries(colors).filter(f => f[0] !== 'default' && typeof f[1] !== 'string').map(([k, v]: [string, object], i) =>
                        <div className="flex flex-row space-x-2" key={i}>
                            {k}: {Object.entries(v).map(([kk, vv], j) => <p key={j} className="text-nowrap" style={{ color: 'grey', backgroundColor: stringify(toHsl(vv)) }}>{kk}: {stringify(toHsl(vv))}</p>)}
                        </div>
                    )} */}

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
        </>
    )
})


