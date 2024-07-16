import { useState, ReactNode } from 'react';
import { Home } from '../Pages/Home';
import { NavigationContext } from './NavigationContext';
import { Patients } from '../Pages/Patients';


export function NavigationContextWrapper({ children }: { children?: ReactNode; }) {
    const [content, setContent] = useState(<Patients />)

    console.log('NavigationContextWrapper', { content })

    return (
        <NavigationContext.Provider value={{ content, setContent }}>
            {children}
        </NavigationContext.Provider>
    );
}
