import { useState, ReactNode, useRef } from 'react';
import { Home } from '../Pages/Home';
import { NavigationContext } from './NavigationContext';


export function NavigationContextWrapper({ children }: { children?: ReactNode; }) {
    const [content, setContent] = useState(<Home />)
    const [pageHasLoaded, setPageHasLoaded] = useState(true)

    console.log('-------------NavigationContextWrapper', { content, pageHasLoaded })

    return (
        <NavigationContext.Provider value={{ content, setContent, pageHasLoaded, setPageHasLoaded }}>
            {children}
        </NavigationContext.Provider>
    );
}
