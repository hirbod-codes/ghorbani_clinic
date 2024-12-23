import { memo, ReactNode, useContext, useState } from "react";
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { HexAlphaColorPicker } from 'react-colorful';
import { t } from 'i18next';
import { configAPI } from '../../../Electron/Configuration/renderer.d';
import { Switch } from "../../Components/Base/Switch";
import { Input } from "../../Components/Base/Input";
import { DropdownMenu } from "../../Components/Base/DropdownMenu";
import { Button } from "../../shadcn/components/ui/button";
import { getContrastRatio } from "@mui/material";
import { shadeColor, stringify, toHex, toHsl, toRgb } from "../../Lib/Colors";
import { MoonIcon, SunIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState<boolean>(false)

    const [open, setOpen] = useState<string>()
    const [color, setColor] = useState<string>('#000')

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

    console.log('ThemeSettings', { c })

    return (
        <>
            <div className="flex flex-row flex-wrap items-start content-start size-full p-3 *:m-1">
                <div className="border rounded-lg p-2 min-w-40">
                    <Switch
                        label={t('ThemeSettings.showGradientBackground')}
                        labelId={t('ThemeSettings.showGradientBackground')}
                        checked={showGradientBackground}
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

                            <Button className="border w-full" style={{ backgroundColor: stringify(c.themeOptions.colors[k]) }} onClick={() => { console.log(c.themeOptions.colors[k], stringify(toHex(c.themeOptions.colors[k])), stringify(toRgb(c.themeOptions.colors[k]))); setColor(stringify(toHex(c.themeOptions.colors[k]))); setOpen(k) }}>Change</Button>

                            <DropdownMenu
                                open={open === k}
                                onOpenChange={(b) => {
                                    c.themeOptions.colors[k] = color

                                    if (!b)
                                        c.updateTheme(undefined, c.themeOptions)

                                    setOpen(b ? k : undefined)
                                }}
                                contents={[
                                    {
                                        type: 'item',
                                        content: <HexAlphaColorPicker
                                            color={color}
                                            onChange={(color) => setColor(color)} />
                                    }
                                ]} />
                        </div>
                    </div>
                )}

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


