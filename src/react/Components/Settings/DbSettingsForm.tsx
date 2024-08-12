import { Stack, TextField, Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { useState, useContext, useEffect } from 'react';
import { t } from 'i18next';
import { configAPI } from '../../../Electron/Configuration/renderer/configAPI';
import { appAPI } from '../../../Electron/handleAppRendererEvents';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';
import { publish } from '../../Lib/Events';
import { dbAPI } from '../../../Electron/Database/dbAPI';

export default function DbSettingsForm({ noTitle = false }: { noTitle?: boolean }) {

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [supportsTransaction, setSupportsTransaction] = useState<boolean>(false)
    const [url, setUrl] = useState<string>('')
    const [databaseName, setDatabaseName] = useState<string>('')

    const init = async () => {
        console.group('init')

        const config = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig();
        console.log({ c: config })

        setUsername(config.mongodb?.auth?.username ?? '')
        setPassword(config.mongodb?.auth?.password ?? '')
        setSupportsTransaction(config.mongodb?.supportsTransaction ?? false)
        setUrl(config.mongodb?.url ?? '')
        setDatabaseName(config.mongodb?.databaseName ?? '')

        console.groupEnd()
    }

    useEffect(() => {
        init()
    }, [])

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

                <TextField variant='standard' type='text' value={url.replace('mongodb://', '')} placeholder={t('ip:port')} onChange={(e) => setUrl('mongodb://' + e.target.value)} label={t('url')} />
                <TextField variant='standard' type='text' value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} label={t('databaseName')} />

                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={supportsTransaction} onChange={(e) => setSupportsTransaction(e.target.checked)} />} label={t('supportsTransaction')} />
                </FormGroup>

                <Button onClick={async () => {
                    const settings = {
                        url,
                        databaseName,
                        supportsTransaction,
                        auth: (username && password) ? { username, password } : undefined
                    }

                    if (!settings.databaseName || !settings.url) {
                        publish(RESULT_EVENT_NAME, {
                            severity: 'error',
                            message: t('invalidSettingsProvided')
                        })
                        return
                    }
                    const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.updateConfig(settings)
                    if (!result) {
                        publish(RESULT_EVENT_NAME, {
                            severity: 'error',
                            message: t('failure')
                        })
                        return
                    }

                    publish(RESULT_EVENT_NAME, {
                        severity: 'success',
                        message: t('restartingIn3Seconds')
                    })

                    setTimeout(() => {
                        (window as typeof window & { appAPI: appAPI }).appAPI.reLaunch()
                    }, 3000)
                }}>
                    {t('done')}
                </Button>
            </Stack>
        </>
    )
}
