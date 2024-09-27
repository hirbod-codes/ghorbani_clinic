import { MutableRefObject, createContext } from 'react';

export const NavigationContext = createContext<{
    setContent: (content: JSX.Element) => void | Promise<void>,
    content?: JSX.Element,
    pageHasLoaded: boolean,
    setPageHasLoaded: (v: boolean) => void
} | undefined>(undefined);
