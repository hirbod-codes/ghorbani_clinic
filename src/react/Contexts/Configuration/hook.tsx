import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import type { Calendar, Config, configAPI, LanguageCodes, ThemeMode, ThemeOptions, TimeZone } from '../../../Electron/Configuration/renderer.d';
import { IColor } from '../../Lib/Colors/IColor';
import { ColorStatic } from '../../Lib/Colors/ColorStatic';
import { HSV } from '../../Lib/Colors/HSV';
import { HSL } from '../../Lib/Colors/HSL';

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
            mode: window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light',
            radius: '0.5rem',
            'scrollbar-width': '0.5rem',
            'scrollbar-height': '0.5rem',
            'scrollbar-border-radius': '5px',
            foregroundCoefficient: 1,
            colorCoefficient: 0.3,
            colors: {
                border: {
                    main: 'hsl(214.3, 31.8%, 91.4%)',
                    dark: 'hsl(214.3, 31.8%, 91.4%)',
                    light: 'hsl(214.3, 31.8%, 91.4%)',
                },

                input: {
                    main: 'hsl(214.3, 31.8%, 91.4%)',
                    dark: 'hsl(214.3, 31.8%, 91.4%)',
                    light: 'hsl(214.3, 31.8%, 91.4%)',
                },

                scrollbar: {
                    main: 'rgba(0,0,0,0.8)',
                    dark: 'rgba(0,0,0,0.8)',
                    light: 'rgba(0,0,0,0.8)',
                },

                background: {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(0, 0%, 100%)',
                },

                foreground: {
                    main: 'hsl(0, 0%, 100%)',
                    dark: 'hsl(0, 0%, 100%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                primary: {
                    main: 'hsl(183, 47%, 46%)',
                    dark: 'hsl(183, 47%, 46%)',
                    light: 'hsl(183, 47%, 46%)',
                },

                "primary-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "primary-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "primary-container": {
                    main: 'hsl(183, 68%, 65%)',
                    dark: 'hsl(183, 68%, 65%)',
                    light: 'hsl(183, 68%, 65%)',
                },

                "primary-container-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "primary-container-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                secondary: {
                    main: 'hsl(158, 90%, 45%)',
                    dark: 'hsl(158, 90%, 45%)',
                    light: 'hsl(158, 90%, 45%)',
                },

                "secondary-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "secondary-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "secondary-container": {
                    main: 'hsl(158, 67%, 63%)',
                    dark: 'hsl(158, 67%, 63%)',
                    light: 'hsl(158, 67%, 63%)',
                },

                "secondary-container-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "secondary-container-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                tertiary: {
                    main: 'hsl(52, 65%, 52%)',
                    dark: 'hsl(52, 65%, 52%)',
                    light: 'hsl(52, 65%, 52%)',
                },

                "tertiary-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "tertiary-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                info: {
                    main: 'hsl(218, 93%, 56%)',
                    dark: 'hsl(218, 93%, 56%)',
                    light: 'hsl(218, 93%, 56%)',
                },

                "info-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "info-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                success: {
                    main: 'hsl(134, 82%, 54%)',
                    dark: 'hsl(134, 82%, 54%)',
                    light: 'hsl(134, 82%, 54%)',
                },

                "success-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "success-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                warning: {
                    main: 'hsl(0, 100%, 50%)',
                    dark: 'hsl(0, 100%, 50%)',
                    light: 'hsl(0, 100%, 50%)',
                },

                "warning-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "warning-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                error: {
                    main: 'hsl(0, 100%, 50%)',
                    dark: 'hsl(0, 100%, 50%)',
                    light: 'hsl(0, 100%, 50%)',
                },

                "error-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "error-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                muted: {
                    main: 'hsl(210, 40%, 96.1%)',
                    dark: 'hsl(210, 40%, 96.1%)',
                    light: 'hsl(210, 40%, 96.1%)',
                },

                "muted-background": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },

                "muted-foreground": {
                    main: 'hsl(222.2, 47.4%, 11.2%)',
                    dark: 'hsl(222.2, 47.4%, 11.2%)',
                    light: 'hsl(222.2, 47.4%, 11.2%)',
                },
            },
        },
    };

    const [configuration, setConfiguration] = useState<Config>(defaultConfiguration);

    const updateTheme = (mode?: ThemeMode, themeOptions?: ThemeOptions) => {
        mode = mode ?? configuration.themeOptions.mode;
        themeOptions = themeOptions ?? configuration.themeOptions;

        configuration.themeOptions = themeOptions;
        configuration.themeOptions.mode = mode;

        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig(configuration)

        setConfiguration({ ...configuration, themeOptions: { ...configuration.themeOptions } })
        updateCssVars(mode, configuration.themeOptions)
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

    const updateCssVars = (mode: ThemeMode, options: ThemeOptions) => {
        const stringifyColorForTailwind = (color: string) => {
            let hsl = ColorStatic.parse(color).toHsl()
            return `${hsl.getHue()} ${hsl.getSaturation()}% ${hsl.getLightness()}%`
        }

        const setCssVar = (k: string, v: string, isColor = false) => document.documentElement.style.setProperty(`--${k}`, isColor ? stringifyColorForTailwind(v) : v)

        setCssVar('radius', options.radius)
        setCssVar('scrollbar-width', options['scrollbar-width'])
        setCssVar('scrollbar-height', options['scrollbar-height'])
        setCssVar('scrollbar-border-radius', options['scrollbar-border-radius'])

        Object
            .keys(options.colors)
            .forEach(key => setCssVar(key, options.colors[key][mode], true))
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
                    updateCssVars(c.themeOptions.mode, c.themeOptions)
                    setConfiguration(c);
                    i18n.changeLanguage(c.local.language);
                    setIsConfigurationContextReady(true)
                })
        }
    }, [])

    return { ...configuration, updateTheme, updateLocal, setShowGradientBackground, isConfigurationContextReady }
}
