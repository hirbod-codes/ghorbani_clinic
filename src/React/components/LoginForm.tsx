import { Box, Button, TextField, Snackbar, Alert } from '@mui/material';
import { useContext, useState } from 'react';
import type { authAPI } from '../../Electron/Auth/renderer/authAPI';
import { AuthContext } from '../../Electron/Auth/renderer/AuthContext';

import CheckIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import DangerIcon from '@mui/icons-material/DangerousOutlined';

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(AuthContext)

    const submit = async (): Promise<void> => {
        const result = await (window as typeof window & { authAPI: authAPI }).authAPI.login(username, password)

        if (result === true) {
            setUser(await (window as typeof window & { authAPI: authAPI }).authAPI.getAuthenticatedUser())
            setResult({
                severity: 'success',
                message: 'successful',
            })
        }
        else
            setResult({
                severity: 'error',
                message: 'Invalid credentials provided',
            })
    }

    const [result, setResult] = useState(null)

    return (
        <>
            <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} id='username' value={username} label='Username' fullWidth required />
            <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} id='password' value={password} label='Password' fullWidth required type='password' />
            <Box sx={{ height: '2rem' }} />
            <Button variant='outlined' fullWidth onClick={submit}>Login</Button>

            <Snackbar
                open={result !== null}
                autoHideDuration={7000}
                onClose={() => setResult(null)}
                action={result?.action}
            >
                <Alert
                    icon={result?.severity === 'success' ? <CheckIcon fontSize="inherit" /> : (result?.severity === 'error' ? <CloseIcon fontSize="inherit" /> : (result?.severity === 'warning' ? <DangerIcon fontSize="inherit" /> : null))}
                    severity={result?.severity}
                >
                    {result?.message}
                </Alert>
            </Snackbar>
        </>
    );
}
