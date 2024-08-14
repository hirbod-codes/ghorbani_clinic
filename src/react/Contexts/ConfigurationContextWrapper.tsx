import { CssBaseline, Modal, PaletteMode, Paper, Slide, Theme, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { useState, useRef, ReactNode } from 'react';
import { Localization, enUS } from '@mui/material/locale';
import { useTranslation } from "react-i18next";
import type { Locale } from '../Lib/Localization';
import type { Calendar, TimeZone } from '../Lib/DateTime';
import { ConfigurationContext, ConfigurationData, ConfigurationStorableData } from './ConfigurationContext';
import { getLocale, getReactLocale } from '../Lib/helpers';
import type { configAPI } from '../../Electron/Configuration/renderer/configAPI';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import DbSettingsForm from '../Components/Settings/DbSettingsForm';

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
    const defaultConfiguration: ConfigurationData = {
        locale: getInitialLocale,
        themeMode: initialThemeMode,
        theme: createTheme(
            {
                palette: {
                    mode: initialThemeMode,
                },
                direction: getInitialLocale.direction
            },
            getReactLocale(i18n)
        )
    };

    const [configuration, setConfiguration] = useState<ConfigurationData>(defaultConfiguration);
    const [showDbConfigurationModal, setShowDbConfigurationModal] = useState<boolean>(false);

    const persistConfigurationData = async (data: ConfigurationStorableData) => {
        const config = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig();
        (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig({ ...config, configuration: data });
    };
    const updateThemeCore = (theme: Theme) => {
        setConfiguration({
            ...configuration,
            themeMode: theme.palette.mode,
            theme: theme
        });
    }
    const updateTheme = (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => {
        setConfiguration({
            ...configuration,
            themeMode: mode,
            theme: createTheme(
                {
                    palette: {
                        mode: mode,
                    },
                    direction: direction
                },
                locale
            )
        });
        persistConfigurationData({ locale: configuration.locale, themeMode: mode });
        document.dir = direction;
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
            themeMode: configuration.theme.palette.mode,
            theme: createTheme(
                {
                    palette: {
                        mode: configuration.theme.palette.mode,
                    },
                    direction: direction
                },
                reactLocale
            )
        };
        setConfiguration(conf);
        i18n.changeLanguage(getLocale(reactLocale));
        document.dir = direction;
        persistConfigurationData({ locale: conf.locale, themeMode: conf.themeMode });
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
        persistConfigurationData({ locale: { ...configuration.locale, zone: configuration.locale.zone }, themeMode: configuration.themeMode });
    };

    const hasFetchedConfig = useRef(false);
    if (!hasFetchedConfig.current) {
        console.log('hasFetchedConfig-readConfig', 'start');
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                console.log('hasFetchedConfig-readConfig', 'c', c);

                if (c && !c.mongodb) {
                    setShowDbConfigurationModal(true);
                } else if (c && c.configuration) {
                    i18n.changeLanguage(c.configuration.locale.code);
                    document.dir = c.configuration.locale.direction;
                    setConfiguration({
                        ...c.configuration,
                        theme: createTheme(
                            {
                                palette: {
                                    mode: c.configuration.themeMode,
                                },
                                direction: c.configuration.locale.direction
                            },
                            getReactLocale(c.configuration.locale.code)
                        )
                    });
                } else {
                    setConfiguration(defaultConfiguration);
                    persistConfigurationData({ locale: defaultConfiguration.locale, themeMode: defaultConfiguration.themeMode });
                }

                hasFetchedConfig.current = true;
                console.log('hasFetchedConfig-readConfig', 'end');
            })
            .catch((err) => {
                console.error('hasFetchedConfig-readConfig', 'err', err);

                setConfiguration(defaultConfiguration);
                persistConfigurationData({ locale: defaultConfiguration.locale, themeMode: defaultConfiguration.themeMode });
            });
    }

    console.log('ConfigurationContextWrapper', { configuration })

    return (
        <>
            {hasFetchedConfig &&
                <ConfigurationContext.Provider value={{ get: configuration, set: { updateTheme, updateThemeCore, updateLocale, updateTimeZone }, showDbConfigurationModal, hasFetchedConfig: hasFetchedConfig.current }}>
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
