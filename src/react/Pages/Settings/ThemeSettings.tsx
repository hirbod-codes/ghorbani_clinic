import { memo, useContext, useState } from "react";
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

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState<boolean>(false)

    const [open, setOpen] = useState<string>()
    const [color, setColor] = useState<string>('#000')

    const updateShowGradientBackground = async (v: boolean) => {
        setLoadingGradientBackground(true)

        const conf = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!

        conf.showGradientBackground = v;

        await (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig(conf)
        setLoadingGradientBackground(false)

        c.setShowGradientBackground(v)
        setShowGradientBackground(v)
    }

    console.log('ThemeSettings', { c }, { toHex: stringify(toHex('hsl(215.4, 16.3%, 46.9%)')), toHsl: stringify(toHsl('hsl(215.4, 16.3%, 46.9%)')), toRgb: stringify(toRgb('hsl(215.4, 16.3%, 46.9%)')) })

    return (
        <>
            <div className="flex flex-row flex-wrap items-start content-start size-full p-3 *:m-1">
                <div className="border rounded-lg p-2">
                    <Switch
                        label={t('ThemeSettings.showGradientBackground')}
                        labelId={t('ThemeSettings.showGradientBackground')}
                        checked={showGradientBackground}
                        onCheckedChange={async (e) => await updateShowGradientBackground(e)}
                    />
                </div>

                {Object.keys(c.themeOptions.colors).filter(f => !['white', 'black', 'background', 'foreground'].includes(f)).map((k, i) =>
                    <div key={i} className="border rounded-lg p-2">
                        <p>
                            {k}
                        </p>
                        <div className="flex flex-col items-center w-full p-4 space-y-2">
                            <div className="flex flex-row justify-around items-center w-full">
                                <div className="border rounded-lg p-1" style={{ color: 'grey', backgroundColor: stringify(shadeColor(c.themeOptions.colors[k], -0.3)) }}><MoonIcon /></div>
                                <div className="border rounded-lg p-1" style={{ color: 'grey', backgroundColor: stringify(shadeColor(c.themeOptions.colors[k], 0.3)) }}><SunIcon /> </div>
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

                <div className="border p-2">
                    <Input
                        className="w-[5rem]"
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
            </div>
        </>
    )
})

