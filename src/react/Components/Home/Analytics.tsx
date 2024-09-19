import { useEffect, useRef, useState } from "react";
import { t } from "i18next";
import { Box, Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { RefreshOutlined } from "@mui/icons-material";
import { AnimatedCircularProgressBar } from "../ProgressBars/AnimatedCircularProgressBar";
import { AnimatedCounter } from "../Counters/AnimatedCounter";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";


export function Analytics() {
    const initialized = useRef<boolean>(false);
    const [initLoading, setInitLoading] = useState<boolean>(true);
    const [initFailed, setInitFailed] = useState<boolean>(false);

    const [visitsCount, setVisitsCount] = useState<number | undefined>(undefined);
    const [expiredVisitsCount, setExpiredVisitsCount] = useState<number | undefined>(undefined);
    const [patientsCount, setPatientsCount] = useState<number | undefined>(undefined);

    console.log('Analytics', { initLoading, initFailed, visitsCount, expiredVisitsCount, patientsCount });

    const initPatientsProgressBars = async () => {
        setPatientsCount(undefined);
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPatientsEstimatedCount();
            if (res.code !== 200 || !res.data)
                throw new Error(`bad response. Response code: ${res.code}`);

            setPatientsCount(res.data);
        } catch (error) {
            console.error('Analytics', 'initPatientsProgressBars', error);

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToFetchPatientsCount')
            });

            throw error;
        }
    };
    const initVisitsProgressBars = async () => {
        setVisitsCount(undefined);
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getVisitsEstimatedCount();
            if (res.code !== 200 || !res.data)
                throw new Error(`bad response. Response code: ${res.code}`);

            setVisitsCount(res.data);
        } catch (error) {
            console.error('Analytics', 'initVisitsProgressBars', error);

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToFetchVisitsCount')
            });

            throw error;
        }
    };
    const initExpiredVisitsProgressBars = async () => {
        setExpiredVisitsCount(undefined);
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getExpiredVisitsCount();
            if (res.code !== 200 || !res.data)
                throw new Error(`bad response. Response code: ${res.code}`);

            setExpiredVisitsCount(res.data);
        } catch (error) {
            console.error('Analytics', 'initExpiredVisitsProgressBars', error);

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToFetchExpiredVisitsCount')
            });

            throw error;
        }
    };

    const initProgressBars = async () => {
        setInitFailed(false);
        setInitLoading(true);

        try {
            await Promise.all([
                initPatientsProgressBars(),
                initVisitsProgressBars(),
                initExpiredVisitsProgressBars(),
            ]);

            setInitLoading(false);
        } catch (error) {
            console.error('Analytics', 'initProgressBars', error);
            setInitLoading(false);
            setInitFailed(true);
        }
    };

    useEffect(() => {
        if (!initialized.current)
            initProgressBars()
                .then(() => (initialized.current = true));
    }, []);

    return (
        <>
            <Grid container spacing={1} p={1}>
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
                        <>
                            <Grid item xs={6} container justifyContent='center'>
                                {visitsCount
                                    ?
                                    <Box>
                                        <AnimatedCircularProgressBar start={0} end={70}>
                                            <Typography variant='h4'>
                                                <AnimatedCounter start={0} end={visitsCount} />
                                            </Typography>
                                        </AnimatedCircularProgressBar>
                                        <Typography variant="body1" textAlign='center' sx={{ position: 'relative', top: '-3rem' }}>
                                            {t('visits')}
                                        </Typography>
                                    </Box>
                                    :
                                    <CircularProgress />}
                            </Grid>

                            <Grid item xs={6} container justifyContent='center' alignContent='center'>
                                {expiredVisitsCount
                                    ?
                                    <Box>
                                        <AnimatedCircularProgressBar start={0} end={70}>
                                            <Typography variant='h4'>
                                                <AnimatedCounter start={0} end={expiredVisitsCount} />
                                            </Typography>
                                        </AnimatedCircularProgressBar>
                                        <Typography variant="body1" textAlign='center' sx={{ position: 'relative', top: '-3rem' }}>
                                            {t('expiredVisits')}
                                        </Typography>
                                    </Box>
                                    :
                                    <CircularProgress />}
                            </Grid>

                            <Grid item xs={3}></Grid>
                            <Grid item xs={6} container justifyContent='center'>
                                {patientsCount
                                    ?
                                    <Box>
                                        <AnimatedCircularProgressBar start={0} end={70}>
                                            <Typography variant='h4'>
                                                <AnimatedCounter start={0} end={patientsCount} />
                                            </Typography>
                                        </AnimatedCircularProgressBar>
                                        <Typography variant="body1" textAlign='center' sx={{ position: 'relative', top: '-3rem' }}>
                                            {t('patients')}
                                        </Typography>
                                    </Box>
                                    :
                                    <CircularProgress />}
                            </Grid>
                            <Grid item xs={3}></Grid>
                        </>
                    )}
            </Grid>
        </>
    );
}
