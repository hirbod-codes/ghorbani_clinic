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

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [themeOptions, setThemeOptions] = useState({ ...c.themeOptions })

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
        console.log('onColorOptionChanging', k, option, ColorStatic.parse(option.main).toHex(), ColorStatic.parse(option.light).toHex(), ColorStatic.parse(option.dark).toHex())
        updateThemeOption(k, option.main)
        setThemeOptions({ ...themeOptions })
    }, [])

    const onColorOptionChanged = useCallback((k: string, option: ColorVariants) => {
        console.log('onColorOptionChanged', k, option, ColorStatic.parse(option.main).toHex(), ColorStatic.parse(option.light).toHex(), ColorStatic.parse(option.dark).toHex())
        updateThemeOption(k, option.main)
        updateThemeOptions()
        setThemeOptions({ ...themeOptions })
    }, [])

    const updateThemeOptions = () => Object.keys(themeOptions.colors).map(k => updateThemeOption(k, themeOptions.colors[k].main))

    const updateThemeOption = (k: string, mainColor: string) => {
        let coefficient = themeOptions.colorCoefficient
        if (['background', 'foreground', 'input', 'border'].includes(k))
            return

        themeOptions.colors[k].main = mainColor

        // creates new instance
        let light = ColorStatic.parse(mainColor).toHsv()
        light.setValue((1 - coefficient) * 100)
        themeOptions.colors[k].light = light.toHsl().toString()

        // creates new instance
        let dark = ColorStatic.parse(mainColor).toHsv()
        dark.setValue(coefficient * 100)
        themeOptions.colors[k].dark = dark.toHsl().toString()
    }

    console.log('ThemeSettings', { c, themeOptions, colorCoefficient, foregroundCoefficient, showGradientBackground, loadingGradientBackground })

    return (
        <>
            <div className="flex flex-row flex-wrap items-start content-start size-full p-3 *:m-1 overflow-y-auto">
                <Temp />
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
                        option={themeOptions.colors[k]}
                        onColorOptionChanging={onColorOptionChanging}
                        onColorOptionChanged={onColorOptionChanged}
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

                            setForegroundCoefficient(e.target.value)

                            const n = Number(e.target.value)
                            if (Number.isNaN(n) || Number.isFinite(n) || n < 0 || n > 1)
                                return

                            themeOptions.foregroundCoefficient = n
                            updateThemeOptions()
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
                            updateThemeOptions()
                        }}
                    />
                </div>
            </div >
        </>
    )
})

