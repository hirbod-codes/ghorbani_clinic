import { Stack, TextField, Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { useState, useContext } from 'react';
import { t } from 'i18next';
import { configAPI } from '../../../Electron/Configuration/renderer/configAPI';
import { appAPI } from '../../../Electron/handleAppRendererEvents';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';
import { publish } from '../../Lib/Events';

export default function DbSettingsForm({ noTitle = false }: { noTitle?: boolean }) {

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [supportsTransaction, setSupportsTransaction] = useState<boolean>(false)
    const [url, setUrl] = useState<string>('')
    const [databaseName, setDatabaseName] = useState<string>('')

    return (
        <>
            {!noTitle &&
                <Typography variant={'h5'}>
                    {t('dbSettings')}
                </Typography>
            }

            <Stack direction='column' spacing={2}>
                <TextField variant='standard' type='text' value={username} onChange={(e) => setUsername(e.target.value)} label={t('username')} />
                <TextField variant='standard' type='password' value={password} onChange={(e) => setPassword(e.target.value)} label={t('password')} />

                <TextField variant='standard' type='text' value={url} onChange={(e) => setUrl(e.target.value)} label={t('url')} />
                <TextField variant='standard' type='text' value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} label={t('databaseName')} />

                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={supportsTransaction} onChange={(e) => setSupportsTransaction(e.target.checked)} />} label={t('supportsTransaction')} />
                </FormGroup>

                <Button onClick={async () => {
                    const settings = { url, databaseName, supportsTransaction, auth: { username, password } }

                    if (!settings.auth || !settings.auth.username || !settings.auth.password || !settings.databaseName || !settings.url) {
                        publish(RESULT_EVENT_NAME, {
                            severity: 'error',
                            message: t('invalidSettingsProvided')
                        })
                        return
                    }
                    const c = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig();
                    (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig({
                        ...c,
                        mongodb: settings
                    });

                    (window as typeof window & { appAPI: appAPI }).appAPI.reLaunch()
                }}>
                    {t('done')}
                </Button>
            </Stack>
        </>
    )
}
