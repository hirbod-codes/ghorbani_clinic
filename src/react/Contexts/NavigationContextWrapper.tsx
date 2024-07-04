import { useState, ReactNode } from 'react';
import { Home } from '../Pages/Home';
import { NavigationContext } from './NavigationContext';


export function NavigationContextWrapper({ children }: { children?: ReactNode; }) {
    const [content, setContent] = useState(<Home />)

    console.log('NavigationContextWrapper', { content })

    return (
        <NavigationContext.Provider value={{ content, setContent }}>
            {children}
        </NavigationContext.Provider>
    );
}
