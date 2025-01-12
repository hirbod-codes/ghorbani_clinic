import DbSettingsForm from '../../../react/Components/Settings/DbSettingsForm'
import { t } from 'i18next'
import { memo, useContext, useState } from 'react'
import { publish } from '../../Lib/Events'
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper'
import { AuthContext } from '../../Contexts/AuthContext'
import { RendererDbAPI } from '../../../Electron/Database/renderer'
import { appAPI } from '../../../Electron/appRendererEvents'
import { Modal } from '../../Components/Base/Modal'
import { Button } from '../../Components/Base/Button'
import { CircularLoadingIcon } from '../../Components/Base/CircularLoadingIcon'
import { Separator } from '../../shadcn/components/ui/separator'
import { Stack } from '../../Components/Base/Stack'

export const DbSettings = memo(function DbSettings() {
    const auth = useContext(AuthContext)

    // DB Questions
    const [openSeedQuestion, setOpenSeedQuestion] = useState<boolean>(false)
    const [openTruncateDbQuestion, setOpenTruncateDbQuestion] = useState<boolean>(false)

    const [seeding, setSeeding] = useState<boolean>(false)
    const [truncating, setTruncating] = useState<boolean>(false)

    const [checkingConnectionHealth, setCheckingConnectionHealth] = useState<boolean>(false)
    const [connectionHealth, setConnectionHealth] = useState<boolean>(false)
    const checkConnectionHealth = async () => {
        const result = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.checkConnectionHealth()
        console.log('checkConnectionHealth', { result: Boolean(result) })
        setConnectionHealth(Boolean(result))
    }

    console.log('DbSettings', { openSeedQuestion, openTruncateDbQuestion, seeding, truncating, checkingConnectionHealth, connectionHealth });

    return (
        <>
            <div className='grid-cols-12'>
                <div className='sm:col-span-3' />
                <div className='sm:col-span-12 md:col-span-6'>
                    <Stack direction='vertical'>
                        <Stack>
                            <Button onClick={() => setOpenSeedQuestion(true)}>
                                {t("DbSettings.Seed")}
                            </Button>

                            <Button fgColor='success' onClick={() => setOpenTruncateDbQuestion(true)}>
                                {t("DbSettings.Truncate")}
                            </Button>

                            <Button fgColor={connectionHealth ? 'success' : 'error'} onClick={async () => { setCheckingConnectionHealth(true); await checkConnectionHealth(); setCheckingConnectionHealth(false) }}>
                                {t("DbSettings.CheckConnection")}{checkingConnectionHealth && <CircularLoadingIcon />}
                            </Button>
                        </Stack>

                        <Separator />

                        <DbSettingsForm noTitle />
                    </Stack>
                </div>
                <div className='sm:col-span-3' />
            </div >

            <Modal open={openSeedQuestion} onClose={() => setOpenSeedQuestion(false)}>
                <Button
                    onClick={async () => {
                        try {
                            setSeeding(true);
                            let result = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.initializeDb()
                            console.log({ result })
                            if (!result) {
                                publish(RESULT_EVENT_NAME, {
                                    severity: 'error',
                                    message: t('DbSettings.failedToSeedDB')
                                });
                                setSeeding(false);
                            }
                            else {
                                result = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.seed();
                                console.log({ result })
                                setSeeding(false);

                                if (result === true) {
                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'success',
                                        message: t('DbSettings.successfullySeededDB')
                                    });
                                    setOpenSeedQuestion(false);
                                }
                                else
                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'error',
                                        message: t('DbSettings.failedToSeedDB')
                                    });
                            }
                        } catch (error) {
                            console.error(error);
                            setSeeding(false);
                        }
                    }}
                >
                    {seeding ? <CircularLoadingIcon /> : t('DbSettings.yes')}
                </Button>
                <Button onClick={() => setOpenSeedQuestion(false)}>{t('DbSettings.no')}</Button>
            </Modal>

            <Modal open={openTruncateDbQuestion} onClose={() => setOpenTruncateDbQuestion(false)}>
                <Button fgColor='error' onClick={async () => {
                    try {
                        setTruncating(true);
                        const result = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.truncate();
                        setTruncating(false);

                        if (result === true) {
                            setOpenTruncateDbQuestion(false);
                            await auth!.logout();
                            window.location.reload();
                            (window as typeof window & { dbAPI: appAPI; }).dbAPI.reLaunch()
                        }

                        else
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('DbSettings.failedToSeedDB')
                            });
                    } catch (error) {
                        console.error(error);
                        setTruncating(false);
                    }
                }}>
                    {truncating ? <CircularLoadingIcon /> : t('DbSettings.yes')}
                </Button>
                <Button onClick={() => setOpenTruncateDbQuestion(false)}>{t('DbSettings.no')}</Button>
            </Modal>
        </>
    )
})

