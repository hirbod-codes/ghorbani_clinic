import { createContext } from 'react';

export const NavigationContext = createContext<{
    setContent: (content: JSX.Element) => void | Promise<void>,
    content?: JSX.Element,
} | undefined>(undefined);
