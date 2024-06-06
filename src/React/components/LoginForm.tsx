import { Box, Button, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import type { authAPI } from '../../Electron/Auth/renderer/authAPI';
import { AuthContext } from '../../Electron/Auth/renderer/AuthContext';

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(AuthContext)

    const submit = async (): Promise<void> => {
        const result = await (window as typeof window & { authAPI: authAPI }).authAPI.login(username, password)

        if (result === true)
            setUser(await (window as typeof window & { authAPI: authAPI }).authAPI.getAuthenticatedUser())
    }

    return (
        <>
            <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} id='username' value={username} label='Username' fullWidth required />
            <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} id='password' value={password} label='Password' fullWidth required type='password' />
            <Box sx={{ height: '2rem' }} />
            <Button variant='outlined' fullWidth onClick={submit}>Login</Button>
        </>
    );
}
