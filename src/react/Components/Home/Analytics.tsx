import { useEffect, useRef, useState } from "react";
import { t } from "i18next";
import { Box, Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { RefreshOutlined } from "@mui/icons-material";
import { AnimatedCircularProgressBar } from "../ProgressBars/AnimatedCircularProgressBar";
import { AnimatedCounter } from "../Counters/AnimatedCounter";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { CircularProgressBar } from "../ProgressBars/CircularProgressBar";


export function Analytics() {
    const [initialized, setInitialized] = useState<boolean>(false);
    const [initLoading, setInitLoading] = useState<boolean>(true);
    const [initFailed, setInitFailed] = useState<boolean>(false);

    const [visitsCount, setVisitsCount] = useState<number | undefined>(undefined);
    const [expiredVisitsCount, setExpiredVisitsCount] = useState<number | undefined>(undefined);
    const [patientsCount, setPatientsCount] = useState<number | undefined>(undefined);

    console.log('Analytics', { initLoading, initFailed, visitsCount, expiredVisitsCount, patientsCount });

    const initPatientsProgressBars = async () => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPatientsEstimatedCount();
            if (res.code === 200 && res.data)
                setPatientsCount(res.data);
            else
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToFetchPatientsCount')
                });
        } catch (error) {
            console.error('Analytics', 'initPatientsProgressBars', error);
            throw error;
        }
    };
    const initVisitsProgressBars = async () => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getVisitsEstimatedCount();
            if (res.code === 200 && res.data)
                setVisitsCount(res.data);
            else
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToFetchVisitsCount')
                });
        } catch (error) {
            console.error('Analytics', 'initVisitsProgressBars', error);
            throw error;
        }
    };
    const initExpiredVisitsProgressBars = async () => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getExpiredVisitsCount();
            if (res.code === 200 && res.data)
                setExpiredVisitsCount(res.data);
            else
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('failedToFetchExpiredVisitsCount')
                });
        } catch (error) {
            console.error('Analytics', 'initExpiredVisitsProgressBars', error);
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

            if (visitsCount === undefined || expiredVisitsCount === undefined || patientsCount === undefined)
                setInitFailed(true);
        } catch (error) {
            console.error('Analytics', 'initProgressBars', error);
            setInitFailed(true);
        }
    };

    useEffect(() => {
        if (!initialized)
            initProgressBars()
                .then(() => (setInitialized(true)));
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
                        initLoading
                            ?
                            <Stack justifyContent='center' alignItems='center' sx={{ height: '100%', width: '100%' }}>
                                <CircularProgress />
                            </Stack>
                            :
                            <>
                                <Grid item xs={6} container justifyContent='center'>
                                    {visitsCount
                                        ?
                                        <motion.div
                                            initial={{ x: -150, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{
                                                x: { ease: 'easeInOut', duration: 1 },
                                                opacity: { ease: 'easeInOut', duration: 0.5 }
                                            }}
                                        >
                                            <AnimatedCircularProgressBar size={200} end={70}>
                                                <Typography variant='h4'>
                                                    <AnimatedCounter start={0} end={visitsCount} />
                                                </Typography>
                                            </AnimatedCircularProgressBar>
                                            <Typography variant="body1" textAlign='center' sx={{ position: 'relative', top: '-3rem' }}>
                                                {t('visits')}
                                            </Typography>
                                        </motion.div>
                                        :
                                        <CircularProgress />}
                                </Grid>

                                <Grid item xs={6} container justifyContent='center' alignContent='center'>
                                    {expiredVisitsCount
                                        ?
                                        <motion.div
                                            initial={{ x: 150, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{
                                                x: { ease: 'easeInOut', duration: 1 },
                                                opacity: { ease: 'easeInOut', duration: 0.5 }
                                            }}
                                        >
                                            <AnimatedCircularProgressBar size={200} end={70}>
                                                <Typography variant='h4'>
                                                    <AnimatedCounter start={0} end={expiredVisitsCount} />
                                                </Typography>
                                            </AnimatedCircularProgressBar>
                                            <Typography variant="body1" textAlign='center' sx={{ position: 'relative', top: '-3rem' }}>
                                                {t('expiredVisits')}
                                            </Typography>
                                        </motion.div>
                                        :
                                        <CircularProgress />}
                                </Grid>

                                <Grid item xs={3}></Grid>
                                <Grid item xs={6} container justifyContent='center'>
                                    {patientsCount
                                        ?
                                        <motion.div
                                            initial={{ y: 150, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{
                                                y: { ease: 'easeInOut', duration: 1 },
                                                opacity: { ease: 'easeInOut', duration: 0.5 }
                                            }}
                                        >
                                            <AnimatedCircularProgressBar size={200} end={70}>
                                                <Typography variant='h4'>
                                                    <AnimatedCounter start={0} end={patientsCount} />
                                                </Typography>
                                            </AnimatedCircularProgressBar>
                                            <Typography variant="body1" textAlign='center' sx={{ position: 'relative', top: '-3rem' }}>
                                                {t('patients')}
                                            </Typography>
                                        </motion.div>
                                        :
                                        <CircularProgress />}
                                </Grid>
                                <Grid item xs={3}></Grid>
                            </>
                    )}
            </Grid >
        </>
    );
}
