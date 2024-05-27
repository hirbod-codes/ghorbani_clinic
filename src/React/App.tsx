import { CssBaseline, Modal, PaletteMode, Paper, ThemeProvider, createTheme, useMediaQuery, AppBar, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Slide } from '@mui/material'
import { useMemo, useRef, useState } from 'react'
import { Home } from './routes/Home'
import { MenuBar } from './components/MenuBar'
import { LoginForm } from './LoginForm'
import { AuthContext } from '../Electron/Auth/renderer/AuthContext'
import type { authAPI } from '../Electron/Auth/renderer/authAPI'
import { Settings } from './routes/Settings'

import HomeIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined'

export function App() {
    const [mode, setMode] = useState<PaletteMode>(useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light');

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: mode,
                },
            }),
        [mode],
    )

    const isCalled = useRef(false)

    const [user, setUser] = useState(null);

    (window as typeof window & { authAPI: authAPI }).authAPI.getAuthenticatedUser().then((u) => {
        if (!isCalled.current && u != null && user == null) {
            isCalled.current = true

            setUser(u)
        }
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

    return (
        <>
            <ThemeProvider theme={theme}>
                <AuthContext.Provider value={{ user, setUser }}>
                    <CssBaseline />
                    <MenuBar />
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
                                    <IconButton size='medium' color='inherit' onClick={() => setMode(mode == 'dark' ? 'light' : 'dark')}>
                                        {mode == 'light' ? <LightModeIcon fontSize='inherit' /> : <DarkModeIcon fontSize='inherit' />}
                                    </IconButton>
                                    <IconButton size='medium' color='inherit' onClick={() => setUser(null)}>
                                        <LogoutIcon fontSize='inherit' />
                                    </IconButton>
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
                    {content}
                    <Modal open={user == null} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                        <Slide direction={user == null ? 'up' : 'down'} in={user == null} timeout={250}>
                            <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                                <LoginForm />
                            </Paper>
                        </Slide>
                    </Modal>
                </AuthContext.Provider>
            </ThemeProvider >
        </>
    )
}
