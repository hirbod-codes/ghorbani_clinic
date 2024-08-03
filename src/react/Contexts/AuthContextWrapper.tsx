import { useState, useRef, ReactNode, useContext } from 'react';
import { useTranslation } from "react-i18next";
import { RendererDbAPI } from '../../Electron/Database/handleDbRendererEvents';
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

    const getAccessControl = async (): Promise<AccessControl | undefined> => {
        try {
            console.log('getAccessControl', 'start');
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPrivileges();
            console.log('getAccessControl', 'res', res);
            if (res.code !== 200)
                return undefined;

            return new AccessControl(res.data);
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            console.log('getAccessControl', 'end');
        }
    };
    const fetchUser = async (): Promise<User | undefined> => {
        try {
            console.log('fetchUser', 'start');
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getAuthenticatedUser();
            console.log('fetchUser', 'res', res);
            if (res.code !== 200)
                return undefined;

            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            console.log('fetchUser', 'end');
        }
    };
    const login = async (username: string, password: string) => {
        try {
            console.log('login', 'username', username);
            console.log('login', 'password', password);
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.login(username, password);
            console.log('login', 'res', res);
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
            console.log('login', 'end');
        }
    };
    const logout = async () => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.logout();
            console.log('logout', 'res', res);
            if (res.code !== 200) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToLogout'),
                });
                return;
            }

            if (res.data !== true) {
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
            console.log('logout', 'end');
        }
    };

    const init = async () => {
        try {
            console.log('init', 'start');
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
        } finally { console.log('init', 'end'); }
    };

    const hasInit = useRef<boolean>(false);

    if (!configuration?.showDbConfigurationModal && configuration?.hasFetchedConfig && !hasInit.current) {
        hasInit.current = true;
        init();
    }

    console.log('AuthContextWrapper', { auth, isAuthLoading })

    return (
        <>
            <AuthContext.Provider value={{ user: auth.user, accessControl: auth.ac, isAuthLoading, logout, fetchUser: async () => { await fetchUser() } }}>
                {children}
            </AuthContext.Provider>

            <Modal open={!isAuthLoading && (!auth.user || !auth.ac)} closeAfterTransition disableEscapeKeyDown disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={!isAuthLoading && (!auth.user || !auth.ac) ? 'up' : 'down'} in={!isAuthLoading && (!auth.user || !auth.ac)} timeout={250}>
                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                        <LoginForm onFinish={login} />
                    </Paper>
                </Slide>
            </Modal>
        </>
    );
}
