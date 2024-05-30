import { CssBaseline, Modal, PaletteMode, Paper, ThemeProvider, createTheme, useMediaQuery, AppBar, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Slide, Menu, MenuItem } from '@mui/material'
import { useMemo, useRef, useState } from 'react'
import { Home } from './routes/Home'
import { MenuBar } from './components/MenuBar'
import { LoginForm } from './LoginForm'
import { AuthContext } from '../Electron/Auth/renderer/AuthContext'
import type { authAPI } from '../Electron/Auth/renderer/authAPI'
import { Settings } from './routes/Settings'
import { LocaleContext } from './components/DateTime/LocaleContext'
import type { Locale } from './components/Localization/types'
import { enUS, faIR } from '@mui/material/locale';

import HomeIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'
import LanguageIcon from '@mui/icons-material/LanguageOutlined'
import TimeZoneIcon from '@mui/icons-material/AccessTimeOutlined'

export function App() {
    const [locale, setLocale] = useState<Locale>({ calendar: 'Gregorian', language: faIR, zone: 'UTC' })

    const [mode, setMode] = useState<PaletteMode>(useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light');
    const theme = useMemo(
        () =>
            createTheme(
                {
                    palette: {
                        mode: mode,
                    },
                },
                locale.language
            ),
        [mode, locale],
    )

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

    const [open, setOpen] = useState(false)
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
            <ThemeProvider theme={theme}>
                <LocaleContext.Provider value={locale}>
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
                                                <IconButton size='large' color='inherit' onClick={() => setOpen(true)} sx={{ mr: 2 }}>
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
                                                <IconButton size='medium' color='inherit' onClick={() => setMode(mode == 'dark' ? 'light' : 'dark')}>
                                                    {mode == 'light' ? <LightModeIcon fontSize='inherit' /> : <DarkModeIcon fontSize='inherit' />}
                                                </IconButton>
                                                {user &&
                                                    <IconButton size='medium' color='inherit' onClick={() => setUser(null)}>
                                                        <LogoutIcon fontSize='inherit' />
                                                    </IconButton>
                                                }
                                            </Toolbar>
                                        </AppBar>
                                        <Drawer open={open} onClose={() => setOpen(false)}>
                                            <List>
                                                {list.map((elm, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemButton onClick={() => { setContent(elm.content); setOpen(false) }}>
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
                                <Typography variant='body1'>
                                    4484654
                                </Typography>
                                {`${locale.language == enUS ? 'en' : 'fa'}-${locale.zone}-${locale.calendar}`}
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
                                    <MenuItem onClick={() => { setLocale({ ...locale, language: faIR, calendar: 'Persian' }); setLanguageAnchorEl(null) }}>Persian</MenuItem>
                                    <MenuItem onClick={() => { setLocale({ ...locale, language: enUS, calendar: 'Gregorian' }); setLanguageAnchorEl(null) }}>English</MenuItem>
                                </Menu>
                                <Menu
                                    anchorEl={timeZoneAnchorEl}
                                    open={Boolean(timeZoneAnchorEl)}
                                    onClose={() => setTimeZoneAnchorEl(null)}
                                >
                                    <MenuItem onClick={() => { setLocale({ ...locale, zone: 'Asia/Tehran' }); setTimeZoneAnchorEl(null) }}>Asia - Tehran</MenuItem>
                                    <MenuItem onClick={() => { setLocale({ ...locale, zone: 'UTC' }); setTimeZoneAnchorEl(null) }}>UTC</MenuItem>
                                </Menu>
                            </>
                        }
                    </AuthContext.Provider>
                </LocaleContext.Provider>
            </ThemeProvider >
        </>
    )
}
