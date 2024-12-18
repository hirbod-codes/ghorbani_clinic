import { darken, hslToRgb, lighten, useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import type { Calendar, Config, configAPI, LanguageCodes, ThemeMode, ThemeOptions, TimeZone } from '../../../Electron/Configuration/renderer.d';
import { hslToHex, shadeColor } from '../../Lib/colors';

export function useConfigurationHook() {
    const { i18n } = useTranslation();

    const defaultConfiguration: Config = {
        local: {
            calendar: 'Persian',
            zone: 'Asia/Tehran',
            language: 'en',
            direction: 'ltr'
        },
        themeOptions: {
            mode: useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light',
            colors: {
                black: 'hsl(222, 50%, 10%)',
                white: 'hsl(0, 0%, 100%)',
                background: 'hsl(0, 0%, 100%)',
                foreground: 'hsl(222.2, 47.4%, 11.2%)',
                muted: 'hsl(210, 40%, 96.1%)',
                'muted-foreground': 'hsl(215.4, 16.3%, 46.9%)',
                popover: 'hsl(0, 0%, 100%)',
                'popover-foreground': 'hsl(222.2, 47.4%, 11.2%)',
                border: 'hsl(214.3, 31.8%, 91.4%)',
                input: 'hsl(214.3, 31.8%, 91.4%)',
                card: 'hsl(0, 0%, 100%)',
                'card-foreground': 'hsl(222.2, 47.4%, 11.2%)',
                primary: 'hsl(222,, 65%, 29%)',
                'primary-foreground': 'hsl(210, 40%, 98%)',
                secondary: 'hsl(210, 40%, 96.1%)',
                'secondary-foreground': 'hsl(222.2, 47.4%, 11.2%)',
                accent: 'hsl(210, 40%, 96.1%)',
                'accent-foreground': 'hsl(222.2, 47.4%, 11.2%)',
                destructive: 'hsl(0, 100%, 50%)',
                'destructive-foreground': 'hsl(210, 40%, 98%)',
                ring: 'hsl(215, 20.2%, 65.1%)',
            },
            radius: '0.5rem',
        },
    };

    const [configuration, setConfiguration] = useState<Config>(defaultConfiguration);

    const updateTheme = (mode?: ThemeMode, themeOptions?: ThemeOptions) => {
        console.log('updateTheme', { mode, themeOptions })
        mode = mode ?? configuration.themeOptions.mode;
        themeOptions = themeOptions ?? configuration.themeOptions;

        configuration.themeOptions = themeOptions
        configuration.themeOptions.mode = mode;

        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(configuration)

        setConfiguration({ ...configuration })
    };
    const updateLocal = async (languageCode?: LanguageCodes, calendar?: Calendar, direction?: 'rtl' | 'ltr', zone?: TimeZone) => {
        direction = direction ?? configuration.local.direction
        zone = zone ?? configuration.local.zone
        languageCode = languageCode ?? configuration.local.language
        calendar = calendar ?? configuration.local.calendar

        const c: Config = {
            ...configuration,
            local: {
                ...configuration.local,
                language: languageCode,
                direction,
                zone,
                calendar,
            },
        };

        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

        await i18n.changeLanguage(c.local.language);

        document.dir = direction;

        setConfiguration(c);
    };
    const setShowGradientBackground = (v: boolean) => {
        const c = { ...configuration, showGradientBackground: v };

        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(c)

        setConfiguration({ ...configuration, showGradientBackground: Boolean(v) });
    }

    const updateCssVars = (mode: ThemeMode) => {
        document.documentElement.style.setProperty('--background', mode === 'dark' ? configuration.themeOptions.colors.black : configuration.themeOptions.colors.white)
        document.documentElement.style.setProperty('--foreground', mode === 'dark' ? configuration.themeOptions.colors.white : configuration.themeOptions.colors.black)

        for (const key in configuration.themeOptions.colors)
            if (key === 'background' || key === 'foreground')
                continue
            else
                document.documentElement.style.setProperty('--' + key, mode === 'dark' ? shadeColor(configuration.themeOptions.colors[key], 0.5) : shadeColor(configuration.themeOptions.colors[key], 1.5))
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
                    updateCssVars(configuration.themeOptions.mode)
                    setConfiguration(c);
                    i18n.changeLanguage(c.local.language);
                    setIsConfigurationContextReady(true)
                })
        }
    }, [])

    useEffect(() => {
        updateCssVars(configuration.themeOptions.mode)
    }, [configuration.themeOptions.colors])

    return { ...configuration, updateTheme, updateLocal, setShowGradientBackground, isConfigurationContextReady }
}
