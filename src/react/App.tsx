import { useContext, useState } from 'react'

import { HomeOutlined, PersonOutlined, SettingsOutlined, MenuOutlined, LogoutOutlined, LightModeOutlined, DarkModeOutlined, ExpandLess, ExpandMore, DisplaySettingsOutlined, StorageOutlined, MasksOutlined, AccessTimeOutlined, LoginOutlined, } from '@mui/icons-material'
import { AppBar, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Collapse, CircularProgress, Grid, Theme } from '@mui/material'

import { AuthContext } from './Contexts/AuthContext'
import { resources } from '../Electron/Database/Repositories/Auth/resources'
import { Home } from './Pages/Home'
import { Users } from './Pages/Users'
import { Patients } from './Pages/Patients'
import { Visits } from './Pages/Visits'
import { DbSettings } from './Pages/Settings/DbSettings'
import { t } from 'i18next'
import { General } from './Pages/Settings/General'
import { MenuBar } from './Components/MenuBar'
import { ThemeContext } from '@emotion/react'
import { ConfigurationContext } from './Contexts/ConfigurationContext'
import { getReactLocale } from './Lib/helpers'
import { NavigationContext } from './Contexts/NavigationContext'
import { ThemeSettings } from './Pages/Settings/ThemeSettings'

export default function App() {
    const nav = useContext(NavigationContext)
    const auth = useContext(AuthContext)
    const theme = useContext(ThemeContext) as Theme
    const configuration = useContext(ConfigurationContext)
    const setContent = useContext(NavigationContext)?.setContent ?? ((o: any) => { })

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const [openSettingsList, setOpenSettingsList] = useState(false)

    const readsUsers = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.USER).granted
    const readsPatients = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.PATIENT).granted
    const readsVisits = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.VISIT).granted

    console.log('App', { nav, auth, theme, configuration, setContent, openDrawer, openSettingsList })

    return (
        <>
            <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
                <List sx={{ pt: 3 }}>
                    <ListItemButton onClick={() => { setContent(<Home />); setOpenDrawer(false) }}>
                        <ListItemIcon>
                            <HomeOutlined />
                        </ListItemIcon>
                        <ListItemText primary={t('home')} />
                    </ListItemButton>
                    {
                        readsUsers &&
                        <ListItemButton onClick={() => { setContent(<Users />); setOpenDrawer(false) }}>
                            <ListItemIcon>
                                <PersonOutlined />
                            </ListItemIcon>
                            <ListItemText primary={t('users')} />
                        </ListItemButton>
                    }
                    {
                        readsPatients &&
                        <ListItemButton onClick={() => { setContent(<Patients />); setOpenDrawer(false) }}>
                            <ListItemIcon>
                                <MasksOutlined />
                            </ListItemIcon>
                            <ListItemText primary={t('patients')} />
                        </ListItemButton>
                    }
                    {
                        readsVisits &&
                        <ListItemButton onClick={() => { setContent(<Visits />); setOpenDrawer(false) }}>
                            <ListItemIcon>
                                <AccessTimeOutlined />
                            </ListItemIcon>
                            <ListItemText primary={t('visits')} />
                        </ListItemButton>
                    }
                    <ListItemButton onClick={() => setOpenSettingsList(!openSettingsList)}>
                        <ListItemIcon>
                            <SettingsOutlined />
                        </ListItemIcon>
                        <ListItemText primary={t('settings')} />
                        {openSettingsList ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={openSettingsList} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<General />); setOpenDrawer(false) }}>
                                <ListItemIcon>
                                    <DisplaySettingsOutlined />
                                </ListItemIcon>
                                <ListItemText primary={t("general")} />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<DbSettings />); setOpenDrawer(false) }}>
                                <ListItemIcon>
                                    <StorageOutlined />
                                </ListItemIcon>
                                <ListItemText primary={t("Db")} />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<ThemeSettings />); setOpenDrawer(false) }}>
                                <ListItemIcon>
                                    <StorageOutlined />
                                </ListItemIcon>
                                <ListItemText primary={t("Theme")} />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </List>
            </Drawer>

            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={12}>
                    <MenuBar backgroundColor={theme.palette.background.default} />
                </Grid>

                <Grid item xs={12} height={'3rem'}>
                    <AppBar position='relative'>
                        <Toolbar variant="dense">
                            <IconButton size='large' color='inherit' onClick={() => setOpenDrawer(true)} sx={{ mr: 2 }}>
                                <MenuOutlined fontSize='inherit' />
                            </IconButton>
                            <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                                {/* Title */}
                                {auth.user?.username}
                            </Typography>
                            {
                                auth.user &&
                                <IconButton size='medium' color='inherit' onClick={async () => await auth.logout()}>
                                    {
                                        auth?.isAuthLoading
                                            ? <CircularProgress size='small' />
                                            : <LogoutOutlined />
                                    }
                                </IconButton>
                            }
                            {
                                !auth.isAuthLoading && !auth.user &&
                                <IconButton size='medium' color='inherit' onClick={() => auth.showModal()}>
                                    {
                                        auth?.isAuthLoading
                                            ? <CircularProgress size='small' />
                                            : <LoginOutlined />
                                    }
                                </IconButton>
                            }
                            <IconButton size='medium' color='inherit' onClick={() => configuration.set.updateTheme(theme.palette.mode == 'dark' ? 'light' : 'dark', configuration.get.locale.direction, getReactLocale(configuration.get.locale.code))}>
                                {theme.palette.mode == 'light' ? <LightModeOutlined fontSize='inherit' /> : <DarkModeOutlined fontSize='inherit' />}
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                </Grid>

                {/* MenuBar ==> 2rem, AppBar ==> 3rem */}
                <Grid item xs={12} sx={{ height: 'calc(100% - 5rem)', overflowY: 'auto' }}>
                    {nav?.content}
                </Grid>
            </Grid>
        </>
    )
}

