import { Stack, TextField, Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { useState } from 'react';
import { MongodbConfig } from '../../../Electron/Configuration/types';
import { t } from 'i18next';

export default function DbSettingsForm({ onFinish }: { onFinish: (settings: MongodbConfig) => void | Promise<void>; }) {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [supportsTransaction, setSupportsTransaction] = useState<boolean>(false)
    const [url, setUrl] = useState<string>('')
    const [databaseName, setDatabaseName] = useState<string>('')

    return (
        <>
            <Typography variant={'h5'}>
                {t('dbSettings')}
            </Typography>

            <Stack direction='column' spacing={2}>
                <TextField variant='standard' type='text' value={username} onChange={(e) => setUsername(e.target.value)} label={t('username')} />
                <TextField variant='standard' type='password' value={password} onChange={(e) => setPassword(e.target.value)} label={t('password')} />

                <TextField variant='standard' type='text' value={url} onChange={(e) => setUrl(e.target.value)} label={t('url')} />
                <TextField variant='standard' type='text' value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} label={t('databaseName')} />

                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={supportsTransaction} onChange={(e) => setSupportsTransaction(e.target.checked)} />} label={t('supportsTransaction')} />
                </FormGroup>

                <Button onClick={() => onFinish({ url, databaseName, supportsTransaction, auth: { username, password } })}>
                    {t('done')}
                </Button>
            </Stack>
        </>
    )
}
