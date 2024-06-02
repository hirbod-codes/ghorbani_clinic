import { TextField } from '@mui/material';
import { useState } from 'react';
import type { Time } from './date-time';


export function TimeField({ defaultTime, onChange, variant }: { defaultTime?: Time; onChange?: (time: Time) => void; variant?: "standard" | "outlined" | "filled"; }) {
    if (!onchange)
        onChange = () => null;

    const [hour, setHour] = useState<number>(undefined);
    const [minute, setMinute] = useState<number>(undefined);
    const [second, setSecond] = useState<number>(undefined);

    if (!hour && defaultTime?.hour)
        setHour(defaultTime.hour);

    if (!minute && defaultTime?.minute)
        setMinute(defaultTime.minute);

    if (!second && defaultTime?.second)
        setSecond(defaultTime.second);

    return (
        <>
            <TextField
                type='time'
                label='Time'
                variant={variant ?? 'standard'}
                inputProps={{ step: '1' }}
                value={hour === undefined ? '' : `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`}
                onChange={(e) => {
                    setHour(Number(e.target.value.split(':')[0]));
                    setMinute(Number(e.target.value.split(':')[1]));
                    setSecond(Number(e.target.value.split(':')[2]));
                    onChange({
                        hour: Number(e.target.value.split(':')[0]),
                        minute: Number(e.target.value.split(':')[1]),
                        second: Number(e.target.value.split(':')[2]),
                    });
                }}
                sx={{ width: '7rem' }} />
        </>
    );
}
