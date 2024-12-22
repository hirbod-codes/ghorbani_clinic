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

export const ThemeSettings = memo(function ThemeSettings() {
    const c = useContext(ConfigurationContext)!

    const [showGradientBackground, setShowGradientBackground] = useState<boolean>(c.showGradientBackground ?? false)
    const [loadingGradientBackground, setLoadingGradientBackground] = useState(false)

    const [colorPickerValue, setColorPickerValue] = useState<string>('#000000')


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
            <div className="flex flex-row flex-wrap size-full p-3 space-x-2 space-y-2">
                <Switch
                    className="col-auto"
                    label={t('ThemeSettings.showGradientBackground')}
                    labelId={t('ThemeSettings.showGradientBackground')}
                    checked={showGradientBackground}
                    onChange={(e) => updateShowGradientBackground(Boolean(e.currentTarget.value))}
                />

                {Object.keys(c.themeOptions.colors).map((k, i) =>
                    <div key={i} className="border rounded p-2 w-[12rem]">
                        <p>
                            {k}
                        </p>
                        <DropdownMenu
                            trigger={<Button style={{ backgroundColor: c.themeOptions.colors[k] }} onClick={() => setColorPickerValue(c.themeOptions.colors[k])} />}
                            contents={[
                                {
                                    type: 'item',
                                    content: <HexAlphaColorPicker color={colorPickerValue} onChange={(color) => {
                                        c.themeOptions.colors[k] = color
                                        c.updateTheme(c.themeOptions)
                                        setColorPickerValue(color)
                                    }} />
                                }
                            ]}
                        />
                    </div>
                )}

                <Input
                    label={t('ThemeSettings.contrastThreshold')}
                    labelId={t('ThemeSettings.contrastThreshold')}
                    value={c.themeOptions.radius.replace('rem', '')}
                    onChange={(e) => {
                        getContrastRatio
                        const r = parseFloat(e.target.value)
                        c.themeOptions.radius = r + 'rem'
                        c.updateTheme(c.themeOptions)
                    }}
                />
            </div>
        </>
    )
})

