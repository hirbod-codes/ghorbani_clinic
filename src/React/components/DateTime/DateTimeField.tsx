import { useState } from 'react';
import type { Date, Time } from './date-time';
import { DateField } from './DateField';
import { TimeField } from './TimeField';


export function DateTimeField({ variant, defaultDate, defaultTime, onChange, onDateChange, onTimeChange }: { defaultTime?: Time; defaultDate?: Date; onChange?: ({ time, date }: { time: Time; date: Date; }) => void; onDateChange?: (date: Date) => void; onTimeChange?: (time: Time) => void; variant?: "standard" | "outlined" | "filled"; }) {
    const [date, setDate] = useState<Date>(defaultDate);
    const [time, setTime] = useState<Time>(defaultTime);

    return (
        <>
            <DateField
                defaultDate={defaultDate}
                variant={variant ?? 'standard'}
                onChange={(d) => {
                    setDate(d);

                    if (onDateChange)
                        onDateChange(d);

                    if (onChange && time)
                        onChange({ time, date: d });

                }} />
            <TimeField
                defaultTime={defaultTime}
                variant={variant ?? 'standard'}
                onChange={(t) => {
                    setTime(t);

                    if (onTimeChange)
                        onTimeChange(t);

                    if (onChange && date)
                        onChange({ date, time: t });

                }} />
        </>
    );
}
