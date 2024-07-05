import { TextField, Select, MenuItem, ButtonGroup, InputLabel, FormControl } from '@mui/material';
import { useState, useContext } from 'react';
import { DateTime } from 'luxon';
import { Date } from '../../Lib/DateTime';
import { ConfigurationContext } from '../../Contexts/ConfigurationContext';
import { getLocaleMonths } from '../../Lib/DateTime/date-time-helpers';

export function DateField({ defaultDate, onChange, variant }: { defaultDate?: Date; onChange?: (date: Date) => void; variant?: "standard" | "outlined" | "filled"; }) {
    const locale = useContext(ConfigurationContext).get.locale;
    const localeMonths = getLocaleMonths(locale, DateTime.local({ zone: locale.zone }).year);

    const [year, setYear] = useState<number>(undefined);
    const [month, setMonth] = useState<number>(undefined);
    const [day, setDay] = useState<number>(undefined);

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
                    sx={{ width: '7rem' }}
                    onChange={(e) => {
                        try {
                            if (month === undefined || day === undefined)
                                setYear(Number(e.target.value));
                            else {
                                setYear(Number(e.target.value));
                                onChange({ year: year, month: month, day: day });
                            }
                        } catch (error) { console.error('year', error); return; }
                    }} />
                <FormControl variant={variant ?? 'standard'}>
                    <InputLabel id="month-label">Month</InputLabel>
                    <Select
                        labelId="month-label"
                        value={month ? localeMonths[month - 1].name : ''}
                        sx={{ width: '7rem' }}
                        onChange={(e) => {
                            try {
                                const month = localeMonths.findIndex(m => m.name === e.target.value.toString()) + 1;
                                if (year === undefined || day === undefined)
                                    setMonth(month);
                                else {
                                    setMonth(month);
                                    onChange({ year: year, month: month, day: day });
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
                    sx={{ width: '7rem' }}
                    onChange={(e) => {
                        try {
                            const day = Number(e.target.value);
                            if (month === undefined || year === undefined)
                                setDay(day);
                            else {
                                setDay(day);
                                onChange({ year: year, month: month, day: day });
                            }
                        } catch (error) { console.error('day', error); return; }
                    }} />
            </ButtonGroup>
        </>
    );
}
