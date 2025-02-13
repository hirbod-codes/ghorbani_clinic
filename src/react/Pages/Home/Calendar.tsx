import { ComponentProps, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
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
import { useAnimate } from "framer-motion";

// To Do: fix on DataGrid click
export function Calendar({ containerProps, calendarContainerProps }: { containerProps?: ComponentProps<'div'>, calendarContainerProps?: ComponentProps<'div'> }) {
    const configuration = useContext(ConfigurationContext)!

    const [cardKey, setCardKey] = useState<number>()
    const [showVisitsStats, setShowVisitsStats] = useState<boolean>(false)

    const [isLocked, setIsLocked] = useState<boolean>(false)

    const [visits, setVisits] = useState<Visit[]>([])
    const [patientsCount, setPatientsCount] = useState<number>(0)
    const [fetchingVisits, setFetchingVisits] = useState<boolean>(false)

    // ID of the visit that is taken for its diagnosis representation
    const [showDiagnosis, setShowDiagnosis] = useState<string | undefined>(undefined)
    const [showTreatments, setShowTreatments] = useState<string | undefined>(undefined)

    const animationFinish = useRef<boolean>(true)
    const [scope, animate] = useAnimate()

    const containerRef = useRef<HTMLDivElement>(null)

    const [, rerender] = useReducer(x => x + 1, 0)

    console.log('Calendar', { isLocked, visits, patientsCount, showVisitsStats, fetchingVisits })

    const updateCard = async (year: number, month: number, day: number) => {
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
    }

    const onOver = useCallback(async (year: number, month: number, day: number) => {
        console.log('onEnter``````````````````````````````````````````````````````````````')

        if (isLocked)
            return

        await updateCard(year, month, day)
    }, [isLocked])

    const onOut = useCallback((y: number, m: number, d: number) => {
        console.log('onLeave``````````````````````````````````````````````````````````````')

        if (isLocked)
            return

        setVisits([])
        setPatientsCount(0)
        setShowVisitsStats(false)
    }, [isLocked])

    useEffect(() => {
        function handleClickOutside(e) {
            if (isLocked) {
                setIsLocked(false)
                setVisits([])
                setPatientsCount(0)
                setShowVisitsStats(false)
            }
        }

        document.body.addEventListener("pointerdown", handleClickOutside);

        return () => {
            document.body.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [isLocked]);

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
                    message: t('Calendar.failedToUpdateVisit')
                })
                return
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('Calendar.successfullyUpdatedVisit')
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
            cell: ({ row }) => <Button onClick={() => setShowDiagnosis(visits.find(v => v._id === row.original._id)?._id as string)}>{t('Calendar.Show')}</Button>
        },
        {
            id: 'treatments',
            accessorKey: 'treatments',
            cell: ({ row }) => (<Button onClick={() => setShowTreatments(visits.find(v => v._id === row.original._id)?._id as string)}>{t('Calendar.Show')}</Button>)
        },
        {
            id: 'due',
            accessorKey: 'due',
            cell: ({ getValue }) => toFormat(Number(getValue() as string), configuration.local, undefined, DATE),
        },
    ]

    useEffect(() => {
    }, [])

    useEffect(() => {
        animationFinish.current = false
        const checkState = async () => {
            if (!containerRef.current)
                return

            if (isLocked || showVisitsStats) {
                let w = containerRef.current.getBoundingClientRect()!.width + 8
                if (configuration.local.direction === 'rtl')
                    w *= -1
                await animate(scope.current, { x: w, opacity: 1 })
                animationFinish.current = true
                rerender()
            } else {
                await animate(scope.current, { x: '0', opacity: 0 })
                animationFinish.current = true
                rerender()
            }
        }

        checkState()
    }, [isLocked, showVisitsStats])

    return (
        <>
            <div ref={containerRef} {...containerProps} className={cn("relative h-full", containerProps?.className)}>
                <div className="absolute top-0 z-[1] w-full">
                    <div ref={scope} className="bg-surface-container-high size-full rounded-lg shadow-lg border overflow-hidden p-4 h-80 w-[20cm]">
                        {animationFinish.current && fetchingVisits && <CircularLoadingIcon />}
                        {animationFinish.current && !fetchingVisits &&
                            <>
                                <Stack direction='vertical' stackProps={{ className: 'h-full' }}>
                                    <Stack stackProps={{ className: "items-center justify-between" }}>
                                        <p>{t('Calendar.PatientsCount')}:</p>
                                        <p>{patientsCount}</p>
                                    </Stack>
                                    <Stack stackProps={{ className: "items-center justify-between" }}>
                                        <p>{t('Calendar.VisitsCount')}:</p>
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
                    </div>
                </div>

                <div {...calendarContainerProps} className={cn("absolute top-0 left-0 overflow-auto z-[2] p-1 size-full", calendarContainerProps?.className)}>
                    <CalendarComponent onDaySelect={async (year, month, day) => { if (day !== cardKey) await updateCard(year, month, day); setIsLocked(true) }} onDayPointerOver={onOver} onDayPointerOut={onOut} />
                </div>
            </div>

            <EditorModal
                open={showDiagnosis !== undefined}
                onClose={() => {
                    setShowDiagnosis(undefined)
                }}
                text={visits.find(f => f._id === showDiagnosis)?.diagnosis?.text}
                canvasId={visits.find(f => f._id === showDiagnosis)?.diagnosis?.canvas as string}
                title={t('Calendar.diagnosis')}
                onSave={async (diagnosis, canvasId) => {
                    console.log('Calendar', 'diagnosis', 'onChange', diagnosis, canvasId)

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
                title={t('Calendar.treatments')}
                onSave={async (treatments, canvasId) => {
                    console.log('Calendar', 'treatments', 'onChange', treatments, canvasId)

                    if (visits.find(f => f._id === showTreatments)) {
                        visits.find(f => f._id === showTreatments)!.treatments = { text: treatments, canvas: canvasId }
                        updateVisit(visits.find(f => f._id === showTreatments)!)
                    }
                }}
            />
        </>
    )
}

