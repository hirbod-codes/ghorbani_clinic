import { t } from 'i18next';
import { memo, useContext, useState } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { ConfigurationContext } from '../Contexts/Configuration/ConfigurationContext';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';
import { useNavigate } from 'react-router-dom';
import { DatabaseIcon, HistoryIcon, HomeIcon, LogInIcon, LogOutIcon, MenuIcon, MoonIcon, PaintRollerIcon, SettingsIcon, ShieldAlertIcon, SunIcon, TimerIcon, UserIcon, UsersIcon } from 'lucide-react';
import { CircularLoading } from './Base/CircularLoading';
import { Drawer } from './Base/Drawer';
import { Button } from './Base/Button';

export const Navigation = memo(function Navigation() {
    const navigate = useNavigate();

    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)!

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)

    const readsUsers = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.USER).granted
    const readsPatients = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.PATIENT).granted
    const readsVisits = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.VISIT).granted
    const readsMedicalHistories = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.MEDICAL_HISTORY).granted

    console.log('Navigation', { auth, configuration, openDrawer })

    const appBarBorderColor = configuration.themeOptions.colors[`${configuration.themeOptions.mode}Foreground`]
    const drawerGradientColor = configuration.themeOptions.colors[`${configuration.themeOptions.mode}Foreground`]

    const appBarBorderGradient = `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, 5%, transparent)`
    const drawerGradient = `linear-gradient(90deg, ${drawerGradientColor}, 50%, transparent)`

    const moveTo = (destination: string) => {
        setOpenDrawer(false)

        setTimeout(() => {
            navigate(destination)
        }, 50)
    }

    const activeColor = configuration.themeOptions.colors.primary

    return (
        <>
            <div className='relative border-b-0 shadow-none bg-[#00000000]'>
                <div className='flex flex-row w-full items-center'>
                    <Button size='icon' className='rounded-none bg-transparent' onClick={() => setOpenDrawer(true)}>
                        <MenuIcon />
                    </Button>
                    <h6 className='flex-grow'>
                        {/* Title */}
                        {auth?.user?.username}
                    </h6>
                    {
                        auth?.user &&
                        <Button size='icon' className='rounded-none bg-transparent' onClick={async () => await auth?.logout()}>
                            {
                                auth?.isAuthLoading
                                    ? <CircularLoading />
                                    : <LogOutIcon fontSize='inherit' />
                            }
                        </Button>
                    }
                    {
                        !auth?.isAuthLoading && !auth?.user &&
                        <Button size='icon' className='rounded-none bg-transparent' onClick={() => auth?.showModal()}>
                            {
                                auth?.isAuthLoading
                                    ? <CircularLoading />
                                    : <LogInIcon fontSize='inherit' />
                            }
                        </Button>
                    }
                    <Button size='icon' className='rounded-none bg-transparent' onClick={async () => await configuration.updateTheme(configuration.themeOptions.mode === 'dark' ? 'light' : 'dark')}>
                        {configuration.themeOptions.mode == 'dark' ? <SunIcon fontSize='inherit' /> : <MoonIcon fontSize='inherit' />}
                    </Button>
                </div>
            </div>

            <div style={{ height: '2px', background: appBarBorderGradient, margin: '0 1rem' }} />

            <Drawer containerProps={{ className: 'z-50' }} animatedSlideProps={{ open: openDrawer, motionKey: openDrawer.toString() }} onClose={() => setOpenDrawer(false)}>
                <div className={`flex flex-row items-center h-full`} style={{ background: drawerGradient }}>
                    <div className='flex flex-col overflow-auto h-full'>
                        <div className='mb-8' />

                        <Button className='pr-8 rounded-none' variant={'ghost'} onClick={() => moveTo('/')}>
                            <HomeIcon style={{ color: window.location.pathname !== '/' ? 'white' : activeColor }} />
                            <p style={{ color: window.location.pathname !== '/' ? 'white' : activeColor }}>{t('Navigation.home')}</p>
                        </Button>

                        <div className='mb-8' />

                        {readsUsers &&
                            <Button className='pr-8 rounded-none' variant={'ghost'} onClick={() => moveTo('/Users')} >
                                <UsersIcon style={{ color: window.location.pathname !== '/Users' ? 'white' : activeColor }} />
                                <p style={{ color: window.location.pathname !== '/Users' ? 'white' : activeColor }}>{t('Navigation.users')}</p>
                            </Button>}

                        <div className='mb-2' />

                        {readsPatients &&
                            <Button className='pr-8 rounded-none' variant={'ghost'} onClick={() => moveTo('/Patients')} >
                                <ShieldAlertIcon style={{ color: window.location.pathname !== '/Patients' ? 'white' : activeColor }} />
                                <p style={{ color: window.location.pathname !== '/Patients' ? 'white' : activeColor }}>{t('Navigation.patients')}</p>
                            </Button>}

                        <div className='mb-2' />

                        {readsVisits &&
                            <Button className='pr-8 rounded-none' variant={'ghost'} onClick={() => moveTo('/Visits')} >
                                <TimerIcon style={{ color: window.location.pathname !== '/Visits' ? 'white' : activeColor }} />
                                <p style={{ color: window.location.pathname !== '/Visits' ? 'white' : activeColor }}>{t('Navigation.visits')}</p>
                            </Button>}

                        <div className='mb-2' />

                        {readsMedicalHistories &&
                            <Button className='pr-8 rounded-none' variant={'ghost'} onClick={() => moveTo('/MedicalHistories')} >
                                <HistoryIcon style={{ color: window.location.pathname !== '/MedicalHistories' ? 'white' : activeColor }} />
                                <p style={{ color: window.location.pathname !== '/MedicalHistories' ? 'white' : activeColor }}>{t('Navigation.MedicalHistories')}</p>
                            </Button>}

                        <div className='mb-8' />

                        <Button className='pr-8 rounded-none' variant={'ghost'} onClick={() => moveTo('/General')} >
                            <SettingsIcon style={{ color: window.location.pathname !== '/General' ? 'white' : activeColor }} />
                            <p style={{ color: window.location.pathname !== '/General' ? 'white' : activeColor }}>{t("Navigation.general")}</p>
                        </Button>

                        <Button className='pr-8 rounded-none' variant={'ghost'} onClick={() => moveTo('/ThemeSettings')} >
                            <PaintRollerIcon style={{ color: window.location.pathname !== '/ThemeSettings' ? 'white' : activeColor }} />
                            <p style={{ color: window.location.pathname !== '/ThemeSettings' ? 'white' : activeColor }}>{t("Navigation.Theme")}</p>
                        </Button>

                        <div className='mb-8' />

                        <Button className='pr-8 rounded-none' variant={'ghost'} onClick={() => moveTo('/DbSettings')} >
                            <DatabaseIcon style={{ color: window.location.pathname !== '/DbSettings' ? 'white' : activeColor }} />
                            <p style={{ color: window.location.pathname !== '/DbSettings' ? 'white' : activeColor }}>{t("Navigation.Db")}</p>
                        </Button>
                    </div>
                    <div className={`h-full w-[2px]`} style={{ background: `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)` }} />
                </div>
            </Drawer>
        </>
    );
})
