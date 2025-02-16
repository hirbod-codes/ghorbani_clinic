import { ComponentProps, PointerEvent as ReactPointerEvent, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { Visit } from "../../../Electron/Database/Models/Visit";
import { Calendar as CalendarComponent } from "../../Components/Calendar";
import { getVisitsInDate, getVisitsPatients } from "../../Components/Visits/helpers";
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
import { CircularLoading } from "../../Components/Base/CircularLoading";
import { Date as DateType } from "../../Lib/DateTime";
import { Patient } from "@/src/Electron/Database/Models/Patient";
import { Separator } from "../../shadcn/components/ui/separator";
import { es, Faker } from "@faker-js/faker";

// To Do: fix on DataGrid click
// export function Calendarr({ containerProps, calendarContainerProps }: { containerProps?: ComponentProps<'div'>, calendarContainerProps?: ComponentProps<'div'> }) {
//     const configuration = useContext(ConfigurationContext)!

//     const [showVisitsStats, setShowVisitsStats] = useState<boolean>(false)
//     const [fetchingVisits, setFetchingVisits] = useState<boolean>(false)
//     const [isLocked, setIsLocked] = useState<boolean>(false)
//     const [show, setShow] = useState<boolean>(false)

//     const onEnterTimeout = useRef<NodeJS.Timeout>()
//     const lastAnimationMillisecond = useRef<number>(Date.now())

//     const visits = useRef<Visit[]>([])
//     const patientsCount = useRef<number>(0)

//     // ID of the visit that is taken for its diagnosis representation
//     const [showDiagnosis, setShowDiagnosis] = useState<string | undefined>(undefined)
//     const [showTreatments, setShowTreatments] = useState<string | undefined>(undefined)

//     const runningAnimations = useRef<number[]>([])
//     const animationFinish = useRef<boolean>(true)
//     const [scope, animate] = useAnimate()

//     const containerRef = useRef<HTMLDivElement>(null)

//     const previousDate = useRef<DateType>()

//     const [, rerender] = useReducer(x => x + 1, 0)

//     console.log('Home.Calendar', { showVisitsStats, isLocked, visits, patientsCount, fetchingVisits, showDiagnosis, showTreatments, containerProps, calendarContainerProps, runningAnimations: runningAnimations.current.length, animationFinish: animationFinish.current, containerRef: containerRef.current })

//     const updateVisit = async (visit: Visit) => {
//         try {
//             console.groupCollapsed('updateVisit')

//             if (!visit)
//                 throw new Error('no visit provided to update.')

//             const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updateVisit(visit)
//             console.log({ res })

//             if (res.code !== 200 || !res.data) {
//                 publish(RESULT_EVENT_NAME, {
//                     severity: 'error',
//                     message: t('Calendar.failedToUpdateVisit')
//                 })
//                 return
//             }

//             publish(RESULT_EVENT_NAME, {
//                 severity: 'success',
//                 message: t('Calendar.successfullyUpdatedVisit')
//             })
//         } catch (error) {
//             console.error(error)
//         } finally {
//             console.groupEnd()
//         }
//     }

//     const overWriteColumns: ColumnDef<any>[] = [
//         {
//             id: 'diagnosis',
//             accessorKey: 'diagnosis',
//             cell: ({ row }) => <Button onClick={() => setShowDiagnosis(visits.current.find(v => v._id === row.original._id)?._id as string)}>{t('Calendar.Show')}</Button>
//         },
//         {
//             id: 'treatments',
//             accessorKey: 'treatments',
//             cell: ({ row }) => (<Button onClick={() => setShowTreatments(visits.current.find(v => v._id === row.original._id)?._id as string)}>{t('Calendar.Show')}</Button>)
//         },
//         {
//             id: 'due',
//             accessorKey: 'due',
//             cell: ({ getValue }) => typeof getValue() === 'number' ? toFormat(getValue() as number, configuration.local, undefined, DATE) : '-',
//         },
//     ]

//     const updateCard = async (year: number, month: number, day: number) => {
//         if (year === previousDate.current?.year && month === previousDate.current?.month && day === previousDate.current?.day)
//             return

//         // if (fetchingVisits === true)
//         //     return

//         previousDate.current = { year, month, day }

//         setFetchingVisits(true)
//         const vs = await getVisitsInDate({ year, month, day }, configuration.local)
//         visits.current = vs ?? []

//         if (vs) {
//             let c: string[] = []
//             vs.forEach(v => { if (!c.includes(v.patientId as string)) c.push(v.patientId as string) })
//             patientsCount.current = c.length
//         } else
//             patientsCount.current = 0

//         setFetchingVisits(false)
//     }

//     const onEnter = async (year: number, month: number, day: number) => {
//         if (isLocked)
//             return

//         console.log('``````````````````````` onEnter ```````````````````````', { onEnterTimeout: onEnterTimeout.current, fetchingVisits: fetchingVisits, showVisitsStats: showVisitsStats })

//         animationFinish.current = false
//         setFetchingVisits(true)
//         setShowVisitsStats(true)

//         // to prevent too may rerenders
//         if (onEnterTimeout.current !== undefined) {
//             clearTimeout(onEnterTimeout.current)

//             onEnterTimeout.current = undefined
//         }

//         onEnterTimeout.current = setTimeout(async () => {
//             console.log('timeout', { onEnterTimeout: onEnterTimeout.current, fetchingVisits: fetchingVisits, showVisitsStats: showVisitsStats })

//             await updateCard(year, month, day)
//         }, 100)
//     }

//     const onLeave = (y: number, m: number, d: number) => {
//         if (isLocked)
//             return

//         console.log('``````````````````````` onLeave ```````````````````````', { onEnterTimeout: onEnterTimeout.current, fetchingVisits: fetchingVisits, showVisitsStats: showVisitsStats })

//         animationFinish.current = false
//         setShowVisitsStats(false)

//         if (onEnterTimeout.current !== undefined) {
//             clearTimeout(onEnterTimeout.current)

//             onEnterTimeout.current = undefined
//         }
//     }

//     const onDaySelect = async (year, month, day) => {
//         // isLocked=false

//         setShowVisitsStats(true)

//         await updateCard(year, month, day)

//         setIsLocked(true)
//     }

//     const handleClickOnCalendar = useCallback(async function handleClickOnCalendar(e: ReactPointerEvent<HTMLDivElement>) {
//         animationFinish.current = false
//         // runningAnimations.current.push(0)
//         rerender()
//         animate(scope.current, { x: '0', opacity: 0 })
//             .complete = () => animationFinish.current = true
//         // runningAnimations.current.pop()

//         setIsLocked(false)
//         setShowVisitsStats(false)
//     }, [])

//     const handleClickOutside = useCallback(async function handleClickOutside(e: PointerEvent) {
//         const cRect = containerRef.current?.getBoundingClientRect()
//         if (cRect)
//             if (e.clientX <= (cRect.left + cRect.width) && e.clientX >= cRect.left && e.clientY >= cRect.top && e.clientY <= (cRect.top + cRect.height))
//                 return

//         const rect = scope.current?.getBoundingClientRect()
//         if (rect)
//             if (e.clientX <= (rect.left + rect.width) && e.clientX >= rect.left && e.clientY >= rect.top && e.clientY <= (rect.top + rect.height))
//                 return

//         animationFinish.current = false
//         // runningAnimations.current.push(0)
//         rerender()
//         animate(scope.current, { x: '0', opacity: 0 })
//             .complete = () => animationFinish.current = true
//         // runningAnimations.current.pop()

//         setIsLocked(false)
//         setShowVisitsStats(false)
//     }, [containerRef.current, scope.current])

//     const checkState = async () => {
//         if (!containerRef.current || animationFinish.current)
//             return

//         if (isLocked || showVisitsStats) {
//             let w = containerRef.current.getBoundingClientRect()!.width + 8
//             if (configuration.local.direction === 'rtl')
//                 w *= -1
//             await animate(scope.current, { x: w, opacity: 1 })
//             animationFinish.current = true
//             lastAnimationMillisecond.current = Date.now()
//             // runningAnimations.current.pop()
//             rerender()
//         } else {
//             await animate(scope.current, { x: '0', opacity: 0 })
//             animationFinish.current = true
//             lastAnimationMillisecond.current = Date.now()
//             // runningAnimations.current.pop()
//             rerender()
//         }
//     }

//     useEffect(() => {
//         console.log('useEffect1', { containerRef: containerRef.current, scope: scope.current })
//         document.body.addEventListener("pointerdown", handleClickOutside);

//         return () => {
//             document.body.removeEventListener("pointerdown", handleClickOutside);
//         };
//     }, [containerRef.current, scope.current]);

//     useEffect(() => {
//         console.log('useEffect2', { isLocked: isLocked, showVisitsStats: showVisitsStats, runningAnimations: runningAnimations.current })

//         // if (animationFinish.current === true) {
//         // animationFinish.current = false
//         // runningAnimations.current.push(0)
//         rerender()
//         checkState()
//         // }
//     }, [isLocked, showVisitsStats, containerRef?.current])

//     // const intervalFunction = useCallback(() => {
//     //     console.log('interval', { now: Date.now() - lastAnimationMillisecond.current, animationFinish: animationFinish.current, fetchingVisits, showVisitsStats })
//     //     if (Date.now() - lastAnimationMillisecond.current <= 1000)
//     //         return
//     //     else
//     //         lastAnimationMillisecond.current = Date.now()

//     //     // console.log('interval', animationFinish.current && !fetchingVisits && showVisitsStats, { animationFinish: animationFinish.current, fetchingVisits, showVisitsStats })
//     //     if (animationFinish.current && !fetchingVisits && showVisitsStats)
//     //         setShow(true)
//     // }, [animationFinish.current, fetchingVisits, showVisitsStats])

//     // const interval = useRef<NodeJS.Timeout | undefined>(undefined)

//     // useEffect(() => {
//     //     console.log('useEffectInterval')

//     //     if (interval.current === undefined)
//     //         interval.current = setInterval(intervalFunction, 1000)
//     //     else {
//     //         clearInterval(interval.current)

//     //         interval.current = setInterval(intervalFunction, 1000)
//     //     }

//     //     return () => { if (interval.current) clearInterval(interval.current) }
//     // }, [intervalFunction])

//     return (
//         <>
//             <div onPointerDown={handleClickOnCalendar} ref={containerRef} {...containerProps} className={cn("relative h-full", containerProps?.className)}>
//                 <div className="absolute top-0 z-[1] w-full">
//                     <div ref={scope} className="bg-surface-container-high size-full rounded-lg shadow-lg border p-4 h-80 w-[20cm] overflow-auto opacity-0">
//                         {(!animationFinish.current || fetchingVisits) && <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'><CircularLoading size='lg' /></div>}

//                         <Stack direction='vertical' stackProps={{ className: `h-full ${animationFinish.current && !fetchingVisits && showVisitsStats ? '' : 'hidden'}` }}>
//                             {/* {animationFinish.current && !fetchingVisits &&
//                             <Stack direction='vertical' stackProps={{ className: `h-full` }}> */}
//                             <Stack stackProps={{ className: "items-center justify-between" }}>
//                                 <p>{t('Calendar.PatientsCount')}:</p>
//                                 <p>{patientsCount.current}</p>
//                             </Stack>
//                             <Stack stackProps={{ className: "items-center justify-between" }}>
//                                 <p>{t('Calendar.VisitsCount')}:</p>
//                                 <p>{visits.current.length}</p>
//                             </Stack>

//                             <div className={`flex-grow`}>
//                                 <DataGrid
//                                     data={visits.current}
//                                     defaultHeaderNodes={false}
//                                     headerNodes={[]}
//                                     defaultFooterNodes={false}
//                                     footerNodes={[]}
//                                     defaultTableDensity="compact"
//                                     overWriteColumns={overWriteColumns}
//                                     addCounterColumn={false}
//                                     defaultColumnVisibilityModel={{ _id: false, patientId: false, updatedAt: false, createdAt: false }}
//                                     containerProps={{ stackProps: { className: 'border-0 p-0' } }}
//                                 />
//                             </div>
//                         </Stack>
//                         {/* } */}
//                     </div>
//                 </div>

//                 <div {...calendarContainerProps} className={cn("absolute top-0 left-0 overflow-auto z-[2] p-1 size-full", calendarContainerProps?.className)}>
//                     <CalendarComponent
//                         onDaySelect={onDaySelect}
//                         onDayPointerEnter={onEnter}
//                         onDayPointerLeave={onLeave}
//                     />
//                 </div>
//             </div>

//             {/* <EditorModal
//                 open={showDiagnosis !== undefined}
//                 onClose={() => {
//                     setShowDiagnosis(undefined)
//                 }}
//                 text={visits.current.find(f => f._id === showDiagnosis)?.diagnosis?.text}
//                 canvasId={visits.current.find(f => f._id === showDiagnosis)?.diagnosis?.canvas as string}
//                 title={t('Calendar.diagnosis')}
//                 onSave={async (diagnosis, canvasId) => {
//                     console.log('Calendar', 'diagnosis', 'onChange', diagnosis, canvasId)

//                     if (visits.current.find(f => f._id === showDiagnosis)) {
//                         visits.current.find(f => f._id === showDiagnosis)!.diagnosis = { text: diagnosis, canvas: canvasId }
//                         updateVisit(visits.current.find(f => f._id === showDiagnosis)!)
//                     }
//                 }}
//             />

//             <EditorModal
//                 open={showTreatments !== undefined}
//                 onClose={() => {
//                     setShowTreatments(undefined)
//                 }}
//                 text={visits.current.find(f => f._id === showTreatments)?.treatments?.text}
//                 canvasId={visits.current.find(f => f._id === showTreatments)?.treatments?.canvas as string}
//                 title={t('Calendar.treatments')}
//                 onSave={async (treatments, canvasId) => {
//                     console.log('Calendar', 'treatments', 'onChange', treatments, canvasId)

//                     if (visits.current.find(f => f._id === showTreatments)) {
//                         visits.current.find(f => f._id === showTreatments)!.treatments = { text: treatments, canvas: canvasId }
//                         updateVisit(visits.current.find(f => f._id === showTreatments)!)
//                     }
//                 }}
//             /> */}
//         </>
//     )
// }

// // To Do: fix on DataGrid click
export function Calendar({ containerProps, calendarContainerProps }: { containerProps?: ComponentProps<'div'>, calendarContainerProps?: ComponentProps<'div'> }) {
    const configuration = useContext(ConfigurationContext)!

    const showVisitsStats = useRef<boolean>(false)
    const fetchingVisits = useRef<boolean>(false)
    const isLocked = useRef<boolean>(false)

    const onEnterTimeout = useRef<NodeJS.Timeout>()

    const visitsPatients = useRef<{
        visits: Visit[];
        patients: Patient[];
    }>({ visits: [], patients: [] })
    const patientsCount = useRef<number>(0)

    // ID of the visit that is taken for its diagnosis representation
    const [showDiagnosis, setShowDiagnosis] = useState<string | undefined>(undefined)
    const [showTreatments, setShowTreatments] = useState<string | undefined>(undefined)

    const animationFinish = useRef<boolean>(true)
    const [scope, animate] = useAnimate()

    const containerRef = useRef<HTMLDivElement>(null)

    const previousDate = useRef<DateType>()

    const [, rerender] = useReducer(x => x + 1, 0)

    console.log('Home.Calendar', { showVisitsStats: showVisitsStats.current, isLocked: isLocked.current, visits: visitsPatients, patientsCount, fetchingVisits: fetchingVisits.current, showDiagnosis, showTreatments, containerProps, calendarContainerProps, animationFinish: animationFinish.current, containerRef: containerRef.current })

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

    // const overWriteColumns: ColumnDef<any>[] = [
    //     {
    //         id: 'diagnosis',
    //         accessorKey: 'diagnosis',
    //         cell: ({ row }) => <Button onClick={() => setShowDiagnosis(visitsPatients.current.find(v => v._id === row.original._id)?._id as string)}>{t('Calendar.Show')}</Button>
    //     },
    //     {
    //         id: 'treatments',
    //         accessorKey: 'treatments',
    //         cell: ({ row }) => (<Button onClick={() => setShowTreatments(visitsPatients.current.find(v => v._id === row.original._id)?._id as string)}>{t('Calendar.Show')}</Button>)
    //     },
    //     {
    //         id: 'due',
    //         accessorKey: 'due',
    //         cell: ({ getValue }) => typeof getValue() === 'number' ? toFormat(getValue() as number, configuration.local, undefined, DATE) : '-',
    //     },
    // ]

    const updateCard = async (year: number, month: number, day: number) => {
        if (year === previousDate.current?.year && month === previousDate.current?.month && day === previousDate.current?.day)
            return

        previousDate.current = { year, month, day }

        fetchingVisits.current = true
        const vp = await getVisitsPatients(await getVisitsInDate({ year, month, day }, configuration.local) ?? [])
        visitsPatients.current = vp ?? []

        if (vp) {
            patientsCount.current = vp.patients.length
        } else
            patientsCount.current = 0

        fetchingVisits.current = false
    }

    const onEnter = async (year: number, month: number, day: number) => {
        if (isLocked.current)
            return

        console.log('``````````````````````` onEnter ```````````````````````', { onEnterTimeout: onEnterTimeout.current, fetchingVisits: fetchingVisits.current, showVisitsStats: showVisitsStats.current })

        animationFinish.current = false

        fetchingVisits.current = true
        showVisitsStats.current = true
        rerender()

        // to prevent too may rerenders
        if (onEnterTimeout.current !== undefined) {
            clearTimeout(onEnterTimeout.current)

            onEnterTimeout.current = undefined
        }

        onEnterTimeout.current = setTimeout(async () => {
            console.log('timeout', { onEnterTimeout: onEnterTimeout.current, fetchingVisits: fetchingVisits.current, showVisitsStats: showVisitsStats.current })

            await updateCard(year, month, day)

            rerender()
        }, 100)
    }

    const onLeave = (y: number, m: number, d: number) => {
        if (isLocked.current)
            return

        console.log('``````````````````````` onLeave ```````````````````````', { onEnterTimeout: onEnterTimeout.current, fetchingVisits: fetchingVisits.current, showVisitsStats: showVisitsStats.current })

        if (onEnterTimeout.current !== undefined) {
            clearTimeout(onEnterTimeout.current)

            onEnterTimeout.current = undefined
        }

        animationFinish.current = false

        showVisitsStats.current = false
        rerender()
    }

    const onDaySelect = async (year, month, day) => {
        // isLocked=false

        showVisitsStats.current = true
        rerender()

        await updateCard(year, month, day)

        isLocked.current = true
    }

    const handleClickOnCalendar = useCallback(async function handleClickOnCalendar(e: ReactPointerEvent<HTMLDivElement>) {
        animationFinish.current = false
        // runningAnimations.current.push(0)
        await animate(scope.current, { x: '0', opacity: 0 })
        animationFinish.current = true
        // runningAnimations.current.pop()
        rerender()

        isLocked.current = false
        showVisitsStats.current = false
        rerender()
    }, [])

    const handleClickOutside = useCallback(async function handleClickOutside(e: PointerEvent) {
        const cRect = containerRef.current?.getBoundingClientRect()
        if (cRect)
            if (e.clientX <= (cRect.left + cRect.width) && e.clientX >= cRect.left && e.clientY >= cRect.top && e.clientY <= (cRect.top + cRect.height))
                return

        const rect = scope.current?.getBoundingClientRect()
        if (rect)
            if (e.clientX <= (rect.left + rect.width) && e.clientX >= rect.left && e.clientY >= rect.top && e.clientY <= (rect.top + rect.height))
                return

        animationFinish.current = false
        // runningAnimations.current.push(0)
        await animate(scope.current, { x: '0', opacity: 0 })
        animationFinish.current = true
        // runningAnimations.current.pop()
        rerender()

        isLocked.current = false
        showVisitsStats.current = false
        rerender()
    }, [containerRef.current, scope.current])

    const checkState = async () => {
        if (!containerRef.current || animationFinish.current)
            return

        if (document.body.offsetWidth >= 1024) {
            if (isLocked.current || showVisitsStats.current) {
                let w = containerRef.current.getBoundingClientRect()!.width
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
        } else {
            if (isLocked.current || showVisitsStats.current) {
                let h = containerRef.current.getBoundingClientRect()!.height
                await animate(scope.current, { y: h, opacity: 1 })
                animationFinish.current = true
                rerender()
            } else {
                await animate(scope.current, { y: '0', opacity: 0 })
                animationFinish.current = true
                rerender()
            }
        }
    }

    useEffect(() => {
        console.log('useEffect1', { containerRef: containerRef.current, scope: scope.current })
        document.body.addEventListener("pointerdown", handleClickOutside);

        return () => {
            document.body.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [containerRef.current, scope.current]);

    useEffect(() => {
        console.log('useEffect2', { isLocked: isLocked.current, showVisitsStats: showVisitsStats.current, animationFinish: animationFinish.current })

        rerender()
        checkState()
    }, [isLocked.current, showVisitsStats.current, containerRef?.current])

    useEffect(() => {
        console.log('useEffect3', { containerRef: containerRef.current, scope: scope.current })
        if (containerRef.current && scope.current) {
            if (document.body.offsetWidth >= 1024) {
                let r = containerRef.current.getBoundingClientRect()!.right
                scope.current.style.width = `${document.body.offsetWidth - r}px`
            } else
                scope.current.style.width = `100%`
        }
    }, [containerRef.current, scope.current]);

    const cardRef = useRef<HTMLDivElement>(null)
    const cardWidth = useRef<number>()

    useEffect(() => {
        console.log('useEffect4', { cardRef: cardRef.current })
        if (cardRef.current) {
            cardWidth.current = cardRef.current.getBoundingClientRect()!.width
            rerender()
        }
    }, [cardRef.current, visitsPatients.current]);

    return (
        <>
            <div onPointerDown={handleClickOnCalendar} ref={containerRef} {...containerProps} className={cn("relative h-full", containerProps?.className)}>
                <div className="absolute top-0 z-[1] w-full">
                    <div ref={scope} className="opacity-0 px-0 py-2 lg:px-2 lg:py-0 h-80 ">
                        <div className="bg-surface-container-high size-full rounded-lg shadow-lg border overflow-auto p-4">
                            {fetchingVisits.current && <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'><CircularLoading size='lg' /></div>}

                            <Stack direction='vertical' stackProps={{ className: `h-full ${animationFinish.current && !fetchingVisits.current && showVisitsStats.current ? '' : 'hidden'}` }}>
                                <Stack stackProps={{ className: "items-center justify-between px-2" }}>
                                    <p>{t('Calendar.PatientsCount')}:</p>
                                    <p>{patientsCount.current}</p>
                                </Stack>
                                <Stack stackProps={{ className: "items-center justify-between px-2" }}>
                                    <p>{t('Calendar.VisitsCount')}:</p>
                                    <p>{visitsPatients.current.visits.length}</p>
                                </Stack>

                                <div className={`flex-grow`}>
                                    <Stack stackRef={cardRef} direction="vertical" stackProps={{ className: 'rounded-md border size-full p-4' }}>
                                        {visitsPatients.current.visits.map((v, i) =>
                                            <Stack key={i} stackProps={{ className: 'items-center w-full justify-between' }}>
                                                <div className="text-nowrap overflow-auto text-center" style={{ width: cardWidth.current ? `${cardWidth.current / 3}px` : undefined }}>{visitsPatients.current.patients.find(p => p._id === v.patientId)?.firstName}</div>
                                                <Separator orientation="vertical" />
                                                <div className="text-nowrap overflow-auto text-center" style={{ width: cardWidth.current ? `${cardWidth.current / 3}px` : undefined }}>{visitsPatients.current.patients.find(p => p._id === v.patientId)?.lastName}</div>
                                                <Separator orientation="vertical" />
                                                <div className="text-nowrap overflow-auto text-center" style={{ width: cardWidth.current ? `${cardWidth.current / 3}px` : undefined }}>{typeof v.due === 'number' ? toFormat(v.due as number, configuration.local, undefined, DATE) : '-'}</div>
                                            </Stack>
                                        )}
                                    </Stack>
                                </div>
                            </Stack>
                        </div>
                    </div>
                </div>

                <div {...calendarContainerProps} className={cn("absolute top-0 left-0 overflow-auto z-[2] p-1 size-full", calendarContainerProps?.className)}>
                    <CalendarComponent
                        onDaySelect={onDaySelect}
                        onDayPointerEnter={onEnter}
                        onDayPointerLeave={onLeave}
                    />
                </div>
            </div>
        </>
    )
}

