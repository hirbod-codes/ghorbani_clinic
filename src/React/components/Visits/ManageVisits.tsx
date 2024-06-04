import { Stack, Divider, IconButton, Box, Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material';
import { useState, useContext, useRef } from 'react';
import { DateTime } from 'luxon';
import { fromDateTimeParts, fromUnix, fromUnixToFormat } from '../DateTime/date-time-helpers';
import { ConfigurationContext } from '../../ConfigurationContext';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { Diagnosis } from './Diagnosis';
import { DateTimeField } from '../DateTime/DateTimeField';

import AddIcon from '@mui/icons-material/AddOutlined';
import DoneIcon from '@mui/icons-material/DoneOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export function ManageVisits({ patientId, defaultVisits, onComplete }: { patientId?: string; defaultVisits?: Visit[]; onComplete?: (visits: Visit[]) => void; }) {
    const locale = useContext(ConfigurationContext).get.locale;

    const getDefaultVisit = (): Visit => {
        return {
            schemaVersion: 'v0.0.1',
            patientId: patientId ?? undefined,
            due: DateTime.local({ zone: locale.zone }).toUnixInteger(),
            createdAt: DateTime.local({ zone: locale.zone }).toUnixInteger(),
            updatedAt: DateTime.local({ zone: locale.zone }).toUnixInteger(),
        }
    }

    const [visits, setVisits] = useState<Visit[]>([getDefaultVisit()]);

    const isDefaultSet = useRef(false)
    if (!isDefaultSet.current && defaultVisits) {
        setVisits([...defaultVisits]);
        isDefaultSet.current = true
    }

    if (visits.length === 0)
        setVisits([getDefaultVisit()])

    return (
        <Stack direction='column' alignItems={'center'} spacing={2} divider={<Divider orientation='horizontal' variant='middle' flexItem />}>
            {visits.map((v, i) =>
                <Accordion key={i} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            {visits[i]?.due && fromUnixToFormat(locale, visits[i].due)}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <DateTimeField
                            onChange={(dateTime) => {
                                const convertedDate = fromDateTimeParts({ ...locale, calendar: 'Gregorian' }, locale, dateTime.date, dateTime.time);
                                visits[i].due = DateTime.local(convertedDate.date.year, convertedDate.date.month, convertedDate.date.day, convertedDate.time.hour, convertedDate.time.minute, convertedDate.time.second, { zone: locale.zone }).toUnixInteger();
                                setVisits([...visits]);
                            }}
                            defaultDate={fromUnix(locale, visits[i].due).date}
                            defaultTime={fromUnix(locale, visits[i].due).time}
                        />

                        <Box sx={{ p: 2 }}>
                            <Diagnosis onChange={(strings) => {
                                visits[i].diagnosis = strings;
                                setVisits([...visits]);
                            }} defaultNotes={visits[i].diagnosis} />
                        </Box>
                    </AccordionDetails>
                </Accordion>
            )}

            <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} justifyContent={'center'}>
                {visits.length !== 0 &&
                    <IconButton
                        color="error"
                        onClick={() => {
                            visits.pop();
                            setVisits([...visits]);
                        }}
                    >
                        <CloseIcon />
                    </IconButton>}
                <IconButton
                    color="success"
                    onClick={() => {
                        visits.push(getDefaultVisit());
                        setVisits([...visits]);
                    }}
                >
                    <AddIcon />
                </IconButton>
            </Stack>

            <Stack direction='row' justifyContent={'flex-end'} sx={{ width: '100%' }}>
                <IconButton color='primary' onClick={() => onComplete(visits)}>
                    <DoneIcon />
                </IconButton>
            </Stack>
        </Stack>
    );
}
