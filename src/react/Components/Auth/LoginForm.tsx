import { useState } from 'react';
import { t } from 'i18next';
import { Stack } from '../Base/Stack';
import { Input } from '../Base/Input';
import { Button } from '../Base/Button';

export function LoginForm({ onFinish }: { onFinish: (username: string, password: string) => void | Promise<void>; }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
            <Stack direction='vertical'>
                <Input type='text' value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('username')} />
                <Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} />
                <Button onClick={() => onFinish(username, password)}>
                    {t('LoginForm.login')}
                </Button>
            </Stack>
        </>
    );
}
