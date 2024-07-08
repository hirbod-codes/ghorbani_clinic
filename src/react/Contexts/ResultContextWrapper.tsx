import { useState, ReactNode } from 'react';
import { Result, ResultContext } from './ResultContext';
import { Alert, Snackbar } from '@mui/material';
import { CheckOutlined, CloseOutlined, DangerousOutlined } from '@mui/icons-material';


export function ResultContextWrapper({ children }: { children?: ReactNode; }) {
    const [resultOpen, setResultOpen] = useState<boolean>(false);
    const [result, setResult] = useState<Result | undefined>(undefined);

    console.log('ResultContextWrapper', { result })

    return (
        <ResultContext.Provider value={{ result, setResult: (r) => { setResult(r); setResultOpen(true) } }}>
            {children}
            <Snackbar
                open={resultOpen}
                autoHideDuration={7000}
                onClose={() => { setResultOpen(false) }}
                action={result?.action}
            >
                <Alert
                    icon={result?.severity === 'success' ? <CheckOutlined fontSize="inherit" /> : (result?.severity === 'error' ? <CloseOutlined fontSize="inherit" /> : (result?.severity === 'warning' ? <DangerousOutlined fontSize="inherit" /> : null))}
                    severity={result?.severity}
                >
                    {result?.message}
                </Alert>
            </Snackbar>
        </ResultContext.Provider>
    );
}
