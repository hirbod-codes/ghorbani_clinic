import { memo, useContext, useReducer, useState } from "react";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { toDateTime, toDateTimeView, toFormat } from "../../Lib/DateTime/date-time-helpers";
import { DateTime } from "luxon";
import { CalendarManager } from "./CalendarManager";
import { CalendarScopes } from "./index.d";
import { NextPrevButtons } from "./NextPrevButtons";
import { Slide } from "./Slide";
import { Separator } from "../../shadcn/components/ui/separator";
import { Stack } from "../Base/Stack";
import { localizeNumbers } from "../../Localization/helpers";

export type CalendarProps = {
    validScopes?: CalendarScopes[]
    onYearSelect?: (year: number) => void | Promise<void>
    onMonthSelect?: (year: number, month: number) => void | Promise<void>
    onDaySelect?: (year: number, month: number, day: number) => void | Promise<void>
    onYearPointerOver?: (year: number) => void | Promise<void>
    onMonthPointerOver?: (year: number, month: number) => void | Promise<void>
    onDayPointerOver?: (year: number, month: number, day: number) => void | Promise<void>
    onYearPointerEnter?: (year: number) => void | Promise<void>
    onMonthPointerEnter?: (year: number, month: number) => void | Promise<void>
    onDayPointerEnter?: (year: number, month: number, day: number) => void | Promise<void>
    onYearPointerLeave?: (year: number) => void | Promise<void>
    onMonthPointerLeave?: (year: number, month: number) => void | Promise<void>
    onDayPointerLeave?: (year: number, month: number, day: number) => void | Promise<void>
}

