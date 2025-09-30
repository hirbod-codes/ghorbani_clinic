import { t } from 'i18next';
import { memo, useContext, useRef, useState } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { ConfigurationContext } from '../Contexts/Configuration/ConfigurationContext';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';
import { useLocation, useNavigate } from 'react-router-dom';
import { DatabaseIcon, HistoryIcon, HomeIcon, PaintRollerIcon, SettingsIcon, ShieldAlertIcon, TimerIcon, UsersIcon } from 'lucide-react';
import { Button } from './Base/Button';
import { motion } from 'framer-motion'

export const Navigation = memo(function Navigation() {
    const location = useLocation()
    const navigate = useNavigate()

    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)!

    // Navigation
    const [openDrawer, setOpenDrawer] = useState(false)
    const destination = useRef<string | undefined>()
    const timer = useRef<any | undefined>()

    const readsUsers = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.USER).granted
    const readsPatients = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.PATIENT).granted
    const readsVisits = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.VISIT).granted
    const readsMedicalHistories = auth?.accessControl && auth?.user && auth?.accessControl.can(auth?.user?.roleName ?? '').read(resources.MEDICAL_HISTORY).granted

    console.log('Navigation', { path: location.pathname, auth, configuration, openDrawer })

    const moveTo = (dest: string) => {
        setTimeout(() => {
            navigate(dest)
        }, 50)
    }

    return (
        <>
            <div className="relative z-20 size-full">
                <motion.div
                    onClick={() => {
                        if (destination.current !== undefined) {
                            moveTo(destination.current)
                            destination.current = undefined
                        }
                    }}
                    onAnimationEnd={() => {
                        if (destination.current !== undefined) {
                            moveTo(destination.current)
                            destination.current = undefined
                        }
                    }}
                    layout
                    className='absolute flex flex-col overflow-auto h-full items-start justify-stretch w-fit bg-surface-container border rounded-lg shadow-sm'
                    onPointerEnter={() => {
                        timer.current = setTimeout(() => {
                            setOpenDrawer(true)
                        }, 1500)
                    }}
                    onPointerLeave={() => {
                        if (timer?.current)
                            clearTimeout(timer?.current)
                        setOpenDrawer(false)
                    }}
                >
                    <div className='mb-8' />

                    <Button
                        variant='text'
                        fgColor={location.pathname !== '/' ? 'surface-foreground' : 'primary'}
                        className='w-full justify-start rounded-none'
                        onClick={() => { if (location.pathname !== '/') { destination.current = '/'; setOpenDrawer(false) } }}
                    >
                        <motion.div layout>
                            <HomeIcon />
                        </motion.div>
                        {openDrawer &&
                            <motion.div layout>
                                {t('Navigation.home')}
                            </motion.div>
                        }
                    </Button>

                    <div className='mb-8' />

                    {readsUsers &&
                        <Button
                            variant='text'
                            fgColor={location.pathname !== '/Users' ? 'surface-foreground' : 'primary'}
                            className='w-full justify-start rounded-none'
                            onClick={() => { if (location.pathname !== '/Users') { destination.current = '/Users'; setOpenDrawer(false) } }}
                        >
                            <motion.div layout>
                                <UsersIcon />
                            </motion.div>
                            {openDrawer &&
                                <motion.div layout>
                                    {t('Navigation.users')}
                                </motion.div>
                            }
                        </Button>}

                    <div className='mb-2' />

                    {readsPatients &&
                        <Button
                            variant='text'
                            fgColor={location.pathname !== '/Patients' ? 'surface-foreground' : 'primary'}
                            className='w-full justify-start rounded-none'
                            onClick={() => { if (location.pathname !== '/Patients') { destination.current = '/Patients'; setOpenDrawer(false) } }}
                        >
                            <motion.div layout>
                                <ShieldAlertIcon />
                            </motion.div>
                            {openDrawer &&
                                <motion.div layout>
                                    {t('Navigation.patients')}
                                </motion.div>
                            }
                        </Button>}

                    <div className='mb-2' />

                    {readsVisits &&
                        <Button
                            variant='text'
                            fgColor={location.pathname !== '/Visits' ? 'surface-foreground' : 'primary'}
                            className='w-full justify-start rounded-none'
                            onClick={() => { if (location.pathname !== '/Visits') { destination.current = '/Visits'; setOpenDrawer(false) } }}
                        >
                            <motion.div layout>
                                <TimerIcon />
                            </motion.div>
                            {openDrawer &&
                                <motion.div layout>
                                    {t('Navigation.visits')}
                                </motion.div>
                            }
                        </Button>}

                    <div className='mb-2' />

                    {readsMedicalHistories &&
                        <Button
                            variant='text'
                            fgColor={location.pathname !== '/MedicalHistories' ? 'surface-foreground' : 'primary'}
                            className='w-full justify-start rounded-none'
                            onClick={() => { if (location.pathname !== '/MedicalHistories') { destination.current = '/MedicalHistories'; setOpenDrawer(false) } }}
                        >
                            <motion.div layout>
                                <HistoryIcon />
                            </motion.div>
                            {openDrawer &&
                                <motion.div layout>
                                    {t('Navigation.MedicalHistories')}
                                </motion.div>
                            }
                        </Button>}

                    <div className='mb-8' />

                    {/* <Button
                        variant='text'
                        fgColor={location.pathname !== '/ThemeSettings' ? 'surface-foreground' : 'primary'}
                        className='w-full justify-start rounded-none'
                        onClick={() => { if (location.pathname !== '/ThemeSettings') { destination.current = '/ThemeSettings'; setOpenDrawer(false) } }}
                    >
                        <motion.div layout>
                            <PaintRollerIcon />
                        </motion.div>
                        {openDrawer &&
                            <motion.div layout>
                                {t("Navigation.Theme")}
                            </motion.div>
                        }
                    </Button> */}

                    <Button
                        variant='text'
                        fgColor={location.pathname !== '/General' ? 'surface-foreground' : 'primary'}
                        className='w-full justify-start rounded-none'
                        onClick={() => { if (location.pathname !== '/General') { destination.current = '/General'; setOpenDrawer(false) } }}
                    >
                        <motion.div layout>
                            <SettingsIcon />
                        </motion.div>
                        {openDrawer &&
                            <motion.div layout>
                                {t("Navigation.general")}
                            </motion.div>
                        }
                    </Button>

                    <div className='mb-8' />

                    <Button
                        variant='text'
                        fgColor={location.pathname !== '/DbSettings' ? 'surface-foreground' : 'primary'}
                        className='w-full justify-start rounded-none'
                        onClick={() => { if (location.pathname !== '/DbSettings') { destination.current = '/DbSettings'; setOpenDrawer(false) } }}
                    >
                        <motion.div layout>
                            <DatabaseIcon />
                        </motion.div>
                        {openDrawer &&
                            <motion.div layout>
                                {t("Navigation.Db")}
                            </motion.div>
                        }
                    </Button>
                </motion.div>
            </div>
        </>
    )
})
