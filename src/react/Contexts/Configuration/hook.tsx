import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import type { Calendar, Config, configAPI, LanguageCodes, ThemeMode, ThemeOptions, TimeZone } from '../../../Electron/Configuration/renderer.d';
import { shadeColor, stringify, toHsl } from '../../Lib/Colors';
import { Color } from '../../Lib/Colors';

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
                black: 'hsl(222, 50%, 10%)',
                white: 'hsl(0, 0%, 100%)',
                background: 'hsl(0, 0%, 100%)',
                foreground: 'hsl(222.2, 47.4%, 11.2%)',
                darkBackground: 'hsl(222.2, 47.4%, 11.2%)',
                darkForeground: 'hsl(0, 0%, 100%)',
                lightBackground: 'hsl(0, 0%, 100%)',
                lightForeground: 'hsl(222.2, 47.4%, 11.2%)',
                muted: 'hsl(210, 40%, 96.1%)',
                'muted-foreground': 'hsl(215.4, 16.3%, 46.9%)',
                popover: 'hsl(0, 0%, 100%)',
                'popover-foreground': 'hsl(222.2, 47.4%, 11.2%)',
                border: 'hsl(214.3, 31.8%, 91.4%)',
                input: 'hsl(214.3, 31.8%, 91.4%)',
                card: 'hsl(0, 0%, 100%)',
                'card-foreground': 'hsl(222.2, 47.4%, 11.2%)',
                primary: 'hsl(222, 65%, 29%)',
                'primary-foreground': 'hsl(210, 40%, 98%)',
                secondary: 'hsl(210, 40%, 96.1%)',
                'secondary-foreground': 'hsl(222.2, 47.4%, 11.2%)',
                accent: 'hsl(210, 40%, 96.1%)',
                'accent-foreground': 'hsl(222.2, 47.4%, 11.2%)',
                destructive: 'hsl(0, 100%, 50%)',
                'destructive-foreground': 'hsl(210, 40%, 98%)',
                ring: 'hsl(215, 20.2%, 65.1%)',
                'scrollbar-background': 'rgba(0,0,0,0.8)',
            },
        },
    };

    const [configuration, setConfiguration] = useState<Config>(defaultConfiguration);

    const updateTheme = (mode?: ThemeMode, themeOptions?: ThemeOptions) => {
        mode = mode ?? configuration.themeOptions.mode;
        themeOptions = themeOptions ?? configuration.themeOptions;

        configuration.themeOptions = themeOptions;
        configuration.themeOptions.mode = mode
        configuration.themeOptions.colors.background = mode === 'dark' ? configuration.themeOptions.colors.darkBackground : configuration.themeOptions.colors.lightBackground
        configuration.themeOptions.colors.foreground = mode === 'dark' ? configuration.themeOptions.colors.darkForeground : configuration.themeOptions.colors.lightForeground;

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
        const stringifyColorForTailwind = (hsl: Color) => `${hsl.value[0]} ${hsl.value[1]} ${hsl.value[2]}`

        const setCssVar = (k: string, v: string, isColor = false) => document.documentElement.style.setProperty(`--${k}`, isColor ? stringifyColorForTailwind(toHsl(v)) : v)

        setCssVar('radius', options.radius)
        setCssVar('scrollbar-width', options['scrollbar-width'])
        setCssVar('scrollbar-height', options['scrollbar-height'])
        setCssVar('scrollbar-border-radius', options['scrollbar-border-radius'])

        setCssVar('background', mode === 'dark' ? options.colors.darkBackground : options.colors.lightBackground, true)
        setCssVar('foreground', mode === 'dark' ? options.colors.darkForeground : options.colors.lightForeground, true)
        setCssVar('border', mode === 'dark' ? options.colors.darkForeground : options.colors.lightForeground, true)
        setCssVar('input', mode === 'dark' ? options.colors.darkForeground : options.colors.lightForeground, true)

        Object
            .keys(options.colors)
            .filter(f => !['background', 'foreground', 'border', 'input'].includes(f))
            .forEach(key => {
                if (key.includes('foreground'))
                    setCssVar(key, stringify(shadeColor(options.colors[key], mode === 'dark' ? options.foregroundCoefficient : -options.foregroundCoefficient)), true)
                else
                    setCssVar(key, stringify(shadeColor(options.colors[key], mode === 'dark' ? -options.colorCoefficient : options.colorCoefficient)), true)
            })
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
