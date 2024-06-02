import { useState } from 'react';
import type { Date, Time } from './date-time';
import { DateField } from './DateField';
import { TimeField } from './TimeField';


export function DateTimeField({ variant, defaultDate, defaultTime, onChange, onDateChange, onTimeChange }: { defaultTime?: Time; defaultDate?: Date; onChange?: ({ time, date }: { time: Time; date: Date; }) => void; onDateChange?: (date: Date) => void; onTimeChange?: (time: Time) => void; variant?: "standard" | "outlined" | "filled"; }) {
    if (!onchange)
        onChange = () => null;
    if (!onDateChange)
        onDateChange = () => null;
    if (!onTimeChange)
        onTimeChange = () => null;

    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState<Time>();

    return (
        <>
            <DateField
                defaultDate={defaultDate}
                variant={variant ?? 'outlined'}
                onChange={(date) => {
                    setDate(date);
                    onDateChange(date);
                    onChange({ time, date });
                }} />
            <TimeField
                defaultTime={defaultTime}
                variant={variant ?? 'outlined'}
                onChange={(time) => {
                    setTime(time);
                    onTimeChange(time);
                    onChange({ date, time });
                }} />
        </>
    );
}
