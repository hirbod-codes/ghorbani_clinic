import { useState, useCallback, ReactNode, useMemo, memo } from 'react';
import { Result } from './ResultTypes.d';
import { Alert, Snackbar } from '@mui/material';
import { CheckOutlined, CloseOutlined, DangerousOutlined } from '@mui/icons-material';
import { subscribe } from '../Lib/Events';

export const RESULT_EVENT_NAME = 'showResult'

export const ResultWrapper = memo(function ResultWrapper({ children }: { children?: ReactNode; }) {
    const [resultOpen, setResultOpen] = useState<boolean>(false);
    const [result, setResult] = useState<Result | undefined>(undefined);

    const memoizedChildren = useMemo(() => children, [])

    subscribe(RESULT_EVENT_NAME, (e?: CustomEvent) => { setResult(e?.detail); setResultOpen(true) })

    console.log('-------------ResultContextWrapper', '{ result }')

    return (
        <>
            {memoizedChildren}

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
})
