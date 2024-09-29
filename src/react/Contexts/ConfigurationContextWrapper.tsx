import { CssBaseline, Modal, PaletteMode, Paper, SimplePaletteColorOptions, Slide, ThemeOptions, ThemeProvider, createTheme, darken, lighten, rgbToHex, useMediaQuery } from '@mui/material';
import { useState, useRef, ReactNode, useEffect } from 'react';
import { Localization, enUS } from '@mui/material/locale';
import { useTranslation } from "react-i18next";
import type { Locale } from '../Lib/Localization';
import type { Calendar, TimeZone } from '../Lib/DateTime';
import { ConfigurationContext, ConfigurationData, ConfigurationStorableData } from './ConfigurationContext';
import { getLocale, getReactLocale } from '../Lib/helpers';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import DbSettingsForm from '../Components/Settings/DbSettingsForm';
import { configAPI } from '../../Electron/Configuration/renderer';

// Create rtl cache
const rtlCache = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
    key: 'mui',
});


export function ConfigurationContextWrapper({ children }: { children?: ReactNode; }) {
    const { t, i18n } = useTranslation();

    const initialThemeMode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    const getInitialLocale: Locale = ({ calendar: 'Persian', zone: 'Asia/Tehran', code: getLocale(enUS), direction: 'ltr' });
    const initialThemeOptions: ThemeOptions = {
        palette: {
            mode: initialThemeMode,
        },
        direction: getInitialLocale.direction
    }
    const defaultConfiguration: ConfigurationData = {
        locale: getInitialLocale,
        themeOptions: initialThemeOptions,
        theme: createTheme(initialThemeOptions, getReactLocale(i18n))
    };

    const [configuration, setConfiguration] = useState<ConfigurationData>(defaultConfiguration);
    const [showDbConfigurationModal, setShowDbConfigurationModal] = useState<boolean>(false);

    const persistConfigurationData = async (data: ConfigurationStorableData) => {
        const config = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig();
        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig({ ...config, configuration: data })
    };
    const updateTheme = (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => {
        configuration.themeOptions.palette.mode = mode;
        const primaryMainColor = (configuration.themeOptions.palette.primary as SimplePaletteColorOptions)?.main;
        if (primaryMainColor) {
            (configuration.themeOptions.palette.primary as SimplePaletteColorOptions).main = rgbToHex(mode === 'dark' ? darken(primaryMainColor, 0.125) : lighten(primaryMainColor, 0.125))
        }
        configuration.themeOptions.direction = direction;
        setConfiguration({
            ...configuration,
            theme: createTheme(configuration.themeOptions, locale)
        });
        persistConfigurationData({ locale: configuration.locale, themeOptions: configuration.themeOptions, canvas: configuration.canvas });
        document.dir = direction;
    };
    const replaceTheme = (themeOptions: ThemeOptions) => {
        themeOptions.direction = configuration.locale.direction
        setConfiguration({
            ...configuration,
            themeOptions,
            theme: createTheme(themeOptions, configuration.locale)
        });
        persistConfigurationData({ locale: configuration.locale, themeOptions: configuration.themeOptions, canvas: configuration.canvas });
    };
    const updateLocale = (calendar: Calendar, direction: 'rtl' | 'ltr', reactLocale: Localization) => {
        const conf = {
            ...configuration,
            locale: {
                ...configuration.locale,
                direction,
                code: getLocale(reactLocale),
                calendar,
            },
            theme: createTheme({ ...configuration.themeOptions, direction }, reactLocale)
        };

        setConfiguration(conf);

        i18n.changeLanguage(getLocale(reactLocale));

        document.dir = direction;

        persistConfigurationData({ locale: conf.locale, themeOptions: conf.themeOptions, canvas: conf.canvas });
    };
    const updateTimeZone = (zone: TimeZone) => {
        setConfiguration(
            {
                ...configuration,
                locale: {
                    ...configuration.locale,
                    zone: zone
                }
            });
        persistConfigurationData({ locale: { ...configuration.locale, zone: configuration.locale.zone }, themeOptions: configuration.themeOptions, canvas: configuration.canvas });
    };
    const setShowGradientBackground = (v: boolean) => setConfiguration({ ...configuration, showGradientBackground: v })

    const [hasFetchedConfig, setHasFetchedConfig] = useState<boolean>(false);
    useEffect(() => {
        if (!hasFetchedConfig) {
            console.group('hasFetchedConfig-readConfig');
            (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
                .then((c) => {
                    console.log('hasFetchedConfig-readConfig', 'c', c);

                    try {
                        if (c && !c.mongodb)
                            setShowDbConfigurationModal(true);

                        if (c && c.configuration) {
                            document.dir = c.configuration.locale.direction
                            c.configuration.themeOptions.direction = c.configuration.locale.direction
                            setConfiguration({
                                ...c.configuration,
                                theme: createTheme(c.configuration.themeOptions, getReactLocale(c.configuration.locale.code))
                            });
                            i18n.changeLanguage(c.configuration.locale.code);
                        } else {
                            setConfiguration(defaultConfiguration);
                            persistConfigurationData({ locale: defaultConfiguration.locale, themeOptions: defaultConfiguration.themeOptions, canvas: defaultConfiguration.canvas });
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    setHasFetchedConfig(true)
                    console.groupEnd()
                })
                .catch((err) => {
                    console.error('hasFetchedConfig-readConfig', 'err', err);

                    setConfiguration(defaultConfiguration);
                    persistConfigurationData({ locale: defaultConfiguration.locale, themeOptions: defaultConfiguration.themeOptions, canvas: defaultConfiguration.canvas });
                });
        }
    }, [])

    console.log('-------------ConfigurationContextWrapper', { configuration, showDbConfigurationModal, hasFetchedConfig })

    return (
        <>
            {hasFetchedConfig &&
                <ConfigurationContext.Provider value={{ get: configuration, set: { replaceTheme, updateTheme, updateLocale, updateTimeZone, setShowGradientBackground }, showDbConfigurationModal, hasFetchedConfig }}>
                    <CacheProvider value={configuration.locale.direction === 'rtl' ? rtlCache : ltrCache}>
                        <ThemeProvider theme={configuration.theme}>
                            <CssBaseline enableColorScheme />

                            {children}

                            <Modal open={showDbConfigurationModal} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                                <Slide direction={showDbConfigurationModal ? 'up' : 'down'} in={showDbConfigurationModal} timeout={250}>
                                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                                        <DbSettingsForm />
                                    </Paper>
                                </Slide>
                            </Modal>
                        </ThemeProvider>
                    </CacheProvider>
                </ConfigurationContext.Provider>
            }
        </>
    );
}
