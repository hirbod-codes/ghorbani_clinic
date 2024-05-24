import { Box, Button, TextField } from '@mui/material';
import { useState } from 'react';
import { User } from './auth';

export function LoginForm({ onLoggedIn }: { onLoggedIn: (user: User) => void; }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const submit = (): void => {
        onLoggedIn(new User('', ''))
    }

    return (
        <Box sx={{ width: '100%', padding: '0.5rem 2rem' }}>
            <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} id={username} value={username} label='Username' fullWidth required/>
            <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} id={password} value={password} label='Password' fullWidth required/>
            <Box sx={{ height: '2rem' }} />
            <Button variant='outlined' fullWidth onClick={submit}>Login</Button>
        </Box>
    );
}
