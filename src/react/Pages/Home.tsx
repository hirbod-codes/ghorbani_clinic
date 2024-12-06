import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { SearchPatientField } from "../Components/Search/SearchPatientField";
import { Analytics } from "../Components/Home/Analytics";
import { Clock } from "../Components/Clock";
import { memo, useCallback, useContext, useState } from "react";
import { Calendar } from "../Components/Calendar";
import { getVisitsInDate } from "../Components/Visits/helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Visit } from "src/Electron/Database/Models/Visit";
import { AnimatedCard } from "../Components/AnimatedCard";
import { DateTime } from "luxon";
import { toLocalDateTime, toLocalFormat } from "../Lib/DateTime/date-time-helpers";

export const Home = memo(function Home() {
    const locale = useContext(ConfigurationContext).get.locale


    const [cardKey, setCardKey] = useState<number>()
    const [showVisitsStats, setShowVisitsStats] = useState<boolean>(false)

    const [visits, setVisits] = useState<Visit[]>(undefined)
    const [patientsCount, setPatientsCount] = useState<number>(undefined)
    const [fetchingVisits, setFetchingVisits] = useState<boolean>(false)

    console.log('Home', { visits, patientsCount, showVisitsStats, fetchingVisits, d: toLocalDateTime(DateTime.utc().toUnixInteger(), { calendar: 'Gregorian', code: 'en', direction: 'ltr', zone: 'UTC' }).toISO() })

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

    const onOut = (y: number, m: number, d: number) => {
        console.log('onLeave``````````````````````````````````````````````````````````````')
        setVisits(undefined)
        setPatientsCount(undefined)
        setShowVisitsStats(false)
    }

    return (
        <>
            <Grid container spacing={1} p={1}>
                <Grid item xs={0} sm={3}></Grid>
                <Grid item xs={12} sm={6}>
                    <SearchPatientField />
                </Grid>
                <Grid item xs={0} sm={3}></Grid>

                <Grid item>
                    <Clock />
                </Grid>

                <Grid item xs={0} sm={4}>
                    <Paper sx={{ zIndex: 20, border: '1px solid red', width: '30rem' }}>
                        <Calendar onDayPointerOver={onOver} onDayPointerOut={onOut} />

                        <Paper sx={{ position: 'relative', zIndex: -10 }} >
                            <AnimatedCard
                                animationKey={cardKey}
                                open={showVisitsStats}
                                paperProps={{ sx: { minWidth: '10rem', minHeight: '10rem' } }}
                            >
                                {fetchingVisits && <CircularProgress />}
                                {!fetchingVisits && patientsCount && <Typography>Patients count: {patientsCount}</Typography>}
                                {!fetchingVisits && visits && visits.length && <Typography>Visits length: {visits.length}</Typography>}
                            </AnimatedCard>
                        </Paper>
                    </Paper>
                </Grid>
                <Grid item xs={0} sm={9}></Grid>

                <Grid item xs={12}>
                    <Box mb={10}></Box>
                </Grid>

                <Grid item xs={12}>
                    <Analytics />
                </Grid>
            </Grid>
        </>
    )
})
