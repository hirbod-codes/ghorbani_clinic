import { ComponentProps, memo, PointerEvent as ReactPointerEvent, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Visit } from "../../../Electron/Database/Models/Visit";
import { Calendar as CalendarComponent } from "../../Components/Calendar";
import { getVisitsInDate, getVisitsPatients } from "../../Components/Visits/helpers";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { t } from "i18next";
import { Stack } from "../../Components/Base/Stack";
import { cn } from "../../shadcn/lib/utils";
import { DATE, toFormat } from "../../Lib/DateTime/date-time-helpers";
import { useAnimate } from "framer-motion";
import { CircularLoading } from "../../Components/Base/CircularLoading";
import { Date as DateType } from "../../Lib/DateTime";
import { Patient } from "@/src/Electron/Database/Models/Patient";
import { Separator } from "../../shadcn/components/ui/separator";
import { resources } from "@/src/Electron/Database/Repositories/Auth/resources";
import { AuthContext } from "../../Contexts/AuthContext";

export const Calendar = memo(function Calendar({ containerProps, calendarContainerProps }: { containerProps?: ComponentProps<'div'>, calendarContainerProps?: ComponentProps<'div'> }) {
    const auth = useContext(AuthContext)

    const configuration = useContext(ConfigurationContext)!

    const lastEventCall = useRef<'onEnter' | 'onLeave' | undefined>(undefined)

    const showVisitsStats = useRef<boolean>(false)
    const fetchingVisits = useRef<boolean>(false)
    const isLocked = useRef<boolean>(false)

    const onEnterTimeout = useRef<NodeJS.Timeout>()

    const visitsPatients = useRef<{
        visits: Visit[];
        patients: Patient[];
    }>({ visits: [], patients: [] })
    const patientsCount = useRef<number>(0)

    const animationFinish = useRef<boolean>(true)
    const [scope, animate] = useAnimate()

    const containerRef = useRef<HTMLDivElement>(null)

    const previousDate = useRef<DateType>()

    const cardRef = useRef<HTMLDivElement>(null)
    const cardWidth = useRef<number>()

    const [, rerender] = useReducer(x => x + 1, 0)

    const readsPatient = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).read(resources.PATIENT).granted, [auth])
    const readsVisit = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).read(resources.VISIT).granted, [auth])

    console.log('Home.Calendar', { showVisitsStats: showVisitsStats.current, isLocked: isLocked.current, visitsLength: visitsPatients.current.visits.length, patientsCount, fetchingVisits: fetchingVisits.current, containerProps, calendarContainerProps, animationFinish: animationFinish.current })

    const updateCard = async (year: number, month: number, day: number) => {
        fetchingVisits.current = true
        const vp = await getVisitsPatients(await getVisitsInDate({ year, month, day }, configuration.local) ?? [])
        visitsPatients.current = vp ?? []

        if (vp) {
            patientsCount.current = vp.patients.length
        } else
            patientsCount.current = 0

        fetchingVisits.current = false
    }

    let onEnter: ((year: number, month: number, day: number) => Promise<void>) | undefined = async (year: number, month: number, day: number) => {
        if (lastEventCall.current === 'onEnter')
            return

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

            scope.current.style.display = 'block'

            rerender()
        }, 100)

        lastEventCall.current = 'onEnter'
    }

    let onLeave: ((y: number, m: number, d: number) => void) | undefined = (y: number, m: number, d: number) => {
        if (lastEventCall.current === 'onLeave')
            return

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

        lastEventCall.current = 'onLeave'
    }

    let onDaySelect: ((y: number, m: number, d: number) => Promise<void>) | undefined = async (year, month, day) => {
        // isLocked=false

        showVisitsStats.current = true
        rerender()

        await updateCard(year, month, day)

        isLocked.current = true
    }

    let handleClickOnCalendar: ((e: ReactPointerEvent<HTMLDivElement>) => Promise<void>) | undefined = useCallback(async function handleClickOnCalendar(e: ReactPointerEvent<HTMLDivElement>) {
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

    if (!readsPatient || !readsVisit) {
        onEnter = undefined
        onLeave = undefined
        onDaySelect = undefined
        handleClickOnCalendar = undefined
    }

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
        if (document.body.offsetWidth >= 1024) {
            if (isLocked.current || showVisitsStats.current) {
                scope.current.style.display = 'block'
                rerender()
                let w = containerRef.current!.getBoundingClientRect()!.width
                if (configuration.local.direction === 'rtl')
                    w *= -1
                await animate(scope.current, { x: w, opacity: 1 })
                animationFinish.current = true
                rerender()
            } else {
                await animate(scope.current, { x: '0', opacity: 0 })
                scope.current.style.display = 'none'
                animationFinish.current = true
                rerender()
            }
        } else {
            if (isLocked.current || showVisitsStats.current) {
                scope.current.style.display = 'block'
                rerender()
                let h = containerRef.current!.getBoundingClientRect()!.height
                await animate(scope.current, { y: h, opacity: 1 })
                animationFinish.current = true
                rerender()
            } else {
                await animate(scope.current, { y: '0', opacity: 0 })
                scope.current.style.display = 'none'
                animationFinish.current = true
                rerender()
            }
        }
    }

    useEffect(() => {
        if (readsPatient && readsVisit) {
            console.log('Home.Calendar', 'useEffect', 'add pointerdown event', { containerRef: containerRef.current, scope: scope.current })
            document.body.addEventListener("pointerdown", handleClickOutside);

            return () => {
                document.body.removeEventListener("pointerdown", handleClickOutside);
            };
        }
    }, [containerRef.current, scope.current]);

    useEffect(() => {
        console.log('Home.Calendar', 'useEffect', 'checkState', { isLocked: isLocked.current, showVisitsStats: showVisitsStats.current, animationFinish: animationFinish.current })

        rerender()
        checkState()
    }, [isLocked.current, showVisitsStats.current, containerRef?.current, scope?.current])

    useEffect(() => {
        console.log('Home.Calendar', 'useEffect', 'calculate scope\'s width', { containerRef: containerRef.current, scope: scope.current })
        if (containerRef.current && scope.current) {
            if (document.body.offsetWidth >= 1024) {
                let r = containerRef.current.getBoundingClientRect()!.right
                scope.current.style.width = `${document.body.offsetWidth - r}px`
            } else
                scope.current.style.width = `100%`
        }
    }, [containerRef.current, scope.current]);

    useEffect(() => {
        console.log('Home.Calendar', 'useEffect', 'calculate card\'s width', { cardRef: cardRef.current })
        if (cardRef.current) {
            cardWidth.current = cardRef.current.getBoundingClientRect()!.width
            rerender()
        }
    }, [cardRef.current, visitsPatients.current]);

    return (
        <>
            <div onPointerDown={handleClickOnCalendar} ref={containerRef} {...containerProps} className={cn("relative h-full", containerProps?.className)}>
                <div className="absolute top-0 z-[1] w-full">
                    <div ref={scope} className={`opacity-0 px-0 py-2 lg:px-2 lg:py-0 h-80`}>
                        <div className="bg-surface-container-high size-full rounded-lg shadow-lg border overflow-auto p-4">
                            {fetchingVisits.current && <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'><CircularLoading size='lg' /></div>}

                            {animationFinish.current && !fetchingVisits.current && showVisitsStats.current &&
                                <Stack direction='vertical' stackProps={{ className: `h-full ${animationFinish.current && !fetchingVisits.current && showVisitsStats.current ? '' : ''}` }}>
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
                            }
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
})
