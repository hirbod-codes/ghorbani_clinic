import { useCallback, useContext, useState } from "react";
import { Visit } from "../../../Electron/Database/Models/Visit";
import { AnimatedCard } from "../../Components/Animations/AnimatedCard";
import { Calendar as CalendarComponent } from "../../Components/Calendar";
import { getVisitsInDate } from "../../Components/Visits/helpers";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { DataGrid } from "../../Components/DataGrid";
import { t } from "i18next";
import { CircularLoading } from "../../Components/Base/CircularLoading";

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
        <div className="z-[1]" style={{ position: 'relative' }}>
            <div className="overflow-auto shadow-lg z-[2]">
                <div style={{ minWidth: '25rem', padding: 0.5 }}>
                    <CalendarComponent onDayPointerOver={onOver} onDayPointerOut={onOut} />
                </div>
            </div>

            <div className="absolute top-0 -z-[1] w-full">
                <AnimatedCard
                    animationKey={cardKey ?? 0}
                    open={showVisitsStats}
                    props={{ sx: { minWidth: '10rem', maxWidth: '20rem', minHeight: '10rem' } }}
                >
                    {fetchingVisits && <CircularLoading />}
                    {!fetchingVisits &&
                        <>
                            <div className="flex flex-col space-x-1 space-y-1 p-1">
                                <div className="flex flex-row items-center justify-between">
                                    <p>{t('Calendar.patientsCount')}:</p>
                                    <p>{patientsCount}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between">
                                    <p>{t('Calendar.visitsCount')}:</p>
                                    <p>{visits.length}</p>
                                </div>
                            </div>
                            <DataGrid data={visits} headerNodes={[]} footerNodes={[]} defaultTableDensity="compact" />
                        </>
                    }
                </AnimatedCard>
            </div>
        </div>
    )
}

