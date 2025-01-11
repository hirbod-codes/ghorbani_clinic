import { t } from 'i18next';
import { memo, useContext, useRef, useState } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { ConfigurationContext } from '../Contexts/Configuration/ConfigurationContext';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';
import { useNavigate } from 'react-router-dom';
import { DatabaseIcon, HistoryIcon, HomeIcon, LogInIcon, LogOutIcon, MenuIcon, MoonIcon, PaintRollerIcon, SettingsIcon, ShieldAlertIcon, SunIcon, TimerIcon, UserIcon, UsersIcon } from 'lucide-react';
import { CircularLoadingIcon } from './Base/CircularLoadingIcon';
import { Drawer } from './Base/Drawer';
import { Button } from './Base/Button';

export const Navigation = memo(function Navigation() {
    const navigate = useNavigate();

    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)!

    // Navigation
    const containerRef = useRef<HTMLDivElement>(null)
    const [openDrawer, setOpenDrawer] = useState(false)

    const readsUsers = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.USER).granted
    const readsPatients = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.PATIENT).granted
    const readsVisits = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.VISIT).granted
    const readsMedicalHistories = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.MEDICAL_HISTORY).granted

    console.log('Navigation', { auth, configuration, openDrawer })

    const appBarBorderColor = configuration.themeOptions.colors[`${configuration.themeOptions.mode}Foreground`]
    const drawerGradientColor = configuration.themeOptions.colors[`${configuration.themeOptions.mode}Foreground`]
    const drawerForegroundColor = configuration.themeOptions.colors[`${configuration.themeOptions.mode}Background`]

    const appBarBorderGradient = `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, 5%, transparent)`
    const drawerGradient = `linear-gradient(90deg, ${drawerGradientColor}, 50%, transparent)`

    const moveTo = (destination: string) => {
        setOpenDrawer(false)

        setTimeout(() => {
            navigate(destination)
        }, 50)
    }

    const activeColor = 'primary'

    return (
        <>
            <div className='relative border-b-0 shadow-none bg-surface-container'>
                <div className='flex flex-row w-full items-center'>
                    <Button variant='text' isIcon className='rounded-none' onClick={() => setOpenDrawer(true)}>
                        <MenuIcon />
                    </Button>
                    <h6 className='flex-grow'>
                        {/* Title */}
                        {auth?.user?.username}
                    </h6>
                    {
                        auth?.user &&
                        <Button variant='text' isIcon className='rounded-none' onClick={async () => await auth?.logout()}>
                            {
                                auth?.isAuthLoading
                                    ? <CircularLoadingIcon />
                                    : <LogOutIcon fontSize='inherit' />
                            }
                        </Button>
                    }
                    {
                        !auth?.isAuthLoading && !auth?.user &&
                        <Button variant='text' isIcon className='rounded-none' onClick={() => auth?.showModal()}>
                            {
                                auth?.isAuthLoading
                                    ? <CircularLoadingIcon />
                                    : <LogInIcon fontSize='inherit' />
                            }
                        </Button>
                    }
                    <Button id='theme' variant='text' isIcon className='rounded-none' onClick={async () => await configuration.updateTheme(configuration.themeOptions.mode === 'dark' ? 'light' : 'dark')}>
                        {configuration.themeOptions.mode == 'dark' ? <SunIcon fontSize='inherit' /> : <MoonIcon fontSize='inherit' />}
                    </Button>
                </div>
            </div>

            <div style={{ height: '2px', background: appBarBorderGradient, margin: '0 1rem' }} />

            <Drawer animatedSlideProps={{ open: openDrawer, motionKey: openDrawer.toString(), motionDivProps: { className: 'absolute top-0 h-screen z-10', layout: true } }} containerRef={containerRef} onClose={() => setOpenDrawer(false)}>
                <div ref={containerRef} className={`flex flex-row items-center h-full w-fit bg-surface-container`} style={{ background: drawerGradient }}>
                    <div className='flex flex-col overflow-auto h-full'>
                        <div className='mb-8' />

                        <Button variant='text' color={window.location.pathname !== '/' ? 'surface' : activeColor} className='pr-8 rounded-none' onClick={() => moveTo('/')}>
                            <HomeIcon />
                            {t('Navigation.home')}
                        </Button>

                        <div className='mb-8' />

                        {readsUsers &&
                            <Button variant='text' color={window.location.pathname !== '/Users' ? 'surface' : activeColor} className='pr-8 rounded-none' onClick={() => moveTo('/Users')} >
                                <UsersIcon />
                                {t('Navigation.users')}
                            </Button>}

                        <div className='mb-2' />

                        {readsPatients &&
                            <Button variant='text' color={window.location.pathname !== '/Patients' ? 'surface' : activeColor} className='pr-8 rounded-none' onClick={() => moveTo('/Patients')} >
                                <ShieldAlertIcon />
                                {t('Navigation.patients')}
                            </Button>}

                        <div className='mb-2' />

                        {readsVisits &&
                            <Button variant='text' color={window.location.pathname !== '/Visits' ? 'surface' : activeColor} className='pr-8 rounded-none' onClick={() => moveTo('/Visits')} >
                                <TimerIcon />
                                {t('Navigation.visits')}
                            </Button>}

                        <div className='mb-2' />

                        {readsMedicalHistories &&
                            <Button variant='text' color={window.location.pathname !== '/MedicalHistories' ? 'surface' : activeColor} className='pr-8 rounded-none' onClick={() => moveTo('/MedicalHistories')} >
                                <HistoryIcon />
                                {t('Navigation.MedicalHistories')}
                            </Button>}

                        <div className='mb-8' />

                        <Button variant='text' color={window.location.pathname !== '/General' ? 'surface' : activeColor} className='pr-8 rounded-none' onClick={() => moveTo('/General')} >
                            <SettingsIcon />
                            {t("Navigation.general")}
                        </Button>

                        <Button variant='text' color={window.location.pathname !== '/ThemeSettings' ? 'surface' : activeColor} className='pr-8 rounded-none' onClick={() => moveTo('/ThemeSettings')} >
                            <PaintRollerIcon />
                            {t("Navigation.Theme")}
                        </Button>

                        <div className='mb-8' />

                        <Button variant='text' color={window.location.pathname !== '/DbSettings' ? 'surface' : activeColor} className='pr-8 rounded-none' onClick={() => moveTo('/DbSettings')} >
                            <DatabaseIcon />
                            {t("Navigation.Db")}
                        </Button>
                    </div>
                    <div className={`h-full w-[2px]`} style={{ background: `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)` }} />
                </div>
            </Drawer>
        </>
    );
})
