import { useContext, useState } from 'react'

import { HomeOutlined, PersonOutlined, SettingsOutlined, MenuOutlined, LogoutOutlined, LightModeOutlined, DarkModeOutlined, ExpandLess, ExpandMore, DisplaySettingsOutlined, StorageOutlined, MasksOutlined, AccessTimeOutlined, LoginOutlined, FormatPaintOutlined, DeleteOutline, RepeatOutlined, } from '@mui/icons-material'
import { AppBar, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Collapse, CircularProgress, Grid, Theme, colors, Dialog, DialogTitle, DialogActions, Button } from '@mui/material'

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
import { dbAPI } from '../Electron/Database/dbAPI'
import { publish } from './Lib/Events'
import { RESULT_EVENT_NAME } from './Contexts/ResultWrapper'

export function App() {
    const nav = useContext(NavigationContext)
    const auth = useContext(AuthContext)
    const theme = useContext(ThemeContext) as Theme
    const configuration = useContext(ConfigurationContext)
    const setContent = useContext(NavigationContext)?.setContent ?? ((o: any) => { })

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const [openSettingsList, setOpenSettingsList] = useState(false)
    const [openDbList, setOpenDbList] = useState(false)

    // DB Questions
    const [openSeedQuestion, setOpenSeedQuestion] = useState<boolean>(false)
    const [openTruncateDbQuestion, setOpenTruncateDbQuestion] = useState<boolean>(false)

    const [seeding, setSeeding] = useState<boolean>(false)
    const [truncating, setTruncating] = useState<boolean>(false)

    const readsUsers = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.USER).granted
    const readsPatients = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.PATIENT).granted
    const readsVisits = auth.accessControl && auth.user && auth.accessControl.can(auth.user.roleName).read(resources.VISIT).granted

    console.log('App', { nav, auth, theme, configuration, setContent, openDrawer, openSettingsList })

    return (
        <>
            <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)} >
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
                            <ListItemButton sx={{ pl: 4 }} onClick={() => { setOpenDbList(!openDbList) }}>
                                <ListItemIcon>
                                    <StorageOutlined />
                                </ListItemIcon>
                                <ListItemText primary={t("Db")} />
                                {openDbList ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse in={openDbList} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <ListItemButton sx={{ pl: 8 }} onClick={() => { setContent(<DbSettings />); setOpenDrawer(false) }}>
                                        <ListItemIcon>
                                            <SettingsOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary={t("Settings")} />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 8 }} onClick={() => setOpenSeedQuestion(true)}>
                                        <ListItemIcon>
                                            <RepeatOutlined />
                                        </ListItemIcon>
                                        <ListItemText primary={t("Seed")} />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 8, color: colors.red[400] }} onClick={() => setOpenTruncateDbQuestion(true)}>
                                        <ListItemIcon>
                                            <DeleteOutline />
                                        </ListItemIcon>
                                        <ListItemText primary={t("Truncate")} />
                                    </ListItemButton>
                                </List>
                            </Collapse>
                            <ListItemButton sx={{ pl: 4 }} onClick={() => { setContent(<ThemeSettings />); setOpenDrawer(false) }}>
                                <ListItemIcon>
                                    <FormatPaintOutlined />
                                </ListItemIcon>
                                <ListItemText primary={t("Theme")} />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </List>
            </Drawer>

            <Dialog
                open={openSeedQuestion}
                onClose={() => setOpenSeedQuestion(false)}
            >
                <DialogTitle>
                    {t('doYouWantToSeedDB')}
                </DialogTitle>
                <DialogActions>
                    <Button
                        onClick={async () => {
                            try {
                                setSeeding(true)
                                const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.seed()
                                setSeeding(false)

                                if (result === true)
                                    setOpenSeedQuestion(false)
                                else
                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'error',
                                        message: t('failedToSeedDB')
                                    })
                            } catch (error) {
                                console.error(error)
                                setSeeding(false)
                            }
                        }}
                    >
                        {seeding ? <CircularProgress size={35} /> : t('yes')}
                    </Button>
                    <Button onClick={() => setOpenSeedQuestion(false)}>{t('no')}</Button>
                </DialogActions>
            </Dialog >

            <Dialog
                open={openTruncateDbQuestion}
                onClose={() => setOpenTruncateDbQuestion(false)}
            >
                <DialogTitle>
                    {t('doYouWantToTruncateDB')}
                </DialogTitle>
                <DialogActions>
                    <Button color='error' onClick={async () => {
                        try {
                            setTruncating(true)
                            const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.truncate()
                            setTruncating(false)

                            if (result === true)
                                setOpenTruncateDbQuestion(false)
                            else
                                publish(RESULT_EVENT_NAME, {
                                    severity: 'error',
                                    message: t('failedToSeedDB')
                                })
                        } catch (error) {
                            console.error(error)
                            setTruncating(false)
                        }
                    }}>
                        {truncating ? <CircularProgress size={35} /> : t('yes')}
                    </Button>
                    <Button onClick={() => setOpenTruncateDbQuestion(false)}>{t('no')}</Button>
                </DialogActions>
            </Dialog >

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

