import { CssBaseline, Modal, PaletteMode, Paper, createTheme, useMediaQuery, AppBar, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Slide, ThemeProvider, Collapse } from '@mui/material'
import { useRef, useState } from 'react'
import { Home } from './routes/Home'
import { MenuBar } from './components/MenuBar'
import { LoginForm } from './LoginForm'
import { AuthContext } from '../Electron/Auth/renderer/AuthContext'
import type { authAPI } from '../Electron/Auth/renderer/authAPI'
import type { Calendar, Locale, TimeZone } from './components/Localization/types'
import { Localization, enUS } from '@mui/material/locale';
import { getLocale, getReactLocale } from './components/Localization/types'
import { useTranslation } from "react-i18next";
import { ConfigurationContext } from './ConfigurationContext'
import { Database } from './routes/Settings/Database'
import { General } from './routes/Settings/General'

import HomeIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StorageIcon from '@mui/icons-material/StorageOutlined';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettingsOutlined';

export function App() {
    // Localization
    const { t, i18n } = useTranslation();
    const getInitialMode: PaletteMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
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
    const [openSettingsList, setOpenSettingsList] = useState(false)
    const [content, setContent] = useState(<Home />)

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
                                                <ListItemButton onClick={() => { setContent(<Home />); setOpenDrawer(false) }}>
                                                    <ListItemIcon>
                                                        <HomeIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={'Home'} />
                                                </ListItemButton>
                                            </List>
                                            <List>
                                                <ListItemButton onClick={() => setOpenSettingsList(!openSettingsList)}>
                                                    <ListItemIcon>
                                                        <SettingsIcon />
                                                    </ListItemIcon>
                                                    <ListItemText primary={'Settings'} />
                                                    {openSettingsList ? <ExpandLess /> : <ExpandMore />}
                                                </ListItemButton>
                                                <Collapse in={openSettingsList} timeout="auto" unmountOnExit>
                                                    <List component="div" disablePadding>
                                                        <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<General />); setOpenDrawer(false) }}>
                                                            <ListItemIcon>
                                                                <DisplaySettingsIcon />
                                                            </ListItemIcon>
                                                            <ListItemText primary="General" />
                                                        </ListItemButton>
                                                        <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<Database />); setOpenDrawer(false) }}>
                                                            <ListItemIcon>
                                                                <StorageIcon />
                                                            </ListItemIcon>
                                                            <ListItemText primary="Database" />
                                                        </ListItemButton>
                                                    </List>
                                                </Collapse>
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
                            </>
                        }
                    </AuthContext.Provider>
                </ThemeProvider >
            </ConfigurationContext.Provider>
        </>
    )
}
