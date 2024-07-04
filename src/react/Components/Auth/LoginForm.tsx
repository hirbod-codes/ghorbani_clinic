import { Stack, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { t } from 'i18next';

export function LoginForm({ onFinish }: { onFinish: (username: string, password: string) => void | Promise<void>; }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    return (
        <>
            <Stack direction='column' spacing={2}>
                <TextField variant='standard' type='text' value={username} onChange={(e) => setUsername(e.target.value)} label={t('username')} />
                <TextField variant='standard' type='password' value={password} onChange={(e) => setPassword(e.target.value)} label={t('password')} />
                <Button onClick={() => onFinish(username, password)}>
                    {t('login')}
                </Button>
            </Stack>
        </>
    );
}
