import { createContext } from 'react';
import { User } from '../../Electron/Database/Models/User';
import { AccessControl } from 'accesscontrol';

export const AuthContext = createContext<{
    user?: User,
    accessControl?: AccessControl,
    isAuthLoading?: boolean,
    fetchUser: () => void | Promise<void>,
    logout: () => void | Promise<void>,
    showModal: () => void;
} | undefined>(undefined);
