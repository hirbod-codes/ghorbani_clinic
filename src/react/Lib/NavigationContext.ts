import { createContext } from 'react';

export const NavigationContext = createContext<{
    goHome: () => void | Promise<void>
} | undefined>(undefined);
