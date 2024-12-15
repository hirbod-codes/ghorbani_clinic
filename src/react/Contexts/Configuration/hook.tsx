import { PaletteMode, SimplePaletteColorOptions, Theme, ThemeOptions, createTheme, darken, lighten, rgbToHex, useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { getLanguageCode, getMuiLocale } from '../../Lib/helpers';
import type { Calendar, Config, configAPI, Local, TimeZone } from '../../../Electron/Configuration/renderer.d';
import { enUS, Localization } from '@mui/material/locale';

export function useConfigurationHook() {
    const { i18n } = useTranslation();

    const initialThemeMode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    const getInitialLocale: Local = ({ calendar: 'Persian', zone: 'Asia/Tehran', language: getLanguageCode(enUS), direction: 'ltr' });
    const initialThemeOptions: ThemeOptions = {
        palette: {
            mode: initialThemeMode,
        },
        direction: getInitialLocale.direction
    }
    const defaultConfiguration: Config = {
        local: getInitialLocale,
        themeOptions: initialThemeOptions,
    };

    const [configuration, setConfiguration] = useState<Config & { theme: Theme }>({ ...defaultConfiguration, theme: createTheme(initialThemeOptions, getMuiLocale(i18n)) });

    const updateTheme = (mode?: PaletteMode, direction?: 'rtl' | 'ltr', muiLocal?: Localization, themeOptions?: ThemeOptions) => {
        mode = mode ?? configuration.themeOptions.palette!.mode;
        direction = direction ?? configuration.themeOptions.direction!;
        muiLocal = muiLocal ?? getMuiLocale(configuration.local.language)
        themeOptions = themeOptions ?? configuration.themeOptions;

        configuration.themeOptions = themeOptions
        configuration.themeOptions.palette!.mode = mode
        const primaryMainColor = (configuration.themeOptions.palette!.primary as SimplePaletteColorOptions)?.main;
        if (primaryMainColor) {
            (configuration.themeOptions.palette!.primary as SimplePaletteColorOptions).main = rgbToHex(mode === 'dark' ? darken(primaryMainColor, 0.125) : lighten(primaryMainColor, 0.125))
        }
        configuration.themeOptions.direction = direction;

        const c = {
            ...configuration,
            theme: createTheme(configuration.themeOptions, muiLocal)
        };

        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

        document.dir = direction;

        setConfiguration(c)
    };
    const updateLocal = async (calendar?: Calendar, direction?: 'rtl' | 'ltr', muiLocal?: Localization, zone?: TimeZone) => {
        direction = direction ?? configuration.local.direction
        muiLocal = muiLocal ?? getMuiLocale(configuration.local.language)
        zone = zone ?? configuration.local.zone
        calendar = calendar ?? configuration.local.calendar

        const c = {
            ...configuration,
            local: {
                ...configuration.local,
                direction: direction,
                code: getLanguageCode(muiLocal),
                zone,
                calendar,
            },
            theme: createTheme({ ...configuration.themeOptions, direction }, muiLocal)
        };

        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

        await i18n.changeLanguage(getLanguageCode(muiLocal));

        document.dir = direction;

        setConfiguration(c);
    };
    const setShowGradientBackground = (v: boolean) => {
        const c = { ...configuration, showGradientBackground: v };

        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

        setConfiguration({ ...configuration, showGradientBackground: Boolean(v) });
    }

    const [isConfigurationContextReady, setIsConfigurationContextReady] = useState<boolean>(false);
    useEffect(() => {
        if (!isConfigurationContextReady) {
            (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
                .then((c) => {
                    console.log({ c });

                    if (c === undefined) {
                        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(defaultConfiguration)
                        c = defaultConfiguration
                    }

                    document.dir = c.local.direction
                    c.themeOptions.direction = c.local.direction
                    setConfiguration({
                        ...c,
                        theme: createTheme(c.themeOptions, getMuiLocale(c.local.language))
                    });
                    i18n.changeLanguage(c.local.language);

                    setIsConfigurationContextReady(true)
                })
        }
    }, [])


    return { ...configuration, updateTheme, updateLocal, setShowGradientBackground, isConfigurationContextReady }
}
