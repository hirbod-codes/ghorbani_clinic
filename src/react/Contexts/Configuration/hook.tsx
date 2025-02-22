import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import type { Calendar, Config, configAPI, LanguageCodes, ThemeMode, ThemeOptions, TimeZone } from '../../../Electron/Configuration/renderer.d';
import { ColorStatic } from '../../Lib/Colors/ColorStatic';
import { defaultTheme } from './DefaultTheme';

export function useConfigurationHook() {
    const defaultConfiguration: Config = {
        local: {
            calendar: 'Persian',
            zone: 'Asia/Tehran',
            language: 'en',
            direction: 'ltr'
        },
        themeOptions: {
            ...defaultTheme,
            mode: window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light',
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
        setCssVar('scrollbar-border-radius', options['scrollbar-border-radius']);

        ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
            .forEach(k => {
                Object
                    .keys(options.colors[k][mode])
                    .forEach((kk) => {
                        if (kk === 'main')
                            setCssVar(k, options.colors[k][mode][kk], true);
                        else
                            setCssVar(`${k}-${kk}`, options.colors[k][mode][kk], true);
                    })
            })

        Object
            .keys(options.colors.surface[mode])
            .forEach(k => {
                if (k === 'main')
                    setCssVar('surface', options.colors.surface[mode][k], true);
                else
                    setCssVar(`surface-${k}`, options.colors.surface[mode][k], true);
            })

        Object
            .keys(options.colors.outline[mode])
            .forEach(k => {
                if (k === 'main')
                    setCssVar('outline', options.colors.outline[mode][k], true);
                else
                    setCssVar(`outline-${k}`, options.colors.outline[mode][k], true);
            })

        setCssVar('scrollbar', options.colors.scrollbar, true);
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
