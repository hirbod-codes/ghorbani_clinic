import { ComponentProps, useState } from 'react';
import { Time } from '../../../Lib/DateTime';
import { t } from 'i18next';
import { Input } from '../Input';

export function TimeField({ defaultTime, onChange, variant }: { defaultTime?: Time; onChange?: (time: Time) => void; variant?: "standard" | "outlined" | "filled"; inputProps?: ComponentProps<typeof Input> }) {
    const [hour, setHour] = useState<number | undefined>(undefined);
    const [minute, setMinute] = useState<number | undefined>(undefined);
    const [second, setSecond] = useState<number | undefined>(undefined);

    if (!hour && defaultTime?.hour)
        setHour(defaultTime.hour);

    if (!minute && defaultTime?.minute)
        setMinute(defaultTime.minute);

    if (!second && defaultTime?.second)
        setSecond(defaultTime.second);

    return (
        <Input
            label={t('TimeField .Time')}
            labelId='time'
            type='time'
            step={1}
            value={hour === undefined ? '' : `${hour?.toString().padStart(2, '0')}:${minute?.toString().padStart(2, '0')}:${second?.toString().padStart(2, '0')}`}
            onChange={(e) => {
                setHour(Number(e.target.value.split(':')[0]));
                setMinute(Number(e.target.value.split(':')[1]));
                setSecond(Number(e.target.value.split(':')[2]));
                if (onChange)
                    onChange({
                        hour: Number(e.target.value.split(':')[0]),
                        minute: Number(e.target.value.split(':')[1]),
                        second: Number(e.target.value.split(':')[2]),
                    });
            }}
            style={{ width: '7rem' }}
        />
    );
}
