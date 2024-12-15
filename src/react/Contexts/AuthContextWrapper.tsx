import { useState, ReactNode, useContext, useEffect, useRef, memo, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { RendererDbAPI } from '../../Electron/Database/renderer';
import { User } from '../../Electron/Database/Models/User';
import { AuthContext } from './AuthContext';
import { AccessControl } from 'accesscontrol';
import { ConfigurationContext } from './Configuration/ConfigurationContext';
import { Modal, Paper, Slide } from '@mui/material';
import { LoginForm } from '../Components/Auth/LoginForm';
import { RESULT_EVENT_NAME } from './ResultWrapper';
import { publish } from '../Lib/Events';
import { useNavigate } from 'react-router-dom';

export const AuthContextWrapper = memo(function AuthContextWrapper({ children }: { children?: ReactNode; }) {
    const { t } = useTranslation();

    const configuration = useContext(ConfigurationContext)
    const navigate = useNavigate()

    const [auth, setAuth] = useState<{ user: User | undefined; ac: AccessControl | undefined; }>({ user: undefined, ac: undefined });
    const [showModal, setShowModal] = useState<boolean>(false)

    const getAccessControl = async (): Promise<AccessControl | undefined> => {
        try {
            console.log('AuthContextWrapper', 'getAccessControl');
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPrivileges();
            console.log({ res });
            if (res.code !== 200)
                return undefined;

            return new AccessControl(res.data);
        } catch (error) {
            console.error(error);
            // throw error;
        }
    };
    const fetchUser = async (): Promise<User | undefined | null> => {
        try {
            console.log('AuthContextWrapper', 'fetchUser')
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getAuthenticatedUser();
            console.log({ res });
            if (res.code !== 200)
                return undefined;

            return res.data;
        } catch (error) {
            console.error(error);
            // throw error;
        }
    };
    const login = async (username: string, password: string) => {
        try {
            console.log('AuthContextWrapper', 'login')

            username = username.trim()
            password = password.trim()

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
            navigate('/')
        } catch (error) {
            console.error(error);

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToAuthenticate'),
            });
        }
    };
    const logout = async () => {
        try {
            console.log('AuthContextWrapper', 'logout')
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
            navigate('/')
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
        }
    };

    const hasInitialized = useRef<boolean>(false);
    const isAuthLoading = useRef<boolean>(false);

    console.log('-------------AuthContextWrapper', { auth, isAuthLoading: isAuthLoading.current, showModal, hasInitialized: hasInitialized.current, configuration })

    const init = async () => {
        try {
            console.group('AuthContextWrapper', 'init')

            isAuthLoading.current = true
            hasInitialized.current = true

            const u = await fetchUser();
            const accessControl = await getAccessControl();

            console.log({ user: u, accessControl })

            if (!u || !accessControl) {
                setAuth({ user: undefined, ac: undefined });

                if (!showModal)
                    setShowModal(true)
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
            if (isAuthLoading.current)
                isAuthLoading.current = false
            console.groupEnd()
        }
    }

    const memoizedChildren = useMemo(() => children, [])

    useEffect(() => {
        console.log('AuthContextWrapper', 'useEffect', 'should init?', !hasInitialized.current && !isAuthLoading.current && configuration?.isConfigurationContextReady && (!auth.user || !auth.ac))
        if (!hasInitialized.current && !isAuthLoading.current && configuration?.isConfigurationContextReady && (!auth.user || !auth.ac))
            init()
    }, [])

    return (
        <>
            <AuthContext.Provider value={{ user: auth.user, accessControl: auth.ac, isAuthLoading: isAuthLoading.current, logout, showModal: () => setShowModal(true), fetchUser: async () => { await fetchUser() } }}>
                {!isAuthLoading.current && memoizedChildren}
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
})
