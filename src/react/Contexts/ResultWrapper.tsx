import { useState, useCallback, ReactNode, useRef } from 'react';
import { Result } from './ResultTypes.d';
import { Alert, Snackbar } from '@mui/material';
import { CheckOutlined, CloseOutlined, DangerousOutlined } from '@mui/icons-material';
import { subscribe } from '../Lib/Events';

export const RESULT_EVENT_NAME = 'showResult'

export function ResultWrapper({ children }: { children?: ReactNode; }) {
    const [resultOpen, setResultOpen] = useState<boolean>(false);
    const [result, setResult] = useState<Result | undefined>(undefined);

    const updateResult = useCallback((r?: Result) => { setResult(r); setResultOpen(true) }, [])

    subscribe(RESULT_EVENT_NAME, (e?: CustomEvent) => updateResult(e?.detail))

    console.log('-------------ResultContextWrapper', '{ result }')

    return (
        <>
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
        </>
    );
}
