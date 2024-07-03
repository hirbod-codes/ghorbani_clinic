import { CheckOutlined, CloseOutlined, DangerousOutlined } from '@mui/icons-material';

import { CssBaseline, PaletteMode, createTheme, useMediaQuery, ThemeProvider, Modal, Slide, Paper, Snackbar, Alert, Grid } from '@mui/material'
import { useState, useRef } from 'react'
import { Localization, enUS } from '@mui/material/locale';
import { useTranslation } from "react-i18next";

import type { Locale } from './Lib/Localization';
import type { Calendar, TimeZone } from './Lib/DateTime';
import { ConfigurationContext, ConfigurationData, ConfigurationStorableData } from './Contexts/ConfigurationContext';
import { Home } from './Pages/Home';
import { getLocale, getReactLocale } from './Lib/helpers';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import type { configAPI } from '../Electron/Configuration/renderer/configAPI';
import { RendererDbAPI } from '../Electron/Database/handleDbRendererEvents';
import { User } from '../Electron/Database/Models/User';
import { AuthContext } from './Contexts/AuthContext';
import { NavigationContext } from './Lib/NavigationContext';
import { AccessControl } from 'accesscontrol';
import { LoginForm } from './Components/Auth/LoginForm';
import { Result, ResultContext } from './Contexts/ResultContext';
import AppControls from './AppControls';
import { appAPI } from '../Electron/handleAppRendererEvents';
import { MongodbConfig } from '../Electron/Configuration/types';
import DbSettingsForm from './Components/Settings/DbSettingsForm';

// Create rtl cache
const rtlCache = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
    key: 'mui',
});

