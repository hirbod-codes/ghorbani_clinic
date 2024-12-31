import { memo, useCallback, useContext, useRef, useState } from "react";
import { ConfigurationContext } from '../../../Contexts/Configuration/ConfigurationContext';
import { t } from 'i18next';
import { ColorVariants, configAPI } from '@/src/Electron/Configuration/renderer.d';
import { Switch } from "../../../Components/Base/Switch";
import { Input } from "../../../Components/Base/Input";
import { HSV } from "../../../Lib/Colors/HSV";
import { ColorStatic } from "../../../Lib/Colors/ColorStatic";
import { Color } from "./Color";
import { ColorPicker } from "@/src/react/Components/ColorPicker";
import { Button } from "@/src/react/Components/Base/Button";
import { SaveIcon } from "@/src/react/Components/Icons/SaveIcon";

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [themeOptions, setThemeOptions] = useState({ ...structuredClone(c.themeOptions) })

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

    const onColorOptionChanging = useCallback((k: string, option: ColorVariants) => {
        themeOptions.colors[k] = option
        setThemeOptions({ ...themeOptions })
    }, [])

    const onColorOptionChanged = useCallback((k: string, option: ColorVariants) => {
        themeOptions.colors[k] = option
        setThemeOptions({ ...themeOptions })
    }, [])

    const onColorOptionChangeCancel = useCallback((k: string, option: ColorVariants) => {
        themeOptions.colors[k] = c.themeOptions.colors[k]
        setThemeOptions({ ...themeOptions })
    }, [])

    console.log('ThemeSettings', { c, themeOptions, colorCoefficient, foregroundCoefficient, showGradientBackground, loadingGradientBackground })

    return (
        <>
            <div className="flex flex-row flex-wrap items-start content-start size-full p-3 *:m-1 overflow-y-auto">
                <Button className="absolute bottom-3 right-3" size='lg' onClick={() => c.updateTheme(undefined, themeOptions)}>
                    <SaveIcon /> Save
                </Button>

                <div className="border rounded-lg p-2 min-w-40">
                    <Switch
                        label={t('ThemeSettings.showGradientBackground')}
                        labelId={t('ThemeSettings.showGradientBackground')}
                        checked={showGradientBackground}
                        disabled={loadingGradientBackground}
                        onCheckedChange={async (e) => await updateShowGradientBackground(e)}
                    />
                </div>

                {Object.keys(themeOptions.colors).map((k, i) =>
                    <Color
                        key={k}
                        name={k}
                        colorCoefficient={themeOptions.colorCoefficient}
                        option={themeOptions.colors[k]}
                        onColorOptionChanging={onColorOptionChanging}
                        onColorOptionChanged={onColorOptionChanged}
                        onColorOptionChangeCancel={onColorOptionChangeCancel}
                    />
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
            </div >
        </>
    )
})

export function Temp() {
    const [color, setColor] = useState<HSV>(HSV.fromHex('#000000') as HSV)
    const [text, setText] = useState<string>(color.toHex())

    console.log('Temp', { color, text })

    return (
        <div className="bg-background border rounded-lg m-1 p-2">
            <Input
                containerProps={{ className: "w-full p-0" }}
                className="h-6"
                placeholder='color hex number'
                value={text}
                onChange={(e) => {
                    setText(e.target.value)

                    let c
                    try { c = ColorStatic.parse(e.target.value).toHsv() }
                    catch (e) { return }

                    if (!c)
                        return

                    setColor(c)
                }}
            />

            <ColorPicker
                containerProps={{ className: 'border-0' }}
                controlledColor={color}
                onColorChanging={(c) => {
                    setColor(c)
                    setText(c.toHex())
                }}
                onColorChanged={(c) => {
                    setColor(c)
                    setText(c.toHex())
                }}
            />

            <div className="flex flex-col flex-wrap bg-gray-600">
                <div className="h-10 text-center text-nowrap" style={{ backgroundColor: color.toHsv().toString() }}>
                    HSV: {color.toHsv().toString()}
                </div>

                <div className="h-10 text-center text-nowrap" style={{ backgroundColor: color.toHsl().toString() }}>
                    HSL: {color.toHsl().toString()}
                </div>

                <div className="h-10 text-center text-nowrap" style={{ backgroundColor: color.toRgb().toString() }}>
                    RGB: {color.toRgb().toString()}
                </div>

                <div className="h-10 text-center text-nowrap" style={{ backgroundColor: color.toHsv().toHex() }}>
                    HSV hex: {color.toHsv().toHex()}
                </div>

                <div className="h-10 text-center text-nowrap" style={{ backgroundColor: color.toHsl().toHex() }}>
                    HSL hex: {color.toHsl().toHex()}
                </div>

                <div className="h-10 text-center text-nowrap" style={{ backgroundColor: color.toRgb().toHex() }}>
                    RGB hex: {color.toRgb().toHex()}
                </div>
            </div>
        </div>
    )
}
