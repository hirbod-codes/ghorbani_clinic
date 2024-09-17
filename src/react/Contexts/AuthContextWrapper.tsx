import { useState, ReactNode, useContext, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { RendererDbAPI } from '../../Electron/Database/renderer';
import { User } from '../../Electron/Database/Models/User';
import { AuthContext } from './AuthContext';
import { NavigationContext } from './NavigationContext';
import { AccessControl } from 'accesscontrol';
import { ConfigurationContext } from './ConfigurationContext';
import { Home } from '../Pages/Home';
import { Modal, Paper, Slide } from '@mui/material';
import { LoginForm } from '../Components/Auth/LoginForm';
import { RESULT_EVENT_NAME } from './ResultWrapper';
import { publish } from '../Lib/Events';

export function AuthContextWrapper({ children }: { children?: ReactNode; }) {
    const { t } = useTranslation();

    const configuration = useContext(ConfigurationContext)
    const nav = useContext(NavigationContext);

    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
    const [auth, setAuth] = useState<{ user: User | undefined; ac: AccessControl | undefined; }>({ user: undefined, ac: undefined });
    const [showModal, setShowModal] = useState<boolean>(false)

    const getAccessControl = async (): Promise<AccessControl | undefined> => {
        try {
            console.groupCollapsed('AuthContextWrapper', 'getAccessControl');
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPrivileges();
            console.log({ res });
            if (res.code !== 200)
                return undefined;

            return new AccessControl(res.data);
        } catch (error) {
            console.error(error);
            // throw error;
        } finally {
            console.groupEnd();
        }
    };
    const fetchUser = async (): Promise<User | undefined> => {
        try {
            console.groupCollapsed('AuthContextWrapper', 'fetchUser')
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getAuthenticatedUser();
            console.log({ res });
            if (res.code !== 200)
                return undefined;

            return res.data;
        } catch (error) {
            console.error(error);
            // throw error;
        } finally {
            console.groupEnd();
        }
    };
    const login = async (username: string, password: string) => {
        try {
            console.groupCollapsed('AuthContextWrapper', 'login')

            console.log({ username, password });
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.login(username, password);
            console.log({ res });
            if (res.code !== 200 || res.data !== true) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToAuthenticate'),
                });
                return;
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('successfullyAuthenticated'),
            });

            await init();
            nav?.setContent(<Home />);
        } catch (error) {
            console.error(error);

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToAuthenticate'),
            });
        } finally {
            console.groupEnd();
        }
    };
    const logout = async () => {
        try {
            console.groupCollapsed('AuthContextWrapper', 'logout')
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.logout();
            console.log({ res });
            if (res.code !== 200 || res.data !== true) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToLogout'),
                });
                return;
            }

            setAuth({ user: undefined, ac: undefined });
            nav?.setContent(<Home />);
            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('successfullyToLogout'),
            });
            window.location.reload();
        } catch (error) {
            console.error(error);

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToLogout'),
            });
        } finally {
            console.groupEnd();
        }
    };

    const init = async () => {
        try {
            console.groupCollapsed('AuthContextWrapper', 'init')

            const u = await fetchUser();
            const accessControl = await getAccessControl();

            if (!u || !accessControl) {
                if (!showModal)
                    setShowModal(true)

                setAuth({ user: undefined, ac: undefined });

                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToAuthenticate')
                });
            }

            if (u && accessControl)
                setAuth({ user: u, ac: accessControl })
        } catch (error) {
            console.error('error', error)

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToAuthenticate')
            })
        } finally {
            if (isAuthLoading)
                setIsAuthLoading(false)
            console.groupEnd()
        }
    }

    const [hasInitialized, setHasInitialized] = useState<boolean>(false);
    useEffect(() => {
        console.log('useEffect out', { auth, isAuthLoading, showModal, hasInitialized, configuration })
        if (!hasInitialized && !isAuthLoading && configuration?.hasFetchedConfig && !configuration?.showDbConfigurationModal && (!auth.user || !auth.ac)) {
            console.log('useEffect in', { auth, isAuthLoading, showModal, hasInitialized, configuration })
            setIsAuthLoading(true)
            setHasInitialized(true)
        }
    }, [])

    useEffect(() => {
        console.log('useEffect init', { auth, isAuthLoading, showModal, hasInitialized, configuration })
        init()
    }, [isAuthLoading])

    console.group('AuthContextWrapper', { auth, isAuthLoading, showModal, hasInitialized, configuration })

    return (
        <>
            <AuthContext.Provider value={{ user: auth.user, accessControl: auth.ac, isAuthLoading, logout, showModal: () => setShowModal(true), fetchUser: async () => { await fetchUser() } }}>
                {children}
            </AuthContext.Provider>

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                closeAfterTransition
                disableEscapeKeyDown
                disableAutoFocus
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
            >
                <Slide direction={showModal ? 'up' : 'down'} in={showModal} timeout={250}>
                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                        <LoginForm onFinish={async (username, password) => { await login(username, password); setShowModal(false); }} />
                    </Paper>
                </Slide>
            </Modal>
        </>
    );
}
