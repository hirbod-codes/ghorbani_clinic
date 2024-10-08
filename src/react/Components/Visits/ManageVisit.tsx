import { useState, useContext, useRef, useEffect } from 'react';

import { Stack, Divider, IconButton, Accordion, AccordionSummary, Typography, AccordionDetails, Button } from '@mui/material';
import { AddOutlined, Close, ExpandMore } from '@mui/icons-material';

import { DateTime } from 'luxon';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { ConfigurationContext } from '../../../react/Contexts/ConfigurationContext';
import { fromUnixToFormat, fromDateTimeParts, fromUnix } from '../../../react/Lib/DateTime/date-time-helpers';
import { DateTimeField } from '../DateTime/DateTimeField';
import { t } from 'i18next';
import { EditorModal } from '../Editor/EditorModal';

export function ManageVisits({ patientId, defaultVisits, onChange }: { patientId?: string; defaultVisits?: Visit[]; onChange?: (visits: Visit[]) => void; }) {
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

    const [showDiagnosis, setShowDiagnosis] = useState<boolean>(false)
    const [showTreatments, setShowTreatments] = useState<boolean>(false)
    const [activeVisitIndex, setActiveVisitIndex] = useState<number>();
    const [visits, setVisits] = useState<Visit[]>([]);

    useEffect(() => {
        setVisits([...defaultVisits]);
    }, [defaultVisits])

    return (
        <>
            <EditorModal
                open={showDiagnosis}
                onClose={() => {
                    setShowDiagnosis(false)
                }}
                text={visits[activeVisitIndex]?.diagnosis?.text}
                canvasId={visits[activeVisitIndex]?.diagnosis?.canvas as string}
                title={t('ManageVisits.diagnosis')}
                onSave={async (diagnosis, canvasId) => {
                    console.log('ManageVisits', 'diagnosis', 'onChange', diagnosis, canvasId)

                    if (visits[activeVisitIndex].diagnosis)
                        visits[activeVisitIndex].diagnosis = { text: diagnosis, canvas: canvasId }

                    onChange([...visits])
                    setVisits([...visits])
                }}
            />
            <EditorModal
                open={showTreatments}
                onClose={() => {
                    setShowTreatments(false)
                }}
                text={visits[activeVisitIndex]?.treatments?.text}
                canvasId={visits[activeVisitIndex]?.treatments?.canvas as string}
                title={t('ManageVisits.treatments')}
                onSave={async (treatments, canvasId) => {
                    console.log('ManageVisits', 'treatments', 'onChange', treatments, canvasId)

                    if (visits[activeVisitIndex].treatments)
                        visits[activeVisitIndex].treatments = { text: treatments, canvas: canvasId }

                    onChange([...visits])
                    setVisits([...visits])
                }}
            />
            <Stack direction='column' alignItems={'center'} spacing={2} divider={<Divider orientation='horizontal' variant='middle' flexItem />} sx={{ width: '100%' }}>
                {
                    visits.map((v, i) =>
                        <Accordion key={i} defaultExpanded elevation={2} sx={{ width: '100%' }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography>
                                    {visits[i]?.due && fromUnixToFormat(locale, visits[i].due)}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack direction='column' alignItems={'center'} spacing={2} divider={<Divider orientation='horizontal' variant='middle' flexItem />} sx={{ width: '100%' }}>
                                    <DateTimeField
                                        onChange={(dateTime) => {
                                            const convertedDate = fromDateTimeParts({ ...locale, calendar: 'Gregorian', zone: 'UTC' }, locale, dateTime.date, dateTime.time);
                                            visits[i].due = DateTime.local(convertedDate.date.year, convertedDate.date.month, convertedDate.date.day, convertedDate.time.hour, convertedDate.time.minute, convertedDate.time.second, { zone: 'UTC' }).toUnixInteger();
                                            onChange([...visits])
                                            setVisits([...visits])
                                        }}
                                        defaultDate={fromUnix(locale, visits[i].due).date}
                                        defaultTime={fromUnix(locale, visits[i].due).time}
                                    />

                                    <Stack direction='row' alignItems='center' justifyContent='space-evenly' divider={<Divider orientation='horizontal' variant='middle' flexItem />} sx={{ width: '100%' }}>
                                        <Button variant='outlined' onClick={() => { setActiveVisitIndex(i); setShowDiagnosis(true) }}>
                                            {t('ManageVisits.diagnosis')}
                                        </Button>

                                        <Button variant='outlined' onClick={() => { setActiveVisitIndex(i); setShowTreatments(true) }}>
                                            {t('ManageVisits.treatments')}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    )
                }

                <Stack direction='row' spacing={1} divider={< Divider orientation='vertical' variant='middle' flexItem />} justifyContent={'center'} >
                    {
                        visits.length !== 0 &&
                        <IconButton
                            color="error"
                            onClick={() => {
                                visits.pop();
                                onChange([...visits])
                                setVisits([...visits])
                            }}
                        >
                            <Close />
                        </IconButton>
                    }
                    <IconButton
                        color="success"
                        onClick={() => {
                            visits.push(getDefaultVisit());
                            onChange([...visits])
                            setVisits([...visits]);
                        }}
                    >
                        <AddOutlined />
                    </IconButton >
                </Stack >
            </Stack >
        </>
    );
}
