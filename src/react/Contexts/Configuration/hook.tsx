import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import type { Calendar, Config, configAPI, LanguageCodes, ThemeMode, ThemeOptions, TimeZone } from '../../../Electron/Configuration/renderer.d';
import { ColorStatic } from '../../Lib/Colors/ColorStatic';
import { RGB } from '../../Lib/Colors/RGB';

function generatePalette(): ThemeOptions {
    const palette = {
        primary: '#769cdf',
        secondary: '#8991a2',
        tertiary: '#a288a6',
        info: '#006ddb',
        success: '#2cb560',
        warning: '#ddb300',
        error: '#ff5449',
        natural: '#919093',
        naturalVariant: '#8e9098',
    }
    return {
        mode: window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light',
        radius: '0.5rem',
        'scrollbar-width': '0.5rem',
        'scrollbar-height': '0.5rem',
        'scrollbar-border-radius': '5px',
        foregroundCoefficient: 1,
        colorCoefficient: 0.3,
        colors: {
            palette: Object.fromEntries(
                ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
                    .map(p => [p, {
                        main: palette[p],
                        light: {
                            main: (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(40); return c.toHex() })(),
                            foreground: (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(100); return c.toHex() })(),
                            container: (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(90); return c.toHex() })(),
                            'container-foreground': (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(10); return c.toHex() })(),
                            fixed: (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(90); return c.toHex() })(),
                            'fixed-dim': (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(60); return c.toHex() })(),
                            'fixed-foreground': (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(10); return c.toHex() })(),
                            'fixed-foreground-variant': (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(30); return c.toHex() })(),
                        },
                        'light-shades': {
                            main: 40,
                            foreground: 100,
                            container: 90,
                            'container-foreground': 10,
                            fixed: 90,
                            'fixed-dim': 60,
                            'fixed-foreground': 10,
                            'fixed-foreground-variant': 30,
                        },
                        dark: {
                            main: (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(80); return c.toHex() })(),
                            foreground: (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(20); return c.toHex() })(),
                            container: (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(20); return c.toHex() })(),
                            'container-foreground': (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(90); return c.toHex() })(),
                            fixed: (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(90); return c.toHex() })(),
                            'fixed-dim': (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(60); return c.toHex() })(),
                            'fixed-foreground': (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(10); return c.toHex() })(),
                            'fixed-foreground-variant': (() => { let c = RGB.fromHex(palette[p]); c.shadeColor(30); return c.toHex() })(),
                        },
                        'dark-shades': {
                            main: 80,
                            foreground: 20,
                            container: 20,
                            'container-foreground': 90,
                            fixed: 90,
                            'fixed-dim': 60,
                            'fixed-foreground': 10,
                            'fixed-foreground-variant': 30,
                        },
                    }
                    ])
            ) as any,
            scrollbar: '#ffffff',
            surface: {
                light: {
                    main: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(98); return c.toHex() })(),
                    dim: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(87); return c.toHex() })(),
                    bright: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(98); return c.toHex() })(),
                    'container-highest': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(90); return c.toHex() })(),
                    'container-high': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(92); return c.toHex() })(),
                    'container': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(94); return c.toHex() })(),
                    'container-low': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(96); return c.toHex() })(),
                    'container-lowest': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(100); return c.toHex() })(),
                    foreground: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(10); return c.toHex() })(),
                    'foreground-variant': (() => { let c = RGB.fromHex(palette.naturalVariant); c.shadeColor(30); return c.toHex() })(),
                    inverse: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(20); return c.toHex() })(),
                    'inverse-foreground': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(95); return c.toHex() })(),
                    'inverse-primary-foreground': (() => { let c = RGB.fromHex(palette.primary); c.shadeColor(80); return c.toHex() })(),
                },
                'light-shades': {
                    main: 98,
                    dim: 87,
                    bright: 98,
                    'container-highest': 90,
                    'container-high': 92,
                    'container': 94,
                    'container-low': 96,
                    'container-lowest': 100,
                    foreground: 10,
                    'foreground-variant': 30,
                    inverse: 20,
                    'inverse-foreground': 95,
                    'inverse-primary-foreground': 80,
                },
                dark: {
                    main: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(6); return c.toHex() })(),
                    dim: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(6); return c.toHex() })(),
                    bright: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(24); return c.toHex() })(),
                    'container-highest': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(24); return c.toHex() })(),
                    'container-high': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(17); return c.toHex() })(),
                    'container': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(12); return c.toHex() })(),
                    'container-low': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(10); return c.toHex() })(),
                    'container-lowest': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(4); return c.toHex() })(),
                    foreground: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(90); return c.toHex() })(),
                    'foreground-variant': (() => { let c = RGB.fromHex(palette.naturalVariant); c.shadeColor(90); return c.toHex() })(),
                    inverse: (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(90); return c.toHex() })(),
                    'inverse-foreground': (() => { let c = RGB.fromHex(palette.natural); c.shadeColor(20); return c.toHex() })(),
                    'inverse-primary-foreground': (() => { let c = RGB.fromHex(palette.primary); c.shadeColor(40); return c.toHex() })(),
                },
                'dark-shades': {
                    main: 98,
                    dim: 87,
                    bright: 98,
                    'container-highest': 90,
                    'container-high': 92,
                    'container': 94,
                    'container-low': 96,
                    'container-lowest': 100,
                    foreground: 10,
                    'foreground-variant': 30,
                    inverse: 20,
                    'inverse-foreground': 95,
                    'inverse-primary-foreground': 80,
                },
            },
            outline: {
                light: {
                    main: (() => { let c = RGB.fromHex(palette.naturalVariant); c.shadeColor(50); return c.toHex() })(),
                    variant: (() => { let c = RGB.fromHex(palette.naturalVariant); c.shadeColor(80); return c.toHex() })(),
                },
                'light-shades': {
                    main: 50,
                    variant: 80,
                },
                dark: {
                    main: (() => { let c = RGB.fromHex(palette.naturalVariant); c.shadeColor(60); return c.toHex() })(),
                    variant: (() => { let c = RGB.fromHex(palette.naturalVariant); c.shadeColor(30); return c.toHex() })(),
                },
                'dark-shades': {
                    main: 60,
                    variant: 30,
                },
            }
        }
    }
}

