import { ArrowLeftOutlined, ArrowRightOutlined, RemoveOutlined } from "@mui/icons-material";
import { Box, Chip, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useReducer, useState } from "react";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { fromUnix } from "../../Lib/DateTime/date-time-helpers";
import { DateTime } from "luxon";
import { CalendarManager } from "./CalendarManager";
import { CalendarScope } from "./index.d";

export type CalendarProps = {
    validScopes: CalendarScope[],
    onYearSelect?: (year: number) => void | Promise<void>,
    onMonthSelect?: (year: number, month: number) => void | Promise<void>,
    onDaySelect?: (year: number, month: number, day: number) => void | Promise<void>
}

export function Calendar({ validScopes, onYearSelect, onMonthSelect, onDaySelect }: CalendarProps) {
    if (!validScopes || validScopes.length === 0)
        throw new Error('No scope provided')

    const locale = useContext(ConfigurationContext).get.locale

    const [, rerender] = useReducer(x => x, 0)

    const { date } = fromUnix(locale, DateTime.utc().toUnixInteger())
    const [calendarManager, setCalendarManager] = useState(new CalendarManager(locale.calendar, date.year, date.month, locale.code, locale))

    useEffect(() => {
        setCalendarManager(new CalendarManager(locale.calendar, date.year, date.month, locale.code, locale))
    }, [locale])

    const onTitleClick = () => {
        const scope = calendarManager.getScope()
        if (scope === 'years')
            return
        else if (scope === 'months') {
            if (!validScopes.includes('years'))
                return
            calendarManager.setScope('years', calendarManager.selectedYear, calendarManager.selectedMonth)
        } else if (scope === 'days') {
            if (!validScopes.includes('months'))
                return
            calendarManager.setScope('months', calendarManager.selectedYear, calendarManager.selectedMonth)
        }

        rerender()
    }

    const onElmClick = (value: string | number, i: number) => {
        switch (calendarManager.getScope()) {
            case 'years':
                if (!validScopes.includes('years'))
                    break;
                calendarManager.setScope('months', value as number, calendarManager.selectedMonth)
                if (onYearSelect)
                    onYearSelect(value as number)
                rerender()
                break;
            case 'months':
                if (!validScopes.includes('months'))
                    break;
                calendarManager.setScope('days', calendarManager.selectedYear, i + 1)
                if (onMonthSelect)
                    onMonthSelect(calendarManager.selectedYear, i + 1)
                rerender()
                break;
            case 'days':
                if (!validScopes.includes('days'))
                    break;
                if (onDaySelect)
                    onDaySelect(calendarManager.selectedYear, calendarManager.selectedMonth, i + 1)
                rerender()
                break;
        }
    }

    let collection: (string | number)[], headers: string[], columns = 12
    switch (calendarManager.getScope()) {
        case 'days':
            columns = 7
            collection = calendarManager.getScopeValues() as number[]
            headers = calendarManager.getWeekDays()
            break;
        case 'months':
            columns = 3
            collection = calendarManager.getScopeValues().map(e => e.name)
            break;
        case 'years':
            columns = 7
            collection = calendarManager.getScopeValues() as number[]
            break;
    }

    console.log('Calendar', { locale, collection, columns })

    return (
        <Paper sx={{ p: 2 }}>
            <Stack direction='column' divider={<Divider />} spacing={1} sx={{ p: 1 }} >
                <Stack direction='row' alignItems='center' sx={{ p: 1 }} spacing={1}>
                    <NextPrevButtons onPrev={calendarManager.previous} onNext={calendarManager.next} />
                    <Divider orientation="vertical" variant='middle' sx={{ height: '2rem' }} />
                    <Stack direction='row' justifyContent='center' sx={{ flexGrow: 2 }}>
                        <Typography textAlign='center' onClick={onTitleClick} sx={{ cursor: 'pointer' }}>
                            {calendarManager.getTitle()}
                        </Typography>
                    </Stack>
                </Stack>
                <Slide
                    columns={columns}
                    collection={calendarManager.getScope() === 'months' ? calendarManager.getScopeValues().map(e => e.name) : calendarManager.getScopeValues()}
                    headers={headers}
                    onElmClick={onElmClick}
                />
            </Stack>
        </Paper>
    )
}

export function NextPrevButtons({ onPrev, onNext }: { onPrev: () => void, onNext: () => void }) {
    return (
        <Stack direction='row'>
            <IconButton onClick={onPrev}>
                <ArrowLeftOutlined />
            </IconButton>
            <IconButton onClick={onNext}>
                <ArrowRightOutlined />
            </IconButton>
        </Stack>
    )
}

export type SlideProps = {
    columns: number;
    collection: (string | number)[];
    headers?: string[]
    onElmClick?: (value: string | number, i: number) => void | Promise<void>;
}

export function Slide({ columns, collection, headers, onElmClick }: SlideProps) {
    return (
        <>
            <Grid container columns={columns} textAlign='center'>
                {headers.map((e, i) => <Grid key={i} item xs={1}><Typography textAlign='center'>{e}</Typography></Grid>)}
                {collection.map((e, i) =>
                    e === null
                        ? <Grid key={i} item xs={1}></Grid>
                        : <Grid key={i} item xs={1}>
                            <Chip sx={{ m: 1 }} label={<Typography textAlign='center'>{e}</Typography>} variant="outlined" onClick={async () => { if (onElmClick) await onElmClick(e, i) }} />
                        </Grid>
                )}
            </Grid>
        </>
    )
}

