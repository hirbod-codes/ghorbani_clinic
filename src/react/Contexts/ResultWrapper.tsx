import { useState, useCallback, ReactNode, useRef } from 'react';
import { Result } from './ResultTypes.d';
import { Alert, Snackbar } from '@mui/material';
import { CheckOutlined, CloseOutlined, DangerousOutlined } from '@mui/icons-material';
import { subscribe } from '../Lib/Events';

export const RESULT_EVENT_NAME = 'showResult'

export function ResultWrapper({ children }: { children?: ReactNode; }) {
    // const [resultOpen, setResultOpen] = useState<boolean>(false);
    // const [result, setResult] = useState<Result | undefined>(undefined);

    // const updateResult = useCallback((r?: Result) => { setResult(r); setResultOpen(true) }, [])

    // const resultOpen = useRef<boolean>(false);
    // const result = useRef<Result | undefined>(undefined);

    // const updateResult = useCallback((r?: Result) => { result.current = r; resultOpen.current = true }, [])

    // subscribe(RESULT_EVENT_NAME, (e?: CustomEvent) => updateResult(e?.detail))

    console.log('-------------ResultContextWrapper', '{ result }')

    return (
        <>
            {children}

            {/* <Snackbar
                open={resultOpen.current}
                autoHideDuration={7000}
                onClose={() => { resultOpen.current = false }}
                // onClose={() => { setResultOpen(false) }}
                action={result.current?.action}
            >
                <Alert
                    icon={result.current?.severity === 'success' ? <CheckOutlined fontSize="inherit" /> : (result.current?.severity === 'error' ? <CloseOutlined fontSize="inherit" /> : (result.current?.severity === 'warning' ? <DangerousOutlined fontSize="inherit" /> : null))}
                    severity={result.current?.severity}
                >
                    {result.current?.message}
                </Alert>
            </Snackbar> */}
        </>
    );
}
