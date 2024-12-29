import { memo, useContext, useReducer, useRef, useState } from "react";
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

export const ThemeSettings = memo(function ThemeSettings() {
    const [, rerender] = useReducer(x => x + 1, 0)

    const c = useContext(ConfigurationContext)!

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState<boolean>(false)

    const [open, setOpen] = useState<string>()
    const [color, setColor] = useState<HSV>()
    const colorRef = useRef<string>()
    const buttonRef = useRef<HTMLDivElement>(null)

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

                {Object.keys(c.themeOptions.colors).filter(f => !['background', 'foreground'].includes(f)).map((k, i) => {
                    const main = ColorStatic.parse(c.themeOptions.colors[k].main)
                    const mainDark = ColorStatic.parse(c.themeOptions.colors[k].main)
                    mainDark.darken(c.themeOptions.colorCoefficient)
                    const mainLight = ColorStatic.parse(c.themeOptions.colors[k].main)
                    mainLight.lighten(c.themeOptions.colorCoefficient)

                    const rgb = ColorStatic.toRgb(main) as RGB

                    const hsv20 = ColorStatic.toHsv(main)
                    hsv20.setValue(20)
                    const hsv50 = ColorStatic.toHsv(main)
                    hsv50.setValue(50)
                    const hsv80 = ColorStatic.toHsv(main)
                    hsv80.setValue(80)

                    return <div key={i} className="border rounded-lg p-2 min-w-40">
                        <p>
                            {k}
                        </p>
                        <div className="flex flex-col items-center w-full p-4 space-y-2">
                            <div className="flex flex-row justify-around items-center w-full">
                                <div
                                    className="border rounded-lg p-1"
                                    style={{ color: 'grey', backgroundColor: mainDark.toString() }}
                                >
                                    <MoonIcon />
                                </div>
                                <div
                                    className="border rounded-lg p-1"
                                    style={{ color: 'grey', backgroundColor: mainLight.toString() }}
                                >
                                    <SunIcon />
                                </div>
                            </div>

                            <Button
                                className="border w-full"
                                style={{ backgroundColor: main.toString() }}
                                onClick={() => { setColor(ColorStatic.toHsv(ColorStatic.parse(c.themeOptions.colors[k].main)) as HSV); setOpen(k); }}
                            >
                                Change
                            </Button>

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

                                        c.themeOptions.colors[k].main = tc;

                                        c.updateTheme(undefined, c.themeOptions);
                                    }}
                                >
                                    <CheckIcon />
                                </Button>
                            </div>


                            <div
                                className="border rounded-lg p-1 py-4 w-full text-center"
                                style={{
                                    color: ColorStatic.toHsl(hsv20).toString(),
                                    backgroundColor: ColorStatic.toHsl(hsv50).toString()
                                }}
                            >
                                Primary
                            </div>

                            <div
                                className="border rounded-lg p-1 py-4 w-full text-center"
                                style={{
                                    color: ColorStatic.toHsl(hsv50).toString(),
                                    backgroundColor: ColorStatic.toHsl(hsv80).toString()
                                }}
                            >
                                Primary Container
                            </div>

                            <div
                                className="border rounded-lg p-1 py-4 w-full text-center"
                                style={{ color: 'grey', backgroundColor: 0.2126 * rgb.getRed() + 0.7152 * rgb.getGreen() + 0.0722 * rgb.getBlue() > 0.5 ? 'black' : 'white' }}
                            >
                                on Primary
                            </div>

                            <div
                                className="border rounded-lg p-1 py-4 w-full text-center"
                                style={{ color: 'grey', backgroundColor: ColorStatic.toHsl(hsv50).toString() }}
                            >
                                on Primary Container
                            </div>

                            <DropdownMenu
                                open={open === k}
                                onOpenChange={(b) => {
                                    console.log('DropdownMenu.onOpenChanged')
                                    c.themeOptions.colors[k].main = color?.toString();

                                    if (!b)
                                        c.updateTheme(undefined, c.themeOptions)
                                    setOpen(b ? k : undefined)
                                }}
                                containerProps={{ className: 'bg-background' }}
                                contents={[
                                    {
                                        type: 'item',
                                        content: <ColorPicker
                                            mode="hsva"
                                            onColorChanged={(c) => { setColor(c); rerender() }}
                                        />
                                    },
                                    {
                                        type: 'item',
                                        content: <Button className="size-10" style={{ backgroundColor: !color ? '' : ColorStatic.toHsl(color).toHex() }} />
                                    },
                                    {
                                        type: 'item',
                                        content: <div className="size-10 p-2 text-center" ref={buttonRef}  >Ref</div>
                                    },
                                    // {
                                    //     type: 'item',
                                    //     content: <HslaStringColorPicker
                                    //         color={color}
                                    //         onChange={(color) => setColor(stringify({ ...toHsl(color), value: [toHsl(color).value[0], toHsl(color).value[1], 50] }))} />
                                    // }
                                ]} />


                        </div>
                    </div>;
                }
                )}

                {/* <div className="overflow-auto w-full h-full border border-green-500">
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
                </div> */}

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


