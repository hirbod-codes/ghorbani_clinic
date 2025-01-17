import { useCallback, useContext, useState } from "react";
import { Visit } from "../../../Electron/Database/Models/Visit";
import { AnimatedCard } from "../../Components/Animations/AnimatedCard";
import { Calendar as CalendarComponent } from "../../Components/Calendar";
import { getVisitsInDate } from "../../Components/Visits/helpers";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { DataGrid } from "../../Components/DataGrid";
import { t } from "i18next";
import { CircularLoadingIcon } from "../../Components/Base/CircularLoadingIcon";
import { Stack } from "../../Components/Base/Stack";

export function Calendar() {
    const locale = useContext(ConfigurationContext)!.local

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
        <div className="relative z-[1]">
            <div className="overflow-auto shadow-md z-[2] bg-surface-container-low p-1 rounded-md" style={{ minWidth: '25rem' }}>
                <CalendarComponent onDayPointerOver={onOver} onDayPointerOut={onOut} />
            </div>

            <div className="absolute top-0 -z-[1] w-full">
                <AnimatedCard
                    animationKey={cardKey ?? 0}
                    open={showVisitsStats}
                    props={{ className: 'bg-surface-container', style: { minWidth: '10rem', maxWidth: '20rem', minHeight: '10rem' } }}
                >
                    {fetchingVisits && <CircularLoadingIcon />}
                    {!fetchingVisits &&
                        <>
                            <Stack direction='vertical'>
                                <Stack stackProps={{ className: "items-center justify-between" }}>
                                    <p>{t('Calendar.patientsCount')}:</p>
                                    <p>{patientsCount}</p>
                                </Stack>
                                <Stack stackProps={{ className: "items-center justify-between" }}>
                                    <p>{t('Calendar.visitsCount')}:</p>
                                    <p>{visits.length}</p>
                                </Stack>
                            </Stack>
                            <DataGrid data={visits} headerNodes={[]} footerNodes={[]} defaultTableDensity="compact" />
                        </>
                    }
                </AnimatedCard>
            </div>
        </div>
    )
}

