import { useState, ReactNode } from 'react';
import { Result, ResultContext } from './ResultContext';


export function ResultContextWrapper({ children }: { children?: ReactNode; }) {
    const [result, setResult] = useState<Result | undefined>(undefined);

    console.log('ResultContextWrapper', { result })

    return (
        <ResultContext.Provider value={{ result, setResult }}>
            {children}
        </ResultContext.Provider>
    );
}
