import { Divider, Stack, Typography } from "@mui/material";
import { memo, useContext, useReducer, useState } from "react";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { toDateTime, toDateTimeView } from "../../Lib/DateTime/date-time-helpers";
import { DateTime } from "luxon";
import { CalendarManager } from "./CalendarManager";
import { CalendarScopes } from "./index.d";
import { NextPrevButtons } from "./NextPrevButtons";
import { Slide } from "./Slide";

export type CalendarProps = {
    validScopes?: CalendarScopes[],
    onYearSelect?: (year: number) => void | Promise<void>,
    onMonthSelect?: (year: number, month: number) => void | Promise<void>,
    onDaySelect?: (year: number, month: number, day: number) => void | Promise<void>
    onYearPointerOver?: (year: number) => void | Promise<void>,
    onMonthPointerOver?: (year: number, month: number) => void | Promise<void>,
    onDayPointerOver?: (year: number, month: number, day: number) => void | Promise<void>
    onYearPointerOut?: (year: number) => void | Promise<void>,
    onMonthPointerOut?: (year: number, month: number) => void | Promise<void>,
    onDayPointerOut?: (year: number, month: number, day: number) => void | Promise<void>
}

export const Calendar = memo(function Calendar({ validScopes = ['days', 'months', 'years'], onYearSelect, onMonthSelect, onDaySelect, onYearPointerOver, onMonthPointerOver, onDayPointerOver, onYearPointerOut, onMonthPointerOut, onDayPointerOut }: CalendarProps) {
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
                    onDaySelect(calendarManager.selectedYear, calendarManager.selectedMonth, i + 1)
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
                    onDayPointerOver(calendarManager.selectedYear, calendarManager.selectedMonth, i + 1)
                break;
        }
    }

    const onPointerOut = (value: string | number, i: number) => {
        switch (calendarManager.getScope()) {
            case 'years':
                if (!validScopes.includes('months'))
                    break;
                if (onYearPointerOut)
                    onYearPointerOut(value as number)
                break;
            case 'months':
                if (!validScopes.includes('days'))
                    break;
                if (onMonthPointerOut)
                    onMonthPointerOut(calendarManager.selectedYear, i + 1)
                break;
            case 'days':
                if (onDayPointerOut)
                    onDayPointerOut(calendarManager.selectedYear, calendarManager.selectedMonth, i + 1)
                break;
        }
    }

    let collection: (string | number)[], headers: string[] | undefined = undefined, columns = 12
    switch (calendarManager.getScope()) {
        case 'days':
            columns = 7
            collection = calendarManager.getScopeValues() as number[]
            headers = calendarManager.getWeekDays().map(e => e.slice(0, 3))
            break;
        case 'months':
            columns = 3
            collection = calendarManager.getScopeValues().map(e => e.name.slice(0, 3))
            break;
        case 'years':
            columns = 7
            collection = calendarManager.getScopeValues() as number[]
            break;
    }

    console.log('Calendar', { locale: local, collection, columns, calendarManager })

    return (
        <Stack direction='column' divider={<Divider />} spacing={0.2}>
            <Stack direction='row' alignItems='center' spacing={0.2}>
                <NextPrevButtons onPrev={() => { calendarManager.previous(); rerender() }} onNext={() => { calendarManager.next(); rerender() }} />

                <Divider orientation="vertical" variant='middle' sx={{ height: '2rem' }} />

                <Stack direction='row' justifyContent='center' sx={{ flexGrow: 2 }}>
                    <Typography textAlign='center' onClick={onTitleClick} sx={{ cursor: 'pointer' }}>
                        {calendarManager.getTitle()}
                    </Typography>
                </Stack>
            </Stack>

            <Slide
                columns={columns}
                collection={collection}
                headers={headers}
                onElmClick={onElmClick}
                onPointerOver={onPointerOver}
                onPointerOut={onPointerOut}
            />
        </Stack>
    )
})