export const Calendar = memo(function Calendar({ validScopes = ['days', 'months', 'years'], onYearSelect, onMonthSelect, onDaySelect, onYearPointerOver, onMonthPointerOver, onDayPointerOver, onYearPointerEnter, onMonthPointerEnter, onDayPointerEnter, onYearPointerLeave, onMonthPointerLeave, onDayPointerLeave }: CalendarProps) {
    if (!validScopes || validScopes.length === 0)
        throw new Error('No scope provided')

    let local = useContext(ConfigurationContext)!.local

    const [, rerender] = useReducer(x => x + 1, 0)

    const { date } = toDateTimeView(DateTime.utc().toUnixInteger(), local)
    const [calendarManager, setCalendarManager] = useState(new CalendarManager(date.year, date.month, local))

    const onTitleClick = () => {
        switch (calendarManager.getScope()) {
            case 'years':
                return

            case 'months':
                if (!validScopes.includes('years'))
                    return
                calendarManager.setScope('years', calendarManager.selectedYear, calendarManager.selectedMonth)
                break;

            case 'days':
                if (!validScopes.includes('months'))
                    return
                calendarManager.setScope('months', calendarManager.selectedYear, calendarManager.selectedMonth)
                break;
        }

        rerender()
    }

    const onElmClick = (value: string | number, i: number) => {
        switch (calendarManager.getScope()) {
            case 'years':
                if (!validScopes.includes('months'))
                    break;
                calendarManager.setScope('months', value as number, calendarManager.selectedMonth)
                if (onYearSelect)
                    onYearSelect(value as number)
                rerender()
                break;
            case 'months':
                if (!validScopes.includes('days'))
                    break;
                calendarManager.setScope('days', calendarManager.selectedYear, i + 1)
                if (onMonthSelect)
                    onMonthSelect(calendarManager.selectedYear, i + 1)
                rerender()
                break;
            case 'days':
                if (onDaySelect)
                    onDaySelect(calendarManager.selectedYear, calendarManager.selectedMonth, i - collection.filter(f => f === null).length + 1)
                break;
        }
    }

    const onPointerEnter = (value: string | number, i: number) => {
        switch (calendarManager.getScope()) {
            case 'years':
                if (!validScopes.includes('months'))
                    break;
                if (onYearPointerEnter)
                    onYearPointerEnter(value as number)
                break;
            case 'months':
                if (!validScopes.includes('days'))
                    break;
                if (onMonthPointerEnter)
                    onMonthPointerEnter(calendarManager.selectedYear, i + 1)
                break;
            case 'days':
                if (onDayPointerEnter)
                    onDayPointerEnter(calendarManager.selectedYear, calendarManager.selectedMonth, i - collection.filter(f => f === null).length + 1)
                break;
        }
    }

    const onPointerOver = (value: string | number, i: number) => {
        switch (calendarManager.getScope()) {
            case 'years':
                if (!validScopes.includes('months'))
                    break;
                if (onYearPointerOver)
                    onYearPointerOver(value as number)
                break;
            case 'months':
                if (!validScopes.includes('days'))
                    break;
                if (onMonthPointerOver)
                    onMonthPointerOver(calendarManager.selectedYear, i + 1)
                break;
            case 'days':
                if (onDayPointerOver)
                    onDayPointerOver(calendarManager.selectedYear, calendarManager.selectedMonth, i - collection.filter(f => f === null).length + 1)
                break;
        }
    }

    const onPointerLeave = (value: string | number, i: number) => {
        switch (calendarManager.getScope()) {
            case 'years':
                if (!validScopes.includes('months'))
                    break;
                if (onYearPointerLeave)
                    onYearPointerLeave(value as number)
                break;
            case 'months':
                if (!validScopes.includes('days'))
                    break;
                if (onMonthPointerLeave)
                    onMonthPointerLeave(calendarManager.selectedYear, i + 1)
                break;
            case 'days':
                if (onDayPointerLeave)
                    onDayPointerLeave(calendarManager.selectedYear, calendarManager.selectedMonth, i - collection.filter(f => f === null).length + 1)
                break;
        }
    }

    let ts = DateTime.utc().toUnixInteger()
    let coloredIndex
    let collection: (string | number)[], headers: string[] | undefined = undefined, columns = 7
    switch (calendarManager.getScope()) {
        case 'days':
            columns = 7
            collection = calendarManager.getScopeValues() as number[]
            headers = calendarManager.getWeekDays().map(e => e.slice(0, 3))

            if (
                calendarManager.selectedYear === Number(toFormat(ts, { ...local, language: 'en' }, { ...local, zone: 'UTC' }, 'yyyy')) &&
                calendarManager.selectedMonth === Number(toFormat(ts, { ...local, language: 'en' }, { ...local, zone: 'UTC' }, 'M'))
            )
                coloredIndex = collection.filter(f => f === null).length + Number(toFormat(ts, { ...local, language: 'en' }, { ...local, zone: 'UTC' }, 'd')) - 1
            break;
        case 'months':
            columns = 3
            collection = calendarManager.getScopeValues().map(e => e.name.slice(0, 3))

            if (calendarManager.selectedYear === Number(toFormat(ts, { ...local, language: 'en' }, { ...local, zone: 'UTC' }, 'yyyy')))
                coloredIndex = Number(toFormat(ts, { ...local, language: 'en' }, { ...local, zone: 'UTC' }, 'M')) - 1
            break;
        case 'years':
            columns = 7
            collection = (calendarManager.getScopeValues() as number[])

            if (collection.includes(Number(toFormat(ts, { ...local, language: 'en' }, { ...local, zone: 'UTC' }, 'yyyy'))))
                coloredIndex = collection.findIndex(f => f === Number(toFormat(ts, { ...local, language: 'en' }, { ...local, zone: 'UTC' }, 'yyyy')))
            break;
    }

    console.log('Calendar', { locale: local, collection, columns, calendarManager })

    return (
        <Stack direction='vertical' stackProps={{ className: "*:select-none size-full py-4" }}>
            <Stack stackProps={{ className: "items-center" }}>
                <NextPrevButtons onPrev={() => { calendarManager.previous(); rerender() }} onNext={() => { calendarManager.next(); rerender() }} />

                <Separator orientation="vertical" />

                <Stack stackProps={{ className: "justify-center flex-grow" }}>
                    <div onClick={onTitleClick} className="text-center cursor-pointer">
                        {calendarManager.getTitle()}
                    </div>
                </Stack>
            </Stack>

            <div className="flex-grow">
                <Slide
                    columns={columns}
                    collection={collection.map(n => n === null ? null : ({ value: n, displayValue: calendarManager.getScope() === 'months' ? n : localizeNumbers(local.language, n, { useGrouping: false }) }))}
                    headers={headers}
                    onElmClick={onElmClick}
                    onPointerEnter={onPointerEnter}
                    onPointerOver={onPointerOver}
                    onPointerLeave={onPointerLeave}
                    coloredIndex={coloredIndex}
                />
            </div>
        </Stack>
    )
})
