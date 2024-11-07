import { Button, CircularProgress, Dialog, DialogActions, DialogTitle, Divider, Stack } from '@mui/material'
import DbSettingsForm from '../../../react/Components/Settings/DbSettingsForm'
import { t } from 'i18next'
import { useContext, useState } from 'react'
import { publish } from '../../Lib/Events'
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper'
import { AuthContext } from '../../Contexts/AuthContext'
import { RendererDbAPI } from '../../../Electron/Database/renderer'
import { ipcRenderer } from 'electron'
import { appAPI } from 'src/Electron/handleAppRendererEvents'

export function DbSettings() {
    const auth = useContext(AuthContext)

    // DB Questions
    const [openSeedQuestion, setOpenSeedQuestion] = useState<boolean>(false)
    const [openTruncateDbQuestion, setOpenTruncateDbQuestion] = useState<boolean>(false)

    const [seeding, setSeeding] = useState<boolean>(false)
    const [truncating, setTruncating] = useState<boolean>(false)

    return (
        <>
            <Stack p={2} spacing={2} direction='column'>
                <Stack spacing={2} direction='row'>
                    <Button variant='contained' onClick={() => setOpenSeedQuestion(true)}>
                        {t("DbSettings.Seed")}
                    </Button>

                    <Button color='error' variant='contained' onClick={() => setOpenTruncateDbQuestion(true)}>
                        {t("DbSettings.Truncate")}
                    </Button>
                </Stack>

                <Divider />

                <DbSettingsForm noTitle />
            </Stack>

            <Dialog
                open={openSeedQuestion}
                onClose={() => setOpenSeedQuestion(false)}
            >
                <DialogTitle>
                    {t('DbSettings.doYouWantToSeedDB')}
                </DialogTitle>
                <DialogActions>
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
                                            severity: 'error',
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
                        {seeding ? <CircularProgress size={35} /> : t('DbSettings.yes')}
                    </Button>
                    <Button onClick={() => setOpenSeedQuestion(false)}>{t('DbSettings.no')}</Button>
                </DialogActions>
            </Dialog >

            <Dialog
                open={openTruncateDbQuestion}
                onClose={() => setOpenTruncateDbQuestion(false)}
            >
                <DialogTitle>
                    {t('DbSettings.doYouWantToTruncateDB')}
                </DialogTitle>
                <DialogActions>
                    <Button color='error' onClick={async () => {
                        try {
                            setTruncating(true);
                            const result = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.truncate();
                            setTruncating(false);

                            if (result === true) {
                                setOpenTruncateDbQuestion(false);
                                await auth.logout();
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
                        {truncating ? <CircularProgress size={35} /> : t('DbSettings.yes')}
                    </Button>
                    <Button onClick={() => setOpenTruncateDbQuestion(false)}>{t('DbSettings.no')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

