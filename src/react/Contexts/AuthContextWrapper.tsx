import { useState, useRef, ReactNode, useContext, useEffect } from 'react';
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
    const { t, i18n } = useTranslation();

    const configuration = useContext(ConfigurationContext)
    const setContent = useContext(NavigationContext)?.setContent;

    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
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
            setContent(<Home />);
            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('successfullyToLogout'),
            });
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
            console.groupCollapsed('AuthContextWrapper', 'init');
            const u = await fetchUser();
            if (!u) {
                if (isAuthLoading)
                    setIsAuthLoading(false);
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToAuthenticate')
                });
            }

            const accessControl = await getAccessControl();
            if (!accessControl) {
                if (isAuthLoading)
                    setIsAuthLoading(false);
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToAuthenticate')
                });
            }

            if (isAuthLoading)
                setIsAuthLoading(false);
            setAuth({ user: u, ac: accessControl });
        } catch (error) {
            console.error('error', error);

            if (isAuthLoading)
                setIsAuthLoading(false);
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToAuthenticate')
            });
        } finally {
            console.groupEnd();
        }
    };

    useEffect(() => {
        if (!configuration?.showDbConfigurationModal && configuration?.hasFetchedConfig)
            init().then(() => {
                console.log('AuthContextWrapper if', { auth, isAuthLoading, showModal })
                if (!showModal && (!auth.user || !auth.ac)) {
                    console.log('AuthContextWrapper if', { auth, isAuthLoading, showModal })
                    setShowModal(true)
                }
            });
    }, [])

    console.log('AuthContextWrapper', { configuration, auth, isAuthLoading, showModal })

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
                        <LoginForm onFinish={login} />
                    </Paper>
                </Slide>
            </Modal>
        </>
    );
}