export function App() {
    const [content, setContent] = useState(<Home />)

    // Localization
    const { t, i18n } = useTranslation();

    const initialThemeMode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    const getInitialLocale: Locale = ({ calendar: 'Persian', zone: 'Asia/Tehran', code: getLocale(enUS), direction: 'ltr' })
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
    }

    const [configuration, setConfiguration] = useState<ConfigurationData>(defaultConfiguration)
    const [showDbConfigurationModal, setShowDbConfigurationModal] = useState<boolean>(false)

    const hasFetchedConfig = useRef(false)
    if (!hasFetchedConfig.current) {
        console.log('hasFetchedConfig-readConfig', 'start');
        (window as typeof window & { configAPI: configAPI }).configAPI.readConfig()
            .then((c) => {
                console.log('hasFetchedConfig-readConfig', 'c', c)

                if (c && !c.mongodb) {
                    setShowDbConfigurationModal(true)
                } else if (c && c.configuration) {
                    i18n.changeLanguage(c.configuration.locale.code)
                    document.dir = c.configuration.locale.direction
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
                    })
                } else {
                    setConfiguration(defaultConfiguration)
                    persistConfigurationData({ locale: defaultConfiguration.locale, themeMode: defaultConfiguration.themeMode })
                }

                hasFetchedConfig.current = true
                console.log('hasFetchedConfig-readConfig', 'end')
            })
            .catch((err) => {
                console.error('hasFetchedConfig-readConfig', 'err', err)

                setConfiguration(defaultConfiguration)
                persistConfigurationData({ locale: defaultConfiguration.locale, themeMode: defaultConfiguration.themeMode })
            })
    }

    const persistConfigurationData = async (data: ConfigurationStorableData) => {
        const config = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig();
        (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig({ ...config, configuration: data })
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
        })
        persistConfigurationData({ locale: configuration.locale, themeMode: mode })
        document.dir = direction
    }
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
        }
        setConfiguration(conf)
        i18n.changeLanguage(getLocale(reactLocale))
        document.dir = direction
        persistConfigurationData({ locale: conf.locale, themeMode: conf.themeMode })
    }
    const updateTimeZone = (zone: TimeZone) => {
        setConfiguration(
            {
                ...configuration,
                locale: {
                    ...configuration.locale,
                    zone: zone
                }
            });
        persistConfigurationData({ locale: { ...configuration.locale, zone: configuration.locale.zone }, themeMode: configuration.themeMode })
    }

    // Authentication
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true)
    const [auth, setAuth] = useState<{ user: User | undefined, ac: AccessControl | undefined }>({ user: undefined, ac: undefined })

    const getAccessControl = async (): Promise<AccessControl | undefined> => {
        try {
            console.log('getAccessControl', 'start')
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPrivileges()
            console.log('getAccessControl', 'res', res)
            if (res.code !== 200)
                return undefined

            return new AccessControl(res.data)
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            console.log('getAccessControl', 'end')
        }
    }
    const fetchUser = async (): Promise<User | undefined> => {
        try {
            console.log('fetchUser', 'start')
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getAuthenticatedUser()
            console.log('fetchUser', 'res', res)
            if (res.code !== 200)
                return undefined

            return res.data
        } catch (error) {
            console.error(error)
            throw error
        } finally {
            console.log('fetchUser', 'end')
        }
    }
    const login = async (username: string, password: string) => {
        try {
            console.log('login', 'username', username)
            console.log('login', 'password', password)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.login(username, password)
            console.log('login', 'res', res)
            if (res.code !== 200 || res.data !== true) {
                setResult({
                    severity: 'error',
                    message: t('failedToAuthenticate'),
                })
                return
            }

            setResult({
                severity: 'success',
                message: t('successfullyAuthenticated'),
            })

            await init()
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToAuthenticate'),
            })
        } finally {
            console.log('login', 'end')
        }
    }
    const logout = async () => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.logout()
            console.log('logout', 'res', res)
            if (res.code !== 200) {
                setResult({
                    severity: 'error',
                    message: t('failedToLogout'),
                })
                return
            }

            if (res.data !== true) {
                setResult({
                    severity: 'error',
                    message: t('failedToLogout'),
                })
                return
            }

            setAuth({ user: undefined, ac: undefined })
            setContent(<Home />)
            setResult({
                severity: 'success',
                message: t('successfullyToLogout'),
            })
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToLogout'),
            })
        } finally {
            console.log('logout', 'end')
        }
    }

    const [result, setResult] = useState<Result | null>(null)

    const init = async () => {
        try {
            console.log('init', 'start')
            const u = await fetchUser()
            if (!u) {
                if (isAuthLoading)
                    setIsAuthLoading(false)
                setResult({
                    severity: 'error',
                    message: t('failedToAuthenticate')
                })
            }

            const accessControl = await getAccessControl()
            if (!accessControl) {
                if (isAuthLoading)
                    setIsAuthLoading(false)
                setResult({
                    severity: 'error',
                    message: t('failedToAuthenticate')
                })
            }

            if (isAuthLoading)
                setIsAuthLoading(false)
            setAuth({ user: u, ac: accessControl })
        } catch (error) {
            console.error('error', error)

            if (isAuthLoading)
                setIsAuthLoading(false)
            setResult({
                severity: 'error',
                message: t('failedToAuthenticate')
            })
        } finally { console.log('init', 'end') }
    }

    const hasInit = useRef<boolean>(false)

    if (hasFetchedConfig && !hasInit.current) {
        hasInit.current = true
        if (showDbConfigurationModal === false)
            init()
    }

    console.log('App', { configuration, auth, isAuthLoading })

    return (
        <>
            <ResultContext.Provider value={{ result, setResult }}>
                <NavigationContext.Provider value={{ goHome: () => setContent(<Home />) }}>
                    <ConfigurationContext.Provider value={{ get: configuration, set: { updateTheme, updateLocale, updateTimeZone } }}>
                        <CacheProvider value={configuration.locale.direction === 'rtl' ? rtlCache : ltrCache}>
                            <ThemeProvider theme={configuration.theme}>
                                <AuthContext.Provider value={{ user: auth.user, logout, fetchUser: async () => { await fetchUser() }, accessControl: auth.ac }}>
                                    <CssBaseline enableColorScheme />

                                    <AppControls authLoading={isAuthLoading} setContent={setContent}>
                                        {/* MenuBar ==> 2rem, AppBar ==> 3rem */}
                                        <Grid item xs={12} sx={{ height: 'calc(100% - 5rem)', overflowY: 'auto' }}>
                                            {auth.user && content}
                                        </Grid>
                                    </AppControls>

                                    <Modal open={!isAuthLoading && (!auth.user || !auth.ac)} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                                        <Slide direction={!isAuthLoading && (!auth.user || !auth.ac) ? 'up' : 'down'} in={!isAuthLoading && (!auth.user || !auth.ac)} timeout={250}>
                                            <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                                                <LoginForm onFinish={login} />
                                            </Paper>
                                        </Slide>
                                    </Modal>

                                    <Modal open={showDbConfigurationModal} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                                        <Slide direction={showDbConfigurationModal ? 'up' : 'down'} in={showDbConfigurationModal} timeout={250}>
                                            <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                                                <DbSettingsForm onFinish={async (settings: MongodbConfig) => {
                                                    console.log(settings)
                                                    const c = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig();
                                                    console.log(c);
                                                    (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig({
                                                        ...c,
                                                        mongodb: {
                                                            supportsTransaction: false,
                                                            url: "mongodb://localhost:8082",
                                                            databaseName: "primaryDB",
                                                            auth: {
                                                                username: "admin",
                                                                password: "password"
                                                            }
                                                        }
                                                    });

                                                    (window as typeof window & { appAPI: appAPI }).appAPI.reLaunch()
                                                }} />
                                            </Paper>
                                        </Slide>
                                    </Modal>

                                    <Snackbar
                                        open={result !== null}
                                        autoHideDuration={7000}
                                        onClose={() => setResult(null)}
                                        action={result?.action}
                                    >
                                        <Alert
                                            icon={result?.severity === 'success' ? <CheckOutlined fontSize="inherit" /> : (result?.severity === 'error' ? <CloseOutlined fontSize="inherit" /> : (result?.severity === 'warning' ? <DangerousOutlined fontSize="inherit" /> : null))}
                                            severity={result?.severity}
                                        >
                                            {result?.message}
                                        </Alert>
                                    </Snackbar>
                                </AuthContext.Provider>
                            </ThemeProvider >
                        </CacheProvider>
                    </ConfigurationContext.Provider>
                </NavigationContext.Provider>
            </ResultContext.Provider >
        </>
    )
}

