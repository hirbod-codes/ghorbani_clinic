import { createContext } from 'react';
import { User } from '../../Electron/Database/Models/User';
import { AccessControl } from 'accesscontrol';

export const AuthContext = createContext<{
    user: User,
    setUser: (user: User) => void,
    accessControl?: AccessControl
} | undefined>(undefined);
