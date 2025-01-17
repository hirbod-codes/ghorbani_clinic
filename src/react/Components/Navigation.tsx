import { t } from 'i18next';
import { memo, useContext, useRef, useState } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { ConfigurationContext } from '../Contexts/Configuration/ConfigurationContext';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';
import { useNavigate } from 'react-router-dom';
import { DatabaseIcon, HistoryIcon, HomeIcon, PaintRollerIcon, SettingsIcon, ShieldAlertIcon, TimerIcon, UsersIcon } from 'lucide-react';
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

    const drawerGradient = `linear-gradient(90deg, ${drawerGradientColor}, 50%, transparent)`

    const moveTo = (destination: string) => {
        setOpenDrawer(false)

        setTimeout(() => {
            navigate(destination)
        }, 50)
    }

    const activeColor = 'primary'

    return (
        // <Drawer animatedSlideProps={{ open: openDrawer, motionKey: openDrawer.toString(), motionDivProps: { className: 'w-5 h-screen z-10', layout: true } }} containerRef={containerRef} onClose={() => setOpenDrawer(false)}>
        <div ref={containerRef} className={`flex flex-row items-center h-full w-fit bg-surface-container border rounded-lg shadow-lg`} style={{ background: drawerGradient }}>
            <div className='flex flex-col overflow-auto h-full items-start justify-stretch'>
                <div className='mb-8' />

                <Button variant='text' disabled={window.location.pathname === '/'} fgColor={window.location.pathname !== '/' ? 'surface-foreground' : activeColor} className='pr-8 w-full justify-start rounded-none' onClick={() => moveTo('/')}>
                    <HomeIcon />
                    {t('Navigation.home')}
                </Button>

                <div className='mb-8' />

                {readsUsers &&
                    <Button variant='text' disabled={window.location.pathname === '/Users'} fgColor={window.location.pathname !== '/Users' ? 'surface-foreground' : activeColor} className='pr-8 w-full justify-start rounded-none' onClick={() => moveTo('/Users')} >
                        <UsersIcon />
                        {t('Navigation.users')}
                    </Button>}

                <div className='mb-2' />

                {readsPatients &&
                    <Button variant='text' disabled={window.location.pathname === '/Patients'} fgColor={window.location.pathname !== '/Patients' ? 'surface-foreground' : activeColor} className='pr-8 w-full justify-start rounded-none' onClick={() => moveTo('/Patients')} >
                        <ShieldAlertIcon />
                        {t('Navigation.patients')}
                    </Button>}

                <div className='mb-2' />

                {readsVisits &&
                    <Button variant='text' disabled={window.location.pathname === '/Visits'} fgColor={window.location.pathname !== '/Visits' ? 'surface-foreground' : activeColor} className='pr-8 w-full justify-start rounded-none' onClick={() => moveTo('/Visits')} >
                        <TimerIcon />
                        {t('Navigation.visits')}
                    </Button>}

                <div className='mb-2' />

                {readsMedicalHistories &&
                    <Button variant='text' disabled={window.location.pathname === '/MedicalHistories'} fgColor={window.location.pathname !== '/MedicalHistories' ? 'surface-foreground' : activeColor} className='pr-8 w-full justify-start rounded-none' onClick={() => moveTo('/MedicalHistories')} >
                        <HistoryIcon />
                        {t('Navigation.MedicalHistories')}
                    </Button>}

                <div className='mb-8' />

                <Button variant='text' disabled={window.location.pathname === '/ThemeSettings'} fgColor={window.location.pathname !== '/ThemeSettings' ? 'surface-foreground' : activeColor} className='pr-8 w-full justify-start rounded-none' onClick={() => moveTo('/ThemeSettings')} >
                    <PaintRollerIcon />
                    {t("Navigation.Theme")}
                </Button>

                <Button variant='text' disabled={window.location.pathname === '/General'} fgColor={window.location.pathname !== '/General' ? 'surface-foreground' : activeColor} className='pr-8 w-full justify-start rounded-none' onClick={() => moveTo('/General')} >
                    <SettingsIcon />
                    {t("Navigation.general")}
                </Button>

                <div className='mb-8' />

                <Button variant='text' disabled={window.location.pathname === '/DbSettings'} fgColor={window.location.pathname !== '/DbSettings' ? 'surface-foreground' : activeColor} className='pr-8 w-full justify-start rounded-none' onClick={() => moveTo('/DbSettings')} >
                    <DatabaseIcon />
                    {t("Navigation.Db")}
                </Button>
            </div>
            <div className={`h-full w-[2px]`} style={{ background: `radial-gradient(ellipse farthest-side at center, ${appBarBorderColor}, transparent)` }} />
        </div>
        // </Drawer>
    )
})
