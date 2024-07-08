import { useContext, useEffect, useRef, useState } from "react";
import { t } from "i18next";
import { Box, Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { RefreshOutlined } from "@mui/icons-material";
import { ResultContext } from "../Contexts/ResultContext";
import { AnimatedCircularProgressBar } from "../Components/ProgressBars/AnimatedCircularProgressBar";
import { AnimatedCounter } from "../Components/Counters/AnimatedCounter";
import { SearchPatientField } from "../Components/Search/SearchPatientField";

export function Home() {
    const setResult = useContext(ResultContext).setResult

    // const [initialized, setInitialized] = useState<boolean>(false)
    const initialized = useRef<boolean>(false)
    const [initLoading, setInitLoading] = useState<boolean>(true)
    const [initFailed, setInitFailed] = useState<boolean>(false)

    const [visitsCount, setVisitsCount] = useState<number | undefined>()
    const [expiredVisitsCount, setExpiredVisitsCount] = useState<number | undefined>()
    const [patientsCount, setPatientsCount] = useState<number | undefined>()

    console.log('Home', { initLoading, initFailed, visitsCount, expiredVisitsCount, patientsCount })

    const initPatientsProgressBars = async () => {
        setPatientsCount(undefined)
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatientsEstimatedCount()
            if (res.code !== 200 || !res.data)
                throw new Error(`bad response. Response code: ${res.code}`)

            setPatientsCount(res.data)
        } catch (error) {
            console.error('Home', 'initPatientsProgressBars', error)

            setResult({
                severity: 'error',
                message: t('failedToFetchPatientsCount')
            })

            throw error
        }
    }
    const initVisitsProgressBars = async () => {
        setVisitsCount(undefined)
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisitsEstimatedCount()
            if (res.code !== 200 || !res.data)
                throw new Error(`bad response. Response code: ${res.code}`)

            setVisitsCount(res.data)
        } catch (error) {
            console.error('Home', 'initVisitsProgressBars', error)

            setResult({
                severity: 'error',
                message: t('failedToFetchVisitsCount')
            })

            throw error
        }
    }
    const initExpiredVisitsProgressBars = async () => {
        setExpiredVisitsCount(undefined)
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getExpiredVisitsCount()
            if (res.code !== 200 || !res.data)
                throw new Error(`bad response. Response code: ${res.code}`)

            setExpiredVisitsCount(res.data)
        } catch (error) {
            console.error('Home', 'initExpiredVisitsProgressBars', error)

            setResult({
                severity: 'error',
                message: t('failedToFetchExpiredVisitsCount')
            })

            throw error
        }
    }

    const initProgressBars = async () => {
        setInitFailed(false)
        setInitLoading(true)

        try {
            await Promise.all([
                initPatientsProgressBars(),
                initVisitsProgressBars(),
                initExpiredVisitsProgressBars(),
            ])

            setInitLoading(false)
        } catch (error) {
            console.error('Home', 'initProgressBars', error)
            setInitFailed(true)
        }
    }

    useEffect(() => {
        if (!initialized.current)
            initProgressBars()
                .then(() => (initialized.current = true))
    }, [])

    return (
        <>
            <Grid container spacing={1} p={1}>
                <Grid item xs={0} sm={3}></Grid>
                <Grid item xs={12} sm={6}>
                    <SearchPatientField />
                </Grid>
                <Grid item xs={0} sm={3}></Grid>

                <Grid item xs={12}>
                    <Box mb={10}></Box>
                </Grid>

                {initFailed
                    ?
                    <>
                        <Grid item xs={3}></Grid>
                        <Grid item xs={6}>
                            <Button onClick={async () => await initProgressBars()} variant='outlined' startIcon={<RefreshOutlined />} fullWidth> {t('Reload')} </Button>
                        </Grid>
                        <Grid item xs={3}></Grid>
                    </>
                    :
                    (
                        initLoading
                            ?
                            <>
                                <Grid item xs={12}>
                                    <Stack direction='row' justifyContent='center'>
                                        <CircularProgress size={80} />
                                    </Stack>
                                </Grid>
                            </>
                            :
                            <>
                                <Grid item xs={6} container justifyContent='center'>
                                    {visitsCount
                                        ?
                                        <AnimatedCircularProgressBar start={0} end={70}>
                                            <Typography variant='h4'>
                                                <AnimatedCounter start={0} end={visitsCount} />
                                            </Typography>
                                        </AnimatedCircularProgressBar>
                                        :
                                        <CircularProgress />
                                    }
                                </Grid>

                                <Grid item xs={6} container justifyContent='center' alignContent='center'>
                                    {expiredVisitsCount
                                        ?
                                        <AnimatedCircularProgressBar start={0} end={70}>
                                            <Typography variant='h4'>
                                                <AnimatedCounter start={0} end={expiredVisitsCount} />
                                            </Typography>
                                        </AnimatedCircularProgressBar>
                                        :
                                        <CircularProgress />
                                    }
                                </Grid>

                                <Grid item xs={3}></Grid>
                                <Grid item xs={6} container justifyContent='center'>
                                    {patientsCount
                                        ?
                                        <AnimatedCircularProgressBar start={0} end={70}>
                                            <Typography variant='h4'>
                                                <AnimatedCounter start={0} end={patientsCount} />
                                            </Typography>
                                        </AnimatedCircularProgressBar>
                                        :
                                        <CircularProgress />
                                    }
                                </Grid>
                                <Grid item xs={3}></Grid>
                            </>
                    )
                }
            </Grid>
        </>
    )
}
