import { useState, useContext, useEffect } from 'react';
import { DateTime } from 'luxon';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { DateTimeField } from '../Base/DateTime/DateTimeField';
import { t } from 'i18next';
import { EditorModal } from '../Base/Editor/EditorModal';
import { toDateTimeView, toFormat } from '../../Lib/DateTime/date-time-helpers';
import { Button } from '../../Components/Base/Button';
import { Separator } from '../../shadcn/components/ui/separator';
import { PlusIcon, XIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../shadcn/components/ui/accordion';

export function ManageVisits({ patientId, defaultVisits, onChange }: { patientId: string; defaultVisits?: Visit[]; onChange?: (visits: Visit[]) => void; }) {
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

    useEffect(() => {
        setVisits([...defaultVisits ?? []]);
    }, [defaultVisits])

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

                    if (visits[activeVisitIndex].diagnosis)
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

                    if (visits[activeVisitIndex].treatments)
                        visits[activeVisitIndex].treatments = { text: treatments, canvas: canvasId }

                    if (onChange)
                        onChange([...visits])
                    setVisits([...visits])
                }}
            />
            <div className='flex flex-col items-center space-x-2 space-y-2 w-full'>
                {
                    visits.map((v, i) =>
                        <>
                            <Accordion key={i} type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        <p>{visits[i]?.due && toFormat(visits[i].due, local)}</p>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className='flex flex-col items-center space-x-2 space-y-2 w-full'>
                                            <DateTimeField
                                                onChange={(dateTime) => {
                                                    const convertedDate = toDateTimeView({ date: dateTime.date, time: dateTime.time }, { ...local, calendar: 'Gregorian', zone: 'UTC' }, local);
                                                    visits[i].due = DateTime.local(convertedDate.date.year, convertedDate.date.month, convertedDate.date.day, convertedDate.time.hour, convertedDate.time.minute, convertedDate.time.second, { zone: 'UTC' }).toUnixInteger();

                                                    if (onChange)
                                                        onChange([...visits])
                                                    setVisits([...visits])
                                                }}
                                                defaultDate={toDateTimeView(visits[i].due, local).date}
                                                defaultTime={toDateTimeView(visits[i].due, local).time}
                                            />

                                            <Separator />

                                            <div className='flex flex-row items-center justify-evenly w-full'>
                                                <Button variant='outline' onClick={() => { setActiveVisitIndex(i); setShowDiagnosis(true) }}>
                                                    {t('ManageVisits.diagnosis')}
                                                </Button>

                                                <Separator />

                                                <Button variant='outline' onClick={() => { setActiveVisitIndex(i); setShowTreatments(true) }}>
                                                    {t('ManageVisits.treatments')}
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            {i < (visits.length - 1) && <Separator />}
                        </>
                    )
                }

                <div className='flex flex-row space-x-1 space-y-1 justify-center'>
                    {
                        visits.length !== 0 &&
                        <>
                            <Button
                                color="error"
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
                        color="success"
                        onClick={() => {
                            visits.push(getDefaultVisit());
                            if (onChange)
                                onChange([...visits])
                            setVisits([...visits]);
                        }}
                    >
                        <PlusIcon />
                    </Button >
                </div >
            </div >
        </>
    );
}
