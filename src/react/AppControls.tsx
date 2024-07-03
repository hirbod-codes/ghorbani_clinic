import { ReactNode, useContext, useState, useRef } from 'react'
import { Dispatch, SetStateAction } from 'react/index'

import { HomeOutlined, PersonOutlined, SettingsOutlined, MenuOutlined, LogoutOutlined, LightModeOutlined, DarkModeOutlined, ExpandLess, ExpandMore, DisplaySettingsOutlined, MasksOutlined, AccessTimeOutlined, } from '@mui/icons-material'
import { AppBar, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Collapse, CircularProgress, Grid, Theme } from '@mui/material'

import { AuthContext } from './Lib/AuthContext'
import { resources } from '../Electron/Database/Repositories/Auth/resources'
import { Home } from './Pages/Home'
import { Users } from './Pages/Users'
import Patients from './Pages/Patients'
import Visits from './Pages/Visits'
import { t } from 'i18next'
import { General } from './Pages/Settings/General'
import { MenuBar } from './Components/MenuBar'
import { ThemeContext } from '@emotion/react'
import { ConfigurationContext } from './ConfigurationContext'
import { getReactLocale } from './Lib/helpers'

export default function AppControls({ setContent, authLoading, children }: { setContent: Dispatch<SetStateAction<JSX.Element>>, authLoading: boolean, children?: ReactNode }) {
    const auth = useContext(AuthContext)
    const theme = useContext(ThemeContext) as Theme
    const configuration = useContext(ConfigurationContext)

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const [openSettingsList, setOpenSettingsList] = useState(false)

    const readsUsers = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.USER).granted
    const readsPatients = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.PATIENT).granted
    const readsVisits = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.VISIT).granted

    return (
        <>
            <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
                <List>
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
                                        authLoading
                                            ? <CircularProgress size='small' />
                                            : <LogoutOutlined />
                                    }
                                </IconButton>
                            }
                            <IconButton size='medium' color='inherit' onClick={() => configuration.set.updateTheme(theme.palette.mode == 'dark' ? 'light' : 'dark', configuration.get.locale.direction, getReactLocale(configuration.get.locale.code))}>
                                {theme.palette.mode == 'light' ? <LightModeOutlined fontSize='inherit' /> : <DarkModeOutlined fontSize='inherit' />}
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                </Grid>

                {children}
            </Grid>
        </>
    )
}

