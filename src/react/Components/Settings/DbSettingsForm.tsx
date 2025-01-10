import { useState, useEffect } from 'react';
import { t } from 'i18next';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';
import { publish } from '../../Lib/Events';
import { dbAPI } from '../../../Electron/Database/dbAPI';
import { configAPI } from '../../../Electron/Configuration/renderer.d';
import { Input } from '../Base/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shadcn/components/ui/tabs';
import { Switch } from '../Base/Switch';
import { Button } from '../../Components/Base/Button';
import { CircularLoading } from '../Base/CircularLoading';
import { Stack } from '../Base/Stack';

export default function DbSettingsForm({ noTitle = false }: { noTitle?: boolean }) {
    const [tabValue, setTabValue] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false)

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [supportsTransaction, setSupportsTransaction] = useState<boolean>(false)
    const [url, setUrl] = useState<string>('')
    const [databaseName, setDatabaseName] = useState<string>('')

    const init = async () => {
        const c = (await (window as typeof window & { configAPI: configAPI; }).configAPI.readDbConfig())!;

        setUsername(c?.auth?.username ?? '')
        setPassword(c?.auth?.password ?? '')
        setSupportsTransaction(c.supportsTransaction ?? false)
        setUrl(c.url ?? '')
        setDatabaseName(c.databaseName ?? 'primaryDb')
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <>
            {!noTitle &&
                <h5>
                    {t('DbSettingsForm.dbSettings')}
                </h5>
            }

            <Tabs defaultValue="Remote">
                <TabsList>
                    <TabsTrigger value="Remote">Remote</TabsTrigger>
                    <TabsTrigger value="Search">Search</TabsTrigger>
                </TabsList>
                <TabsContent value="Remote">
                    <Stack direction='vertical'>
                        <Input value={username} placeholder={t('DbSettingsForm.username')} onChange={(e) => setUsername(e.target.value)} label={t('DbSettingsForm.username')} />
                        <Input type='password' value={password} placeholder={t('DbSettingsForm.password')} onChange={(e) => setPassword(e.target.value)} label={t('DbSettingsForm.password')} />

                        <Input value={url.replace('mongodb://', '')} placeholder={t('DbSettingsForm.ip_port')} onChange={(e) => setUrl('mongodb://' + e.target.value.replace('mongodb://', ''))} label={t('DbSettingsForm.url')} />
                        <Input value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} placeholder={t('DbSettingsForm.db_name')} label={t('DbSettingsForm.databaseName')} />

                        <Switch
                            label={t('DbSettingsForm.supportsTransaction')}
                            labelId={t('DbSettingsForm.supportsTransaction')}
                            checked={supportsTransaction}
                            onChange={(e) => setSupportsTransaction(Boolean(e.currentTarget.value))}
                        />

                        <Button
                            variant='outline'
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
                            {loading ? <CircularLoading /> : t('DbSettingsForm.done')}
                        </Button>
                    </Stack>
                </TabsContent>
                <TabsContent value="Search">
                    <Stack direction='vertical'>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} label={t('DbSettingsForm.username')} />
                        <Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} label={t('DbSettingsForm.password')} />

                        <Input value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} label={t('DbSettingsForm.databaseName')} />

                        <Switch
                            label={t('DbSettingsForm.supportsTransaction')}
                            labelId={t('DbSettingsForm.supportsTransaction')}
                            checked={supportsTransaction}
                            onChange={(e) => setSupportsTransaction(Boolean(e.currentTarget.value))}
                        />

                        <Button
                            variant='outline'
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
                            {loading ? <CircularLoading /> : t('DbSettingsForm.search')}
                        </Button>
                    </Stack>
                </TabsContent>
            </Tabs>
        </>
    )
}
