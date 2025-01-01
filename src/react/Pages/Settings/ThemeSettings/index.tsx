import { memo, useCallback, useContext, useState } from "react";
import { ConfigurationContext } from '../../../Contexts/Configuration/ConfigurationContext';
import { t } from 'i18next';
import { ColorVariants, configAPI } from '@/src/Electron/Configuration/renderer.d';
import { Switch } from "../../../Components/Base/Switch";
import { Input } from "../../../Components/Base/Input";
import { Color } from "./Color";
import { Button } from "@/src/react/Components/Base/Button";
import { SaveIcon } from "@/src/react/Components/Icons/SaveIcon";
import { RGB } from "@/src/react/Lib/Colors/RGB";
import { IColor } from "@/src/react/Lib/Colors/IColor";
import { HSV } from "@/src/react/Lib/Colors/HSV";
import { HSL } from "@/src/react/Lib/Colors/HSL";

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    // JSON is slow but acceptable for this use case
    const [themeOptions, setThemeOptions] = useState(() => JSON.parse(JSON.stringify(c.themeOptions)))

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
            <div className="flex flex-row flex-wrap items-start content-start size-full p-3 *:m-1 overflow-y-auto">
                {/* Color tones */}
                <ColorTones />
                <Button className="absolute z-10 bottom-3 right-3" size='lg' onClick={() => c.updateTheme(undefined, themeOptions)}>
                    <SaveIcon /> Save
                </Button>

                {Object.keys(themeOptions.colors).map((k, i) =>
                    <Color
                        key={k}
                        name={k}
                        colorCoefficient={themeOptions.colorCoefficient}
                        option={themeOptions.colors[k]}
                        onColorOptionChange={onColorOptionChange}
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

export function ColorTones() {
    const count = 21
    const hex = '#ff0000'
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
            <div className="w-full overflow-auto m-1 border rounded-lg">
                <div className="h-14 flex flex-row space-x-1">
                    {Array.from(Array(count).keys()).map((n, i) => {
                        const c = HSV.fromHex(hex)
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
        </>
    )
}

