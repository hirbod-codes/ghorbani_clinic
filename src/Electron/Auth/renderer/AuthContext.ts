import { createContext } from 'react';

export const AuthContext = createContext<{
    user: { username: string, roleName: string, privileges: string[] },
    setUser: (user: { username: string, roleName: string, privileges: string[] }) => void
}>({ user: null, setUser: null });
