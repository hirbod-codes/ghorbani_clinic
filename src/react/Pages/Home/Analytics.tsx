import { memo, useEffect, useState } from "react";
import { t } from "i18next";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { RefreshOutlined } from "@mui/icons-material";
import { AnimatedCircularProgressBar } from "../../Components/Animations/AnimatedCircularProgressBar";
import { AnimatedCounter } from "../../Components/Animations/AnimatedCounter";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { motion } from "framer-motion";

export const Analytics = memo(function Analytics() {
    const [initLoading, setInitLoading] = useState<boolean>(true);

    const [visitsCount, setVisitsCount] = useState<number | undefined>(undefined);
    const [expiredVisitsCount, setExpiredVisitsCount] = useState<number | undefined>(undefined);
    const [patientsCount, setPatientsCount] = useState<number | undefined>(undefined);

    console.log('Analytics', { initLoading, visitsCount, expiredVisitsCount, patientsCount });

    const initPatientsProgressBars = async (): Promise<boolean> => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPatientsEstimatedCount();
            if (res.code === 200 && res.data)
                setPatientsCount(res.data);
            else
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Analytics.failedToFetchPatientsCount')
                });
            return res.code === 200 && res.data !== undefined
        } catch (error) {
            console.error('Analytics', 'initPatientsProgressBars', error);
            throw error;
        }
    };
    const initVisitsProgressBars = async (): Promise<boolean> => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getVisitsEstimatedCount();
            if (res.code === 200 && res.data)
                setVisitsCount(res.data);
            else
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Analytics.failedToFetchVisitsCount')
                });
            return res.code === 200 && res.data !== undefined
        } catch (error) {
            console.error('Analytics', 'initVisitsProgressBars', error);
            throw error;
        }
    };
    const initExpiredVisitsProgressBars = async (): Promise<boolean> => {
        try {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getExpiredVisitsCount();
            if (res.code === 200 && res.data)
                setExpiredVisitsCount(res.data);
            else
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Analytics.failedToFetchExpiredVisitsCount')
                });
            return res.code === 200 && res.data !== undefined
        } catch (error) {
            console.error('Analytics', 'initExpiredVisitsProgressBars', error);
            throw error;
        }
    };

    const initProgressBars = async () => {
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
        }
    };

    useEffect(() => {
        initProgressBars()
    }, []);

    return (
        <>
            {!visitsCount || !expiredVisitsCount || !patientsCount
                ?
                <Button onClick={async () => await initProgressBars()} variant='outlined' startIcon={<RefreshOutlined />} fullWidth> {t('Reload')} </Button>
                :
                (
                    initLoading
                        ?
                        <Stack justifyContent='center' alignItems='center' sx={{ height: '100%', width: '100%' }}>
                            <CircularProgress />
                        </Stack>
                        :
                        <Stack direction='column' alignItems='center' justifyContent='flex-start' sx={{ position: 'relative' }}>
                            {visitsCount !== undefined
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
                                        {t('Analytics.visits')}
                                    </Typography>
                                </motion.div>
                                :
                                <CircularProgress />
                            }
                            {expiredVisitsCount !== undefined
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
                                        {t('Analytics.expiredVisits')}
                                    </Typography>
                                </motion.div>
                                :
                                <CircularProgress />
                            }
                            {patientsCount !== undefined
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
                                        {t('Analytics.patients')}
                                    </Typography>
                                </motion.div>
                                :
                                <CircularProgress />
                            }
                        </Stack>
                )}
        </>
    );
})
