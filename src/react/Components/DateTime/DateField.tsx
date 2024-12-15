import { TextField, Select, MenuItem, ButtonGroup, InputLabel, FormControl } from '@mui/material';
import { useState, useContext } from 'react';
import { DateTime } from 'luxon';
import { Date } from '../../Lib/DateTime';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { getLocaleMonths } from '../../Lib/DateTime/date-time-helpers';

export function DateField({ defaultDate, width = '7rem', onChange, variant }: { defaultDate?: Date; width?: string; onChange?: (date: Date) => void; variant?: "standard" | "outlined" | "filled"; }) {
    const local = useContext(ConfigurationContext)!.local;
    const localeMonths = getLocaleMonths(local, DateTime.local({ zone: local.zone }).year);

    const [year, setYear] = useState<number | undefined>(undefined);
    const [month, setMonth] = useState<number | undefined>(undefined);
    const [day, setDay] = useState<number | undefined>(undefined);

    if (!year && defaultDate?.year)
        setYear(defaultDate.year);

    if (!month && defaultDate?.month)
        setMonth(defaultDate.month);

    if (!day && defaultDate?.day)
        setDay(defaultDate.day);

    return (
        <>
            <ButtonGroup variant="text">
                <TextField
                    variant={variant ?? 'standard'}
                    value={year ?? ''}
                    label='Year'
                    sx={{ width }}
                    onChange={(e) => {
                        try {
                            if (month === undefined || day === undefined)
                                setYear(Number(e.target.value));
                            else {
                                setYear(Number(e.target.value));
                                if (onChange)
                                    onChange({ year: Number(e.target.value), month, day });
                            }
                        } catch (error) { console.error('year', error); return; }
                    }} />
                <FormControl variant={variant ?? 'standard'}>
                    <InputLabel id="month-label">Month</InputLabel>
                    <Select
                        labelId="month-label"
                        value={month ? localeMonths[month - 1].name : ''}
                        sx={{ width }}
                        onChange={(e) => {
                            try {
                                const month = localeMonths.findIndex(m => m.name === e.target.value.toString()) + 1;
                                if (year === undefined || day === undefined)
                                    setMonth(month);
                                else {
                                    setMonth(month);
                                    if (onChange)
                                        onChange({ year, month, day });
                                }
                            } catch (error) { console.error('month', error); return; }
                        }}
                    >
                        {localeMonths.map((m, i) => <MenuItem key={i} value={m.name}>{m.name}</MenuItem>
                        )}
                    </Select>
                </FormControl>
                <TextField
                    variant={variant ?? 'standard'}
                    value={day ?? ''}
                    label='Day'
                    sx={{ width }}
                    onChange={(e) => {
                        try {
                            const day = Number(e.target.value);
                            if (month === undefined || year === undefined)
                                setDay(day);
                            else {
                                setDay(day);
                                if (onChange)
                                    onChange({ year: year, month: month, day: day });
                            }
                        } catch (error) { console.error('day', error); return; }
                    }} />
            </ButtonGroup>
        </>
    );
}
