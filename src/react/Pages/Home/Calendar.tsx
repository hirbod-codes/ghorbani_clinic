import { useCallback, useContext, useState } from "react";
import { CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { Visit } from "src/Electron/Database/Models/Visit";
import { AnimatedCard } from "../../Components/Animations/AnimatedCard";
import { Calendar as CalendarComponent } from "../../Components/Calendar";
import { getVisitsInDate } from "../../Components/Visits/helpers";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { DataGrid } from "../../Components/DataGrid";
import LoadingScreen from "../../Components/LoadingScreen";
import { t } from "i18next";

export function Calendar() {
    const locale = useContext(ConfigurationContext).get.locale

    const [cardKey, setCardKey] = useState<number>()
    const [showVisitsStats, setShowVisitsStats] = useState<boolean>(false)

    const [visits, setVisits] = useState<Visit[]>([])
    const [patientsCount, setPatientsCount] = useState<number>(0)
    const [fetchingVisits, setFetchingVisits] = useState<boolean>(false)

    console.log('Calendar', { visits, patientsCount, showVisitsStats, fetchingVisits })

    const onOver = useCallback(async (year: number, month: number, day: number) => {
        console.log('onEnter``````````````````````````````````````````````````````````````')

        setCardKey(day)
        setShowVisitsStats(true)

        setFetchingVisits(true)
        const vs = await getVisitsInDate({ year, month, day }, locale)
        setFetchingVisits(false)
        if (!vs || vs.length <= 0)
            return

        setVisits(vs)

        let c: string[] = []
        vs.forEach(v => { if (!c.includes(v.patientId as string)) c.push(v.patientId as string) })
        setPatientsCount(c.length)
    }, [])

    const onOut = useCallback((y: number, m: number, d: number) => {
        console.log('onLeave``````````````````````````````````````````````````````````````')
        setVisits([])
        setPatientsCount(0)
        setShowVisitsStats(false)
    }, [])

    return (
        <div style={{ zIndex: 2, position: 'relative' }}>
            <Paper elevation={3} sx={{ zIndex: 2, overflow: 'auto' }}>
                <div style={{ minWidth: '25rem', padding: 0.5 }}>
                    <CalendarComponent onDayPointerOver={onOver} onDayPointerOut={onOut} />
                </div>
            </Paper>

            <Paper sx={{ position: 'absolute', top: 0, zIndex: -1, width: '100%' }} >
                <AnimatedCard
                    animationKey={cardKey}
                    open={showVisitsStats}
                    paperProps={{ sx: { minWidth: '10rem', maxWidth: '20rem', minHeight: '10rem' } }}
                >
                    {fetchingVisits && <LoadingScreen />}
                    {!fetchingVisits &&
                        <>
                            <Stack direction='column' spacing={1} sx={{ p: 1 }}>
                                <Stack direction='row' alignItems='center' justifyContent='space-between'>
                                    <Typography>{t('Calendar.patientsCount')}:</Typography>
                                    <Typography>{patientsCount}</Typography>
                                </Stack>
                                <Stack direction='row' alignItems='center' justifyContent='space-between'>
                                    <Typography>{t('Calendar.visitsCount')}:</Typography>
                                    <Typography>{visits.length}</Typography>
                                </Stack>
                            </Stack>
                            <DataGrid data={visits} headerNodes={[]} footerNodes={[]} defaultTableDensity="compact" />
                        </>
                    }
                </AnimatedCard>
            </Paper>
        </div>
    )
}

