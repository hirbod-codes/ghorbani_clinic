import { useState, ReactNode, useMemo, memo } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { CheckOutlined, CloseOutlined, DangerousOutlined } from '@mui/icons-material';
import { subscribe } from '../Lib/Events';
import { AlertColor, AlertPropsColorOverrides } from '@mui/material';
import { OverridableStringUnion } from "@mui/types";

export type Result = {
    message: string;
    severity: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>;
    action?: ReactNode;
};

export const RESULT_EVENT_NAME = 'showResult'

export const ResultWrapper = memo(function ResultWrapper({ children }: { children?: ReactNode; }) {
    const [resultOpen, setResultOpen] = useState<boolean>(false);
    const [result, setResult] = useState<Result | undefined>(undefined);

    const memoizedChildren = useMemo(() => children, [])

    subscribe(RESULT_EVENT_NAME, (e?: any) => { setResult(e?.detail); setResultOpen(true) })

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
