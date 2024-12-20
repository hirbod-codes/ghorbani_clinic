import { useState, useContext } from 'react';
import { DateTime } from 'luxon';
import { Date } from '../../../Lib/DateTime';
import { ConfigurationContext } from '../../../Contexts/Configuration/ConfigurationContext';
import { getLocaleMonths } from '../../../Lib/DateTime/date-time-helpers';
import { InputGroup } from '../InputGroup';
import { t } from 'i18next';

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
            <InputGroup
                fields={[
                    {
                        type: 'input',
                        props: {
                            placeholder: t('DateField.Year'),
                            style: { width },
                            value: year ?? '',
                            onChange: (e) => {
                                try {
                                    if (month === undefined || day === undefined)
                                        setYear(Number(e.target.value));
                                    else {
                                        setYear(Number(e.target.value));
                                        if (onChange)
                                            onChange({ year: Number(e.target.value), month, day });
                                    }
                                } catch (error) { console.error('year', error); return; }
                            }
                        },
                    },
                    {
                        type: 'select',
                        props: {
                            selectOptions: {
                                type: 'items',
                                items: localeMonths.map((m, i) => ({ value: m.name, displayValue: m.name }))
                            }
                        }
                    },
                    {
                        type: 'input',
                        props: {
                            placeholder: t('DateField.Day'),
                            style: { width },
                            value: day ?? '',
                            onChange: (e) => {
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
                            }
                        }
                    }
                ]}
            />
        </>
    );
}
