import { ComponentProps, useCallback, useContext, useState } from "react";
import { Visit } from "../../../Electron/Database/Models/Visit";
import { AnimatedCard } from "../../Components/Animations/AnimatedCard";
import { Calendar as CalendarComponent } from "../../Components/Calendar";
import { getVisitsInDate } from "../../Components/Visits/helpers";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { DataGrid } from "../../Components/DataGrid";
import { t } from "i18next";
import { CircularLoadingIcon } from "../../Components/Base/CircularLoadingIcon";
import { Stack } from "../../Components/Base/Stack";
import { cn } from "../../shadcn/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../Components/Base/Button";
import { DATE, toFormat } from "../../Lib/DateTime/date-time-helpers";
import { EditorModal } from "../../Components/Base/Editor/EditorModal";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { RendererDbAPI } from "@/src/Electron/Database/renderer";

export function Calendar({ containerProps }: { containerProps?: ComponentProps<'div'> }) {
    const configuration = useContext(ConfigurationContext)!

    const [cardKey, setCardKey] = useState<number>()
    const [showVisitsStats, setShowVisitsStats] = useState<boolean>(false)

    const [visits, setVisits] = useState<Visit[]>([])
    const [patientsCount, setPatientsCount] = useState<number>(0)
    const [fetchingVisits, setFetchingVisits] = useState<boolean>(false)

    // ID of the visit that is taken for its diagnosis representation
    const [showDiagnosis, setShowDiagnosis] = useState<string | undefined>(undefined)
    const [showTreatments, setShowTreatments] = useState<string | undefined>(undefined)

    console.log('Calendar', { visits, patientsCount, showVisitsStats, fetchingVisits })

    const onOver = useCallback(async (year: number, month: number, day: number) => {
        console.log('onEnter``````````````````````````````````````````````````````````````')

        setCardKey(day)
        setShowVisitsStats(true)

        setFetchingVisits(true)
        const vs = await getVisitsInDate({ year, month, day }, configuration.local)
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

    const updateVisit = async (visit: Visit) => {
        try {
            console.groupCollapsed('updateVisit')

            if (!visit)
                throw new Error('no visit provided to update.')

            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updateVisit(visit)
            console.log({ res })

            if (res.code !== 200 || !res.data) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Visits.failedToUpdateVisit')
                })
                return
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('Visits.successfullyUpdatedVisit')
            })
        } catch (error) {
            console.error(error)
        } finally {
            console.groupEnd()
        }
    }

    const overWriteColumns: ColumnDef<any>[] = [
        {
            id: 'diagnosis',
            accessorKey: 'diagnosis',
            cell: ({ row }) => <Button onClick={() => setShowDiagnosis(visits.find(v => v._id === row.original._id)?._id as string)}>{t('Visits.Show')}</Button>
        },
        {
            id: 'treatments',
            accessorKey: 'treatments',
            cell: ({ row }) => (<Button onClick={() => setShowTreatments(visits.find(v => v._id === row.original._id)?._id as string)}>{t('Visits.Show')}</Button>)
        },
        {
            id: 'due',
            accessorKey: 'due',
            cell: ({ getValue }) => toFormat(Number(getValue() as string), configuration.local, undefined, DATE),
        },
    ]

    return (
        <>
            <div {...containerProps} className={cn("relative z-[1] h-full", containerProps?.className)}>
                <div className="overflow-auto z-[2] p-1 h-full">
                    <CalendarComponent onDayPointerOver={onOver} onDayPointerOut={onOut} />
                </div>

                <div className="absolute top-0 -z-[1] w-full">
                    <AnimatedCard
                        animationKey={cardKey ?? 0}
                        open={showVisitsStats}
                        props={{ className: 'bg-surface-container-high size-full rounded-lg shadow-lg border overflow-hidden p-4', style: { height: '20rem' } }}
                    >
                        {fetchingVisits && <CircularLoadingIcon />}
                        {!fetchingVisits &&
                            <>
                                <Stack direction='vertical' stackProps={{ className: 'h-full' }}>
                                    <Stack stackProps={{ className: "items-center justify-between" }}>
                                        <p>{t('Calendar.patientsCount')}:</p>
                                        <p>{patientsCount}</p>
                                    </Stack>
                                    <Stack stackProps={{ className: "items-center justify-between" }}>
                                        <p>{t('Calendar.visitsCount')}:</p>
                                        <p>{visits.length}</p>
                                    </Stack>

                                    <div className="flex-grow">
                                        <DataGrid
                                            data={visits}
                                            defaultHeaderNodes={false}
                                            headerNodes={[]}
                                            defaultFooterNodes={false}
                                            footerNodes={[]}
                                            defaultTableDensity="compact"
                                            overWriteColumns={overWriteColumns}
                                            addCounterColumn={false}
                                            defaultColumnVisibilityModel={{ _id: false, patientId: false, updatedAt: false, createdAt: false }}
                                            containerProps={{ stackProps: { className: 'border-0 p-0' } }}
                                        />
                                    </div>
                                </Stack>
                            </>
                        }
                    </AnimatedCard>
                </div>
            </div>

            <EditorModal
                open={showDiagnosis !== undefined}
                onClose={() => {
                    setShowDiagnosis(undefined)
                }}
                text={visits.find(f => f._id === showDiagnosis)?.diagnosis?.text}
                canvasId={visits.find(f => f._id === showDiagnosis)?.diagnosis?.canvas as string}
                title={t('Visits.diagnosis')}
                onSave={async (diagnosis, canvasId) => {
                    console.log('ManageVisits', 'diagnosis', 'onChange', diagnosis, canvasId)

                    if (visits.find(f => f._id === showDiagnosis)) {
                        visits.find(f => f._id === showDiagnosis)!.diagnosis = { text: diagnosis, canvas: canvasId }
                        updateVisit(visits.find(f => f._id === showDiagnosis)!)
                    }
                }}
            />

            <EditorModal
                open={showTreatments !== undefined}
                onClose={() => {
                    setShowTreatments(undefined)
                }}
                text={visits.find(f => f._id === showTreatments)?.treatments?.text}
                canvasId={visits.find(f => f._id === showTreatments)?.treatments?.canvas as string}
                title={t('Visits.treatments')}
                onSave={async (treatments, canvasId) => {
                    console.log('ManageVisits', 'treatments', 'onChange', treatments, canvasId)

                    if (visits.find(f => f._id === showTreatments)) {
                        visits.find(f => f._id === showTreatments)!.treatments = { text: treatments, canvas: canvasId }
                        updateVisit(visits.find(f => f._id === showTreatments)!)
                    }
                }}
            />
        </>
    )
}

