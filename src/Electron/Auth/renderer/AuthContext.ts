import { createContext } from 'react';
import { User } from '../auth-types';

export const AuthContext = createContext<{
    user: User,
    setUser: (user: User) => void
}>({ user: null, setUser: null });
