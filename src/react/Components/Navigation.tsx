import { t } from 'i18next';
import { memo, useContext, useState } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { ConfigurationContext } from '../Contexts/Configuration/ConfigurationContext';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';
import { useNavigate } from 'react-router-dom';
import { setAlpha, shadeColor } from '../Lib/Colors';
import { Button } from '../shadcn/components/ui/button';
import { DatabaseIcon, HistoryIcon, HomeIcon, LogInIcon, LogOutIcon, MoonIcon, PaintRollerIcon, SettingsIcon, ShieldAlertIcon, SunIcon, TimerIcon, UserIcon, UsersIcon } from 'lucide-react';
import { MenuIcon } from './Icons/MenuIcon';
import { CircularLoading } from './Base/CircularLoading';
import { Drawer } from './Base/Drawer';

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

    console.log('Navigation', { auth, configuration })

    const appBarBorderColor = configuration.themeOptions.mode === 'dark' ? '#fff' : '#000'
    const appBarGradientColor = setAlpha(configuration.themeOptions.mode === 'dark' ? '#fff' : '#000', 0.7)
    const drawerGradientColor = configuration.themeOptions.mode === 'dark' ? shadeColor('#fff', 0.7) : shadeColor('#000', 1.7)

    const moveTo = (destination: string) => {
        setOpenDrawer(false)

        setTimeout(() => {
            navigate(destination)
        }, 50)
    }

    const activeColor = configuration.themeOptions.colors.primary

    return (
        <>
            <div className={`bg-[radial-gradient(ellipse farthest-side at top, ${appBarGradientColor}, 5%, transparent)]`}>
                <Drawer open={openDrawer} onOpenChange={(o) => setOpenDrawer(o)}>
                    <div className={`flex flex-row items-center h-full bg-[linear-gradient(90deg, ${drawerGradientColor}, 50%, transparent)]`}>
                        <div className='flex flex-col overflow-auto h-full'>
                            <div className='mb-8' />

                            <Button className='pr-8' variant={'ghost'} onClick={() => moveTo('/')}>
                                <Button variant='ghost' style={{ color: window.location.pathname !== '/' ? 'white' : activeColor }} >
                                    <HomeIcon />
                                </Button>
                                <p style={{ color: window.location.pathname !== '/' ? 'white' : activeColor }}>{t('Navigation.home')}</p>
                            </Button>

                            <div className='mb-8' />

                            {readsUsers &&
                                <Button className='pr-8' variant={'ghost'} onClick={() => moveTo('/Users')} >
                                    <Button variant='ghost' style={{ color: window.location.pathname !== '/Users' ? 'white' : activeColor }}>
                                        <UsersIcon />
                                    </Button>
                                    <p style={{ color: window.location.pathname !== '/Users' ? 'white' : activeColor }}>{t('Navigation.users')}</p>
                                </Button>}

                            <div className='mb-2' />

                            {readsPatients &&
                                <Button className='pr-8' variant={'ghost'} onClick={() => moveTo('/Patients')} >
                                    <Button variant='ghost' style={{ color: window.location.pathname !== '/Patients' ? 'white' : activeColor }}>
                                        <ShieldAlertIcon />
                                    </Button>
                                    <p style={{ color: window.location.pathname !== '/Patients' ? 'white' : activeColor }}>{t('Navigation.patients')}</p>
                                </Button>}

                            <div className='mb-2' />

                            {readsVisits &&
                                <Button className='pr-8' variant={'ghost'} onClick={() => moveTo('/Visits')} >
                                    <Button variant='ghost' style={{ color: window.location.pathname !== '/Visits' ? 'white' : activeColor }}>
                                        <TimerIcon />
                                    </Button>
                                    <p style={{ color: window.location.pathname !== '/Visits' ? 'white' : activeColor }}>{t('Navigation.visits')}</p>
                                </Button>}

                            <div className='mb-2' />

                            {readsMedicalHistories &&
                                <Button className='pr-8' variant={'ghost'} onClick={() => moveTo('/MedicalHistories')} >
                                    <Button variant='ghost' style={{ color: window.location.pathname !== '/MedicalHistories' ? 'white' : activeColor }}>
                                        <HistoryIcon />
                                    </Button>
                                    <p style={{ color: window.location.pathname !== '/MedicalHistories' ? 'white' : activeColor }}>{t('Navigation.MedicalHistories')}</p>
                                </Button>}

                            <div className='mb-8' />

                            <Button className='pr-8' variant={'ghost'} onClick={() => moveTo('/General')} >
                                <Button variant='ghost' style={{ color: window.location.pathname !== '/General' ? 'white' : activeColor }}>
                                    <SettingsIcon />
                                </Button>
                                <p style={{ color: window.location.pathname !== '/General' ? 'white' : activeColor }}>{t("Navigation.general")}</p>
                            </Button>

                            <Button className='pr-8' variant={'ghost'} onClick={() => moveTo('/ThemeSettings')} >
                                <Button variant='ghost' style={{ color: window.location.pathname !== '/ThemeSettings' ? 'white' : activeColor }}>
                                    <PaintRollerIcon />
                                </Button>
                                <p style={{ color: window.location.pathname !== '/ThemeSettings' ? 'white' : activeColor }}>{t("Navigation.Theme")}</p>
                            </Button>

                            <div className='mb-8' />

                            <Button className='pr-8' variant={'ghost'} onClick={() => moveTo('/DbSettings')} >
                                <Button variant='ghost' style={{ color: window.location.pathname !== '/DbSettings' ? 'white' : activeColor }}>
                                    <DatabaseIcon />
                                </Button>
                                <p style={{ color: window.location.pathname !== '/DbSettings' ? 'white' : activeColor }}>{t("Navigation.Db")}</p>
                            </Button>
                        </div>
                        <div className={`h-full w-[2px] bg-[radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)]`} />
                    </div>
                </Drawer>

                {/* top margin is 2rem, because menu bar has a height of 2rem and is positioned fixed */}
                <div className='h-[2rem]' />

                <div className='relative border-b-0 shadow-none bg-[#00000000]'>
                    <div className='flex flex-row w-full items-center'>
                        <Button size='icon' onClick={() => setOpenDrawer(true)} className='mr-2'>
                            <MenuIcon />
                        </Button>
                        <h6 className='flex-grow'>
                            {/* Title */}
                            {auth?.user?.username}
                        </h6>
                        {
                            auth?.user &&
                            <Button size='icon' onClick={async () => await auth?.logout()}>
                                {
                                    auth?.isAuthLoading
                                        ? <CircularLoading />
                                        : <LogOutIcon fontSize='inherit' />
                                }
                            </Button>
                        }
                        {
                            !auth?.isAuthLoading && !auth?.user &&
                            <Button size='icon' onClick={() => auth?.showModal()}>
                                {
                                    auth?.isAuthLoading
                                        ? <CircularLoading />
                                        : <LogInIcon fontSize='inherit' />
                                }
                            </Button>
                        }
                        <Button size='icon' onClick={async () => await configuration.updateTheme(configuration.themeOptions.mode === 'dark' ? 'light' : 'dark', { ...configuration.themeOptions, colors: { ...configuration.themeOptions.colors, primary: configuration.themeOptions.mode === 'dark' ? 'hsl(1, 100%, 50%)' : 'hsl(203, 100%, 50%)' } })}>
                            {configuration.themeOptions.mode == 'light' ? <SunIcon fontSize='inherit' /> : <MoonIcon fontSize='inherit' />}
                        </Button>
                    </div>
                </div>
            </div >

            <div style={{ height: '2px', background: `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)`, margin: '0 1rem' }} />
        </>
    );
})
