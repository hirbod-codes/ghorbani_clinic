import { Stack, TextField, Button, Checkbox, FormControlLabel, FormGroup, Typography, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { t } from 'i18next';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';
import { publish } from '../../Lib/Events';
import { dbAPI } from '../../../Electron/Database/dbAPI';
import { configAPI } from '../../../Electron/Configuration/renderer';

export default function DbSettingsForm({ noTitle = false }: { noTitle?: boolean }) {
    const [tabValue, setTabValue] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false)

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
        setDatabaseName(config.mongodb?.databaseName ?? 'primaryDb')

        console.groupEnd()
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <>
            {!noTitle &&
                <Typography variant={'h5'}>
                    {t('DbSettingsForm.dbSettings')}
                </Typography>
            }

            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab label="Remote" />
                        <Tab label="Search" />
                    </Tabs>
                </Box>

                <div hidden={tabValue !== 0}>
                    <Stack direction='column' spacing={2}>
                        <TextField variant='standard' type='text' value={username} onChange={(e) => setUsername(e.target.value)} label={t('DbSettingsForm.username')} />
                        <TextField variant='standard' type='password' value={password} onChange={(e) => setPassword(e.target.value)} label={t('DbSettingsForm.password')} />

                        <TextField variant='standard' type='text' value={url.replace('mongodb://', '')} placeholder={t('DbSettingsForm.ip:port')} onChange={(e) => setUrl('mongodb://' + e.target.value.replace('mongodb://', ''))} label={t('DbSettingsForm.url')} />
                        <TextField variant='standard' type='text' value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} label={t('DbSettingsForm.databaseName')} />

                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={supportsTransaction} onChange={(e) => setSupportsTransaction(e.target.checked)} />} label={t('DbSettingsForm.supportsTransaction')} />
                        </FormGroup>

                        <Button
                            variant='outlined'
                            onClick={async () => {
                                const settings = {
                                    url,
                                    databaseName,
                                    supportsTransaction,
                                    auth: (username && password) ? { username, password } : undefined
                                }

                                if (!settings.databaseName || !settings.databaseName.match(/[a-zA-Z]+/) || !settings.url) {
                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'error',
                                        message: t('DbSettingsForm.invalidSettingsProvided')
                                    })
                                    return
                                }
                                setLoading(true)
                                try {
                                    let result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.updateConfig(settings)
                                    if (!result) {
                                        publish(RESULT_EVENT_NAME, {
                                            severity: 'error',
                                            message: t('DbSettingsForm.configUpdateFailed')
                                        })

                                        return
                                    }

                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'success',
                                        message: t('DbSettingsForm.configUpdated')
                                    })

                                    result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.initializeDb()
                                    setLoading(false)
                                    if (!result) {
                                        publish(RESULT_EVENT_NAME, {
                                            severity: 'error',
                                            message: t('DbSettingsForm.databaseInitializationFailed')
                                        })

                                        return
                                    }

                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'success',
                                        message: t('DbSettingsForm.databaseInitialized')
                                    })
                                } catch (e) {
                                    console.error(e)
                                }
                            }}
                        >
                            {loading ? <CircularProgress /> : t('DbSettingsForm.done')}
                        </Button>
                    </Stack>
                </div>
                <div hidden={tabValue !== 1}>
                    <Stack direction='column' spacing={2}>
                        <TextField variant='standard' type='text' value={username} onChange={(e) => setUsername(e.target.value)} label={t('DbSettingsForm.username')} />
                        <TextField variant='standard' type='password' value={password} onChange={(e) => setPassword(e.target.value)} label={t('DbSettingsForm.password')} />

                        <TextField variant='standard' type='text' value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} label={t('DbSettingsForm.databaseName')} />

                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={supportsTransaction} onChange={(e) => setSupportsTransaction(e.target.checked)} />} label={t('DbSettingsForm.supportsTransaction')} />
                        </FormGroup>

                        <Button
                            variant='outlined'
                            onClick={async () => {
                                const settings = {
                                    databaseName,
                                    supportsTransaction,
                                    auth: (username && password) ? { username, password } : undefined
                                }

                                if (!settings.databaseName || !settings.databaseName.match(/[a-zA-Z]+/)) {
                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'error',
                                        message: t('DbSettingsForm.invalidSettingsProvided')
                                    })
                                    return
                                }
                                setLoading(true)
                                const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.searchForDbService(settings.databaseName, settings.supportsTransaction, settings.auth)
                                setLoading(false)
                                if (!result) {
                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'error',
                                        message: t('DbSettingsForm.failure')
                                    })
                                    return
                                }

                                publish(RESULT_EVENT_NAME, {
                                    severity: 'success',
                                    message: t('DbSettingsForm.restartingIn3Seconds')
                                })

                                await (window as typeof window & { dbAPI: dbAPI }).dbAPI.initializeDb()
                            }}
                        >
                            {loading ? <CircularProgress /> : t('DbSettingsForm.search')}
                        </Button>
                    </Stack>
                </div>
            </Box>
        </>
    )
}
