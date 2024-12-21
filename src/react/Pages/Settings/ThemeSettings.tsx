import { memo, useContext, useState } from "react";
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { HexAlphaColorPicker } from 'react-colorful';
import { t } from 'i18next';
import { configAPI } from '../../../Electron/Configuration/renderer.d';
import { Switch } from "../../Components/Base/Switch";
import { Input } from "../../Components/Base/Input";
import { DropdownMenu } from "../../Components/Base/DropdownMenu";
import { Button } from "../../shadcn/components/ui/button";

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
            <div className="flex flex-col size-full p-3 overflow-auto space-x-2 space-y-2">
                <Switch
                    label={t('ThemeSettings.showGradientBackground')}
                    labelId={t('ThemeSettings.showGradientBackground')}
                    checked={showGradientBackground}
                    onChange={(e) => updateShowGradientBackground(Boolean(e.currentTarget.value))}
                />

                {Object.keys(c.themeOptions.colors).map((k, i) =>
                    <div>
                        <p>
                            {k}
                        </p>
                        <DropdownMenu
                            trigger={<Button className={`bg-[${k}]`} onClick={() => setColorPickerValue(c.themeOptions.colors[k])} color={c.themeOptions.colors[k]} />}
                            contents={[
                                {
                                    type: 'item',
                                    content: <HexAlphaColorPicker color={colorPickerValue} onChange={(color) => {
                                        c.themeOptions.colors[k] = color
                                        c.updateTheme(c.themeOptions.mode, c.themeOptions)
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
                        const r = parseFloat(e.target.value)
                        c.themeOptions.radius = r + 'rem'
                        c.updateTheme(c.themeOptions.mode, c.themeOptions)
                    }}
                />
            </div>
        </>
    )
})

