import { useState, useContext, useEffect, memo } from 'react';
import { DateTime } from 'luxon';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { t } from 'i18next';
import { EditorModal } from '../Base/Editor/EditorModal';
import { toDateTimeView, toFormat } from '../../Lib/DateTime/date-time-helpers';
import { Button } from '../../Components/Base/Button';
import { Separator } from '../../shadcn/components/ui/separator';
import { PlusIcon, XIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../shadcn/components/ui/accordion';
import { Stack } from '../Base/Stack';
import { DateField } from '../Base/DateTime/DateField';
import { Date, Time } from '../../Lib/DateTime';
import { TimeField } from '../Base/DateTime/TimeField';

export const ManageVisits = memo(function ManageVisits({ patientId = '', defaultVisits, onChange }: { patientId?: string; defaultVisits?: Visit[]; onChange?: (visits: Visit[]) => void; }) {
    const local = useContext(ConfigurationContext)!.local;

    const getDefaultVisit = (): Visit => {
        return {
            schemaVersion: 'v0.0.1',
            patientId: patientId,
            due: DateTime.local({ zone: local.zone }).toUnixInteger(),
            createdAt: DateTime.local({ zone: local.zone }).toUnixInteger(),
            updatedAt: DateTime.local({ zone: local.zone }).toUnixInteger(),
        }
    }

    const [showDiagnosis, setShowDiagnosis] = useState<boolean>(false)
    const [showTreatments, setShowTreatments] = useState<boolean>(false)
    const [activeVisitIndex, setActiveVisitIndex] = useState<number | undefined>(undefined);
    const [visits, setVisits] = useState<Visit[]>([]);

    const [visitsDates, setVisitsDates] = useState<Date[]>([]);
    const [visitsTimes, setVisitsTimes] = useState<Time[]>([]);

    useEffect(() => {
        setVisits([...defaultVisits ?? []]);
    }, [defaultVisits])

    console.log('ManageVisits', { showDiagnosis, showTreatments, activeVisitIndex, visits, visitsDates, visitsTimes, patientId, defaultVisits })

    return (
        <>
            <EditorModal
                open={showDiagnosis}
                onClose={() => {
                    setShowDiagnosis(false)
                }}
                text={activeVisitIndex !== undefined ? visits[activeVisitIndex]?.diagnosis?.text : ''}
                canvasId={activeVisitIndex !== undefined ? visits[activeVisitIndex]?.diagnosis?.canvas as string : ''}
                title={t('ManageVisits.diagnosis')}
                onSave={async (diagnosis, canvasId) => {
                    if (activeVisitIndex === undefined)
                        return

                    console.log('ManageVisits', 'diagnosis', 'onChange', diagnosis, canvasId)

                    if (visits[activeVisitIndex])
                        visits[activeVisitIndex].diagnosis = { text: diagnosis, canvas: canvasId }

                    if (onChange)
                        onChange([...visits])
                    setVisits([...visits])
                }}
            />
            <EditorModal
                open={showTreatments}
                onClose={() => {
                    setShowTreatments(false)
                }}
                text={activeVisitIndex !== undefined ? visits[activeVisitIndex]?.treatments?.text : ''}
                canvasId={activeVisitIndex !== undefined ? visits[activeVisitIndex]?.treatments?.canvas as string : ''}
                title={t('ManageVisits.treatments')}
                onSave={async (treatments, canvasId) => {
                    if (activeVisitIndex === undefined)
                        return

                    console.log('ManageVisits', 'treatments', 'onChange', treatments, canvasId)

                    if (visits[activeVisitIndex])
                        visits[activeVisitIndex].treatments = { text: treatments, canvas: canvasId }

                    if (onChange)
                        onChange([...visits])
                    setVisits([...visits])
                }}
            />

            <Stack direction='vertical' stackProps={{ className: 'w-full' }}>
                {
                    visits.map((v, i) =>
                        <Accordion key={i} type="single" collapsible>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>
                                    <p>{visits[i]?.due && toFormat(visits[i].due, local)}</p>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Stack direction='vertical' stackProps={{ className: 'items-center w-full' }}>
                                        <Stack stackProps={{ className: 'justify-between items-center m-0 w-full' }}>
                                            <p>
                                                {t('ManageVisits.date')}
                                            </p>
                                            <DateField
                                                width='4rem'
                                                defaultDate={toDateTimeView(visits[i].due, local).date}
                                                onChange={(date) => {
                                                    visitsDates[i] = date
                                                    setVisitsDates([...visitsDates])

                                                    if (visitsTimes[i] === undefined)
                                                        return

                                                    const dateTime = { date: visitsDates[i], time: visitsTimes[i] }

                                                    const convertedDate = toDateTimeView({ date: dateTime.date, time: dateTime.time }, { ...local, calendar: 'Gregorian', zone: 'UTC' }, local);
                                                    visits[i].due = DateTime.local(convertedDate.date.year, convertedDate.date.month, convertedDate.date.day, convertedDate.time.hour, convertedDate.time.minute, convertedDate.time.second, { zone: 'UTC' }).toUnixInteger();

                                                    setVisits([...visits])
                                                    if (onChange)
                                                        onChange([...visits])
                                                }}
                                            />
                                        </Stack>

                                        <Stack stackProps={{ className: 'justify-between items-center m-0 w-full' }}>
                                            <p>
                                                {t('ManageVisits.time')}
                                            </p>
                                            <TimeField
                                                inputProps={{ className: 'w-[7rem]' }}
                                                defaultTime={toDateTimeView(visits[i].due, local).time}
                                                onChange={(time) => {
                                                    visitsTimes[i] = time
                                                    setVisitsTimes([...visitsTimes])

                                                    if (visitsDates[i] === undefined)
                                                        return

                                                    const dateTime = { date: visitsDates[i], time: visitsTimes[i] }

                                                    const convertedDate = toDateTimeView({ date: dateTime.date, time: dateTime.time }, { ...local, calendar: 'Gregorian', zone: 'UTC' }, local);
                                                    visits[i].due = DateTime.local(convertedDate.date.year, convertedDate.date.month, convertedDate.date.day, convertedDate.time.hour, convertedDate.time.minute, convertedDate.time.second, { zone: 'UTC' }).toUnixInteger();

                                                    setVisits([...visits])
                                                    if (onChange)
                                                        onChange([...visits])
                                                }}
                                            />
                                        </Stack>

                                        <Stack stackProps={{ className: 'items-center justify-evenly w-full' }}>
                                            <Button variant='outline' onClick={() => { setActiveVisitIndex(i); setShowDiagnosis(true) }}>
                                                {t('ManageVisits.diagnosis')}
                                            </Button>

                                            <Separator orientation='vertical' />

                                            <Button variant='outline' onClick={() => { setActiveVisitIndex(i); setShowTreatments(true) }}>
                                                {t('ManageVisits.treatments')}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )
                }

                <Stack stackProps={{ className: 'justify-center' }}>
                    {
                        visits.length !== 0 &&
                        <>
                            <Button
                                variant='outline'
                                isIcon={true}
                                size='sm'
                                fgColor="error"
                                onClick={() => {
                                    visits.pop();
                                    if (onChange)
                                        onChange([...visits])
                                    setVisits([...visits])
                                }}
                            >
                                <XIcon />
                            </Button>
                            <Separator orientation='vertical' />
                        </>
                    }
                    <Button
                        variant='outline'
                        isIcon={true}
                        size='sm'
                        fgColor="success"
                        onClick={() => {
                            visits.push(getDefaultVisit());
                            if (onChange)
                                onChange([...visits])
                            setVisits([...visits]);
                        }}
                    >
                        <PlusIcon />
                    </Button >
                </Stack>
            </Stack>
        </>
    );
})
