import { createContext } from 'react';
import { User } from '../../Database/Models/User';

export const AuthContext = createContext<{
    user: User,
    setUser: (user: User) => void
} | undefined>(undefined);