export function useConfigurationHook() {
    console.log(generatePalette())
    const defaultConfiguration: Config = {
        local: {
            calendar: 'Persian',
            zone: 'Asia/Tehran',
            language: 'en',
            direction: 'ltr'
        },
        themeOptions: {
            mode: window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light',
            "radius": "0.5rem",
            "scrollbar-width": "0.5rem",
            "scrollbar-height": "0.5rem",
            "scrollbar-border-radius": "5px",
            "foregroundCoefficient": 1,
            "colorCoefficient": 0.3,
            "colors": {
                "palette": {
                    "primary": {
                        "main": "#769cdf",
                        "light": {
                            "main": "#5e7db2ff",
                            "foreground": "#ffffffff",
                            "container": "#e4ebf9ff",
                            "container-foreground": "#181f2dff",
                            "fixed": "#e4ebf9ff",
                            "fixed-dim": "#91b0e5ff",
                            "fixed-foreground": "#181f2dff",
                            "fixed-foreground-variant": "#475e86ff"
                        },
                        "light-shades": {
                            "main": 40,
                            "foreground": 100,
                            "container": 90,
                            "container-foreground": 10,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        },
                        "dark": {
                            "main": "#c8d7f2ff",
                            "foreground": "#2f3e59ff",
                            "container": "#2f3e59ff",
                            "container-foreground": "#e4ebf9ff",
                            "fixed": "#e4ebf9ff",
                            "fixed-dim": "#91b0e5ff",
                            "fixed-foreground": "#181f2dff",
                            "fixed-foreground-variant": "#475e86ff"
                        },
                        "dark-shades": {
                            "main": 80,
                            "foreground": 20,
                            "container": 20,
                            "container-foreground": 90,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        }
                    },
                    "secondary": {
                        "main": "#8991a2",
                        "light": {
                            "main": "#6e7482ff",
                            "foreground": "#ffffffff",
                            "container": "#e7e9ecff",
                            "container-foreground": "#1b1d20ff",
                            "fixed": "#e7e9ecff",
                            "fixed-dim": "#a1a7b5ff",
                            "fixed-foreground": "#1b1d20ff",
                            "fixed-foreground-variant": "#525761ff"
                        },
                        "light-shades": {
                            "main": 40,
                            "foreground": 100,
                            "container": 90,
                            "container-foreground": 10,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        },
                        "dark": {
                            "main": "#d0d3daff",
                            "foreground": "#373a41ff",
                            "container": "#373a41ff",
                            "container-foreground": "#e7e9ecff",
                            "fixed": "#e7e9ecff",
                            "fixed-dim": "#a1a7b5ff",
                            "fixed-foreground": "#1b1d20ff",
                            "fixed-foreground-variant": "#525761ff"
                        },
                        "dark-shades": {
                            "main": 80,
                            "foreground": 20,
                            "container": 20,
                            "container-foreground": 90,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        }
                    },
                    "tertiary": {
                        "main": "#a288a6",
                        "light": {
                            "main": "#826d85ff",
                            "foreground": "#ffffffff",
                            "container": "#ece7edff",
                            "container-foreground": "#201b21ff",
                            "fixed": "#ece7edff",
                            "fixed-dim": "#b5a0b8ff",
                            "fixed-foreground": "#201b21ff",
                            "fixed-foreground-variant": "#615264ff"
                        },
                        "light-shades": {
                            "main": 40,
                            "foreground": 100,
                            "container": 90,
                            "container-foreground": 10,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        },
                        "dark": {
                            "main": "#dacfdbff",
                            "foreground": "#413642ff",
                            "container": "#413642ff",
                            "container-foreground": "#ece7edff",
                            "fixed": "#ece7edff",
                            "fixed-dim": "#b5a0b8ff",
                            "fixed-foreground": "#201b21ff",
                            "fixed-foreground-variant": "#615264ff"
                        },
                        "dark-shades": {
                            "main": 80,
                            "foreground": 20,
                            "container": 20,
                            "container-foreground": 90,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        }
                    },
                    "info": {
                        "main": "#006ddb",
                        "light": {
                            "main": "#0057afff",
                            "foreground": "#ffffffff",
                            "container": "#cce2f8ff",
                            "container-foreground": "#00162cff",
                            "fixed": "#cce2f8ff",
                            "fixed-dim": "#338ae2ff",
                            "fixed-foreground": "#00162cff",
                            "fixed-foreground-variant": "#004183ff"
                        },
                        "light-shades": {
                            "main": 40,
                            "foreground": 100,
                            "container": 90,
                            "container-foreground": 10,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        },
                        "dark": {
                            "main": "#99c5f1ff",
                            "foreground": "#002c58ff",
                            "container": "#002c58ff",
                            "container-foreground": "#cce2f8ff",
                            "fixed": "#cce2f8ff",
                            "fixed-dim": "#338ae2ff",
                            "fixed-foreground": "#00162cff",
                            "fixed-foreground-variant": "#004183ff"
                        },
                        "dark-shades": {
                            "main": 80,
                            "foreground": 20,
                            "container": 20,
                            "container-foreground": 90,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        }
                    },
                    "success": {
                        "main": "#2cb560",
                        "light": {
                            "main": "#23914dff",
                            "foreground": "#ffffffff",
                            "container": "#d5f0dfff",
                            "container-foreground": "#092413ff",
                            "fixed": "#d5f0dfff",
                            "fixed-dim": "#56c480ff",
                            "fixed-foreground": "#092413ff",
                            "fixed-foreground-variant": "#1a6d3aff"
                        },
                        "light-shades": {
                            "main": 40,
                            "foreground": 100,
                            "container": 90,
                            "container-foreground": 10,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        },
                        "dark": {
                            "main": "#abe1bfff",
                            "foreground": "#124826ff",
                            "container": "#124826ff",
                            "container-foreground": "#d5f0dfff",
                            "fixed": "#d5f0dfff",
                            "fixed-dim": "#56c480ff",
                            "fixed-foreground": "#092413ff",
                            "fixed-foreground-variant": "#1a6d3aff"
                        },
                        "dark-shades": {
                            "main": 80,
                            "foreground": 20,
                            "container": 20,
                            "container-foreground": 90,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        }
                    },
                    "warning": {
                        "main": "#ddb300",
                        "light": {
                            "main": "#b18f00ff",
                            "foreground": "#ffffffff",
                            "container": "#f8f0ccff",
                            "container-foreground": "#2c2400ff",
                            "fixed": "#f8f0ccff",
                            "fixed-dim": "#e4c233ff",
                            "fixed-foreground": "#2c2400ff",
                            "fixed-foreground-variant": "#856b00ff"
                        },
                        "light-shades": {
                            "main": 40,
                            "foreground": 100,
                            "container": 90,
                            "container-foreground": 10,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        },
                        "dark": {
                            "main": "#f1e199ff",
                            "foreground": "#584800ff",
                            "container": "#584800ff",
                            "container-foreground": "#f8f0ccff",
                            "fixed": "#f8f0ccff",
                            "fixed-dim": "#e4c233ff",
                            "fixed-foreground": "#2c2400ff",
                            "fixed-foreground-variant": "#856b00ff"
                        },
                        "dark-shades": {
                            "main": 80,
                            "foreground": 20,
                            "container": 20,
                            "container-foreground": 90,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        }
                    },
                    "error": {
                        "main": "#ff5449",
                        "light": {
                            "main": "#cc433aff",
                            "foreground": "#ffffffff",
                            "container": "#ffdddbff",
                            "container-foreground": "#33110fff",
                            "fixed": "#ffdddbff",
                            "fixed-dim": "#ff766dff",
                            "fixed-foreground": "#33110fff",
                            "fixed-foreground-variant": "#99322cff"
                        },
                        "light-shades": {
                            "main": 40,
                            "foreground": 100,
                            "container": 90,
                            "container-foreground": 10,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        },
                        "dark": {
                            "main": "#ffbbb6ff",
                            "foreground": "#66221dff",
                            "container": "#66221dff",
                            "container-foreground": "#ffdddbff",
                            "fixed": "#ffdddbff",
                            "fixed-dim": "#ff766dff",
                            "fixed-foreground": "#33110fff",
                            "fixed-foreground-variant": "#99322cff"
                        },
                        "dark-shades": {
                            "main": 80,
                            "foreground": 20,
                            "container": 20,
                            "container-foreground": 90,
                            "fixed": 90,
                            "fixed-dim": 60,
                            "fixed-foreground": 10,
                            "fixed-foreground-variant": 30
                        }
                    }
                },
                "scrollbar": "#ffffff",
                "surface": {
                    "light": {
                        "main": "#fbfbfbff",
                        "dim": "#e2e2e3ff",
                        "bright": "#fbfbfbff",
                        "container-highest": "#e9e9e9ff",
                        "container-high": "#ededeeff",
                        "container": "#f2f2f2ff",
                        "container-low": "#f6f6f6ff",
                        "container-lowest": "#ffffffff",
                        "foreground": "#1d1d1dff",
                        "foreground-variant": "#55565bff",
                        "inverse": "#3a3a3bff",
                        "inverse-foreground": "#f4f4f4ff",
                        "inverse-primary-foreground": "#c8d7f2ff"
                    },
                    "light-shades": {
                        "main": 98,
                        "dim": 87,
                        "bright": 98,
                        "container-highest": 90,
                        "container-high": 92,
                        "container": 94,
                        "container-low": 96,
                        "container-lowest": 100,
                        "foreground": 10,
                        "foreground-variant": 30,
                        "inverse": 20,
                        "inverse-foreground": 95,
                        "inverse-primary-foreground": 80
                    },
                    "dark": {
                        "main": "#111112ff",
                        "dim": "#111112ff",
                        "bright": "#464547ff",
                        "container-highest": "#464547ff",
                        "container-high": "#313132ff",
                        "container": "#232323ff",
                        "container-low": "#1d1d1dff",
                        "container-lowest": "#0c0c0cff",
                        "foreground": "#e9e9e9ff",
                        "foreground-variant": "#e8e9eaff",
                        "inverse": "#e9e9e9ff",
                        "inverse-foreground": "#3a3a3bff",
                        "inverse-primary-foreground": "#5e7db2ff"
                    },
                    "dark-shades": {
                        "main": 98,
                        "dim": 87,
                        "bright": 98,
                        "container-highest": 90,
                        "container-high": 92,
                        "container": 94,
                        "container-low": 96,
                        "container-lowest": 100,
                        "foreground": 10,
                        "foreground-variant": 30,
                        "inverse": 20,
                        "inverse-foreground": 95,
                        "inverse-primary-foreground": 80
                    }
                },
                "outline": {
                    "light": {
                        "main": "#8e9098ff",
                        "variant": "#d2d3d6ff"
                    },
                    "light-shades": {
                        "main": 50,
                        "variant": 80
                    },
                    "dark": {
                        "main": "#a5a6adff",
                        "variant": "#55565bff"
                    },
                    "dark-shades": {
                        "main": 60,
                        "variant": 30
                    }
                }
            }
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
            .keys(options.colors.palette)
            .forEach(k => {
                Object
                    .keys(options.colors.palette[k][mode])
                    .forEach((kk) => {
                        if (kk === 'main')
                            setCssVar(k, options.colors.palette[k][mode][kk], true);
                        else
                            setCssVar(`${k}-${kk}`, options.colors.palette[k][mode][kk], true);
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
