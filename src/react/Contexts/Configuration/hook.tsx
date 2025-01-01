import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import type { Calendar, Config, configAPI, LanguageCodes, ThemeMode, ThemeOptions, TimeZone } from '../../../Electron/Configuration/renderer.d';
import { ColorStatic } from '../../Lib/Colors/ColorStatic';
import { argbFromHex } from '@material/material-color-utilities';

export function useConfigurationHook() {
    // console.log('####################################',argbFromHex('#0000ff'))

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
                    main: '#000000',
                    dark: '#ffffff',
                    light: '#000000',
                },

                input: {
                    main: '#000000',
                    dark: '#ffffff',
                    light: '#000000',
                },

                scrollbar: {
                    main: 'rgba(0,0,0,0.8)',
                    dark: 'rgba(0,0,0,0.8)',
                    light: 'rgba(0,0,0,0.8)',
                },

                background: {
                    main: '#ffffff',
                    dark: '#000000',
                    light: '#ffffff',
                },

                foreground: {
                    main: '#000000',
                    dark: '#ffffff',
                    light: '#000000',
                },

                primary: {
                    main: '#415f91',
                    dark: '#aac7ff',
                    light: '#415f91',
                },

                "primary-foreground": {
                    main: '#ffffff',
                    dark: '#0a305f',
                    light: '#ffffff',
                },

                "primary-container": {
                    main: '#d6e3ff',
                    dark: '#284777',
                    light: '#d6e3ff',
                },

                "primary-container-foreground": {
                    main: '#001b3e',
                    dark: '#d6e3ff',
                    light: '#001b3e',
                },

                secondary: {
                    main: '#3e5f90',
                    dark: '#a8c8ff',
                    light: '#3e5f90',
                },

                "secondary-foreground": {
                    main: '#ffffff',
                    dark: '#05305f',
                    light: '#ffffff',
                },

                "secondary-container": {
                    main: '#d5e3ff',
                    dark: '#254777',
                    light: '#d5e3ff',
                },

                "secondary-container-foreground": {
                    main: '#001b3c',
                    dark: '#d5e3ff',
                    light: '#001b3c',
                },

                tertiary: {
                    main: '#705575',
                    dark: '#ddbce0',
                    light: '#705575',
                },

                "tertiary-foreground": {
                    main: '#ffffff',
                    dark: '#3f2844',
                    light: '#ffffff',
                },

                "tertiary-container": {
                    main: '#fad8fd',
                    dark: '#573e5c',
                    light: '#fad8fd',
                },

                "tertiary-container-foreground": {
                    main: '#28132e',
                    dark: '#fad8fd',
                    light: '#28132e',
                },

                info: {
                    main: '#3e5f90',
                    dark: '#aac7ff',
                    light: '#3e5f90',
                },

                "info-foreground": {
                    main: '#ffffff',
                    dark: '#0a305f',
                    light: '#ffffff',
                },

                success: {
                    main: '#00ff00',
                    dark: '#00ff00',
                    light: '#00ff00',
                },

                "success-foreground": {
                    main: '#ffffff',
                    dark: '#ffffff',
                    light: '#ffffff',
                },

                warning: {
                    main: '#ddb300',
                    dark: '#ddb300',
                    light: '#ddb300',
                },

                "warning-foreground": {
                    main: '#ffffff',
                    dark: '#ffffff',
                    light: '#ffffff',
                },

                error: {
                    main: '#ba1a1a',
                    dark: '#ffb4ab',
                    light: '#ba1a1a',
                },

                "error-foreground": {
                    main: '#ffffff',
                    dark: '#690005',
                    light: '#ffffff',
                },

                "error-container": {
                    main: '#ffdad6',
                    dark: '#93000a',
                    light: '#ffdad6',
                },

                "error-container-foreground": {
                    main: '#410002',
                    dark: '#ffdad6',
                    light: '#410002',
                },

                muted: {
                    main: '#b7b7b7',
                    dark: '#b7b7b7',
                    light: '#b7b7b7',
                },

                "muted-foreground": {
                    main: '#000000',
                    dark: '#000000',
                    light: '#000000',
                },
            },
        },
    }

    const { i18n } = useTranslation();

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
