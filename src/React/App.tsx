import { CssBaseline, Modal, PaletteMode, Paper, createTheme, useMediaQuery, AppBar, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Slide, Menu, MenuItem, ThemeProvider } from '@mui/material'
import { useRef, useState } from 'react'
import { Home } from './routes/Home'
import { MenuBar } from './components/MenuBar'
import { LoginForm } from './LoginForm'
import { AuthContext } from '../Electron/Auth/renderer/AuthContext'
import type { authAPI } from '../Electron/Auth/renderer/authAPI'
import { Settings } from './routes/Settings'
import type { Calendar, Locale, TimeZone } from './components/Localization/types'
import { Localization, enUS, faIR } from '@mui/material/locale';
import { getLocale, getReactLocale } from './components/Localization/types'
import { useTranslation } from "react-i18next";

import HomeIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LanguageIcon from '@mui/icons-material/LanguageOutlined'
import TimeZoneIcon from '@mui/icons-material/AccessTimeOutlined'
import { ConfigurationContext } from './ConfigurationContext'

export function App() {
    // Localization
    const { t, i18n } = useTranslation();
    const getInitialMode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    console.log('getInitialMode', getInitialMode);

    const getInitialLocale: Locale = ({ calendar: 'Persian', i18n, t, zone: 'Asia/Tehran', reactLocale: enUS, direction: 'ltr', getLocale, getReactLocale })
    const [configuration, setConfiguration] = useState({
        locale: getInitialLocale,
        theme: createTheme(
            {
                palette: {
                    mode: getInitialMode,
                },
                direction: getInitialLocale.direction
            },
            getInitialLocale.getReactLocale(getInitialLocale.i18n)
        ),
    })

    const updateTheme = (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => {
        setConfiguration(
            {
                ...configuration,
                theme: createTheme(
                    {
                        palette: {
                            mode: mode,
                        },
                        direction: direction
                    },
                    locale
                )
            }
        )
        document.dir = direction
    }
    const updateLocale = (calendar: Calendar, direction: 'rtl' | 'ltr', reactLocale: Localization) => {
        setConfiguration({
            ...configuration,
            locale: {
                ...configuration.locale,
                direction,
                reactLocale,
                calendar,
            },
            theme: createTheme(
                {
                    palette: {
                        mode: configuration.theme.palette.mode,
                    },
                    direction: direction
                },
                configuration.locale.reactLocale
            )
        })
        configuration.locale.i18n.changeLanguage(getLocale(reactLocale))
        document.dir = direction
    }
    const updateTimeZone = (zone: TimeZone) => setConfiguration(
        {
            ...configuration,
            locale: {
                ...configuration.locale,
                zone: zone
            }
        })

    const updateConfiguration = {
        updateTheme,
        updateLocale,
        updateTimeZone
    }

    // Authentication
    const isCalled = useRef(false)
    const [user, setUser] = useState(null);
    const [authFetched, setAuthFetched] = useState(false);
    (window as typeof window & { authAPI: authAPI }).authAPI.getAuthenticatedUser().then((u) => {
        if (!isCalled.current && u != null && user == null) {
            isCalled.current = true

            setUser(u)
        }

        setAuthFetched(true)
    })

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const [content, setContent] = useState(<Home />)
    const list = [
        {
            text: 'Home',
            icon: <HomeIcon />,
            content: <Home />
        },
        {
            text: 'Settings',
            icon: <SettingsIcon />,
            content: <Settings />
        }
    ]

    const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(null)
    const [timeZoneAnchorEl, setTimeZoneAnchorEl] = useState<null | HTMLElement>(null)

    return (
        <>
            <ConfigurationContext.Provider value={{ get: configuration, set: updateConfiguration }}>
                <ThemeProvider theme={configuration.theme}>
                    <AuthContext.Provider value={{ user, setUser }}>
                        <CssBaseline />
                        <MenuBar />
                        {authFetched &&
                            <>
                                {
                                    user &&
                                    <>
                                        <AppBar position='relative'>
                                            <Toolbar variant="dense">
                                                <IconButton size='large' color='inherit' onClick={() => setOpenDrawer(true)} sx={{ mr: 2 }}>
                                                    <MenuIcon fontSize='inherit' />
                                                </IconButton>
                                                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                                                    {user.username}
                                                </Typography>
                                                <IconButton size='medium' color='inherit' onClick={(e) => setLanguageAnchorEl(e.currentTarget)}>
                                                    <LanguageIcon fontSize='inherit' />
                                                </IconButton>
                                                <IconButton size='medium' color='inherit' onClick={(e) => setTimeZoneAnchorEl(e.currentTarget)}>
                                                    <TimeZoneIcon fontSize='inherit' />
                                                </IconButton>
                                                <IconButton size='medium' color='inherit' onClick={() => updateConfiguration.updateTheme(configuration.theme.palette.mode == 'dark' ? 'light' : 'dark', configuration.locale.direction, configuration.locale.reactLocale)}>
                                                    {configuration.theme.palette.mode == 'light' ? <LightModeIcon fontSize='inherit' /> : <DarkModeIcon fontSize='inherit' />}
                                                </IconButton>
                                                {user &&
                                                    <IconButton size='medium' color='inherit' onClick={() => setUser(null)}>
                                                        <LogoutIcon fontSize='inherit' />
                                                    </IconButton>
                                                }
                                            </Toolbar>
                                        </AppBar>
                                        <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
                                            <List>
                                                {list.map((elm, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemButton onClick={() => { setContent(elm.content); setOpenDrawer(false) }}>
                                                            <ListItemIcon>
                                                                {elm.icon}
                                                            </ListItemIcon>
                                                            <ListItemText primary={elm.text} />
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Drawer>
                                    </>
                                }
                                {content}
                                <Modal open={user == null} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                                    <Slide direction={user == null ? 'up' : 'down'} in={user == null} timeout={250}>
                                        <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                                            <LoginForm />
                                        </Paper>
                                    </Slide>
                                </Modal>
                                <Menu
                                    anchorEl={languageAnchorEl}
                                    open={Boolean(languageAnchorEl)}
                                    onClose={() => setLanguageAnchorEl(null)}
                                >
                                    <MenuItem onClick={() => { updateConfiguration.updateLocale('Persian', 'rtl', faIR); setLanguageAnchorEl(null) }}>Persian</MenuItem>
                                    <MenuItem onClick={() => { updateConfiguration.updateLocale('Gregorian', 'ltr', enUS); setLanguageAnchorEl(null) }}>English</MenuItem>
                                </Menu>
                                <Menu
                                    anchorEl={timeZoneAnchorEl}
                                    open={Boolean(timeZoneAnchorEl)}
                                    onClose={() => setTimeZoneAnchorEl(null)}
                                >
                                    <MenuItem onClick={() => { updateConfiguration.updateTimeZone('Asia/Tehran'); setTimeZoneAnchorEl(null) }}>Asia - Tehran</MenuItem>
                                    <MenuItem onClick={() => { updateConfiguration.updateTimeZone('UTC'); setTimeZoneAnchorEl(null) }}>UTC</MenuItem>
                                </Menu>
                            </>
                        }
                    </AuthContext.Provider>
                </ThemeProvider >
            </ConfigurationContext.Provider>
        </>
    )
}
