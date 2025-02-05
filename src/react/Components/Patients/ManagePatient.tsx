import { useState, useContext, useEffect } from 'react';
import { DateTime } from 'luxon'

import { Patient } from '../../../Electron/Database/Models/Patient';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { DateField } from '../Base/DateTime/DateField';
import { ManageVisits } from '../Visits/ManageVisit';
import { t } from 'i18next';
import { RendererDbAPI } from '../../../Electron/Database/renderer';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';
import { publish } from '../../Lib/Events';
import { MedicalHistory } from './MedicalHistory';
import { EditorModal } from '../Base/Editor/EditorModal';
import { DocumentManagement } from '../DocumentManagement';
import { toDateTime, toDateTimeView } from '../../Lib/DateTime/date-time-helpers';
import { MainProcessResponse } from 'src/Electron/types';
import { Modal } from '../Base/Modal';
import { CircularLoadingIcon } from '../Base/CircularLoadingIcon';
import { Input } from '../Base/Input';
import { Button } from '../../Components/Base/Button';
import { Select } from '../Base/Select';
import { Stack } from '../Base/Stack';
import { Separator } from '../../shadcn/components/ui/separator';

async function getVisits(patientId?: string): Promise<Visit[] | undefined> {
    if (!patientId)
        return undefined

    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisitsByPatientId(patientId)
    console.log({ res })
    if (res.code !== 200)
        return undefined

    return res.data ?? []
}

export function ManagePatient({ open, onClose, inputPatient }: { open: boolean, onClose?: () => void, inputPatient?: Patient }) {
    const locale = useContext(ConfigurationContext)!.local

    const [socialIdError, setSocialIdError] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(false)
    const [showMedicalHistory, setShowMedicalHistory] = useState<boolean>(false)
    const [showAddress, setShowAddress] = useState<boolean>(false)

    const [patient, setPatient] = useState<Patient | undefined>(inputPatient)
    const [visits, setVisits] = useState<Visit[]>([])

    const [files, setFiles] = useState<{ fileName: string, bytes: Buffer | Uint8Array }[]>([])
    const [showFiles, setShowFiles] = useState<boolean>(false)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogTitle, setDialogTitle] = useState('')
    const [dialogContent, setDialogContent] = useState('')

    console.log('ManagePatient', { socialIdError, loading, patient, visits, files, open, onClose, inputPatient })

    const init = async () => {
        if (!inputPatient)
            return

        setPatient(inputPatient)
        const v = await getVisits(inputPatient?._id as string)

        if (!v)
            return

        setVisits(v)
    }

    useEffect(() => {
        init()
    }, [inputPatient])

    const submit = async () => {
        let id: string | undefined = undefined, response: MainProcessResponse<boolean> | undefined = undefined

        try {
            if (inputPatient) {
                id = patient!._id!.toString()
                const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.updatePatient(patient!);
                if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.matchedCount !== 1 || res.data.modifiedCount !== 1)
                    throw new Error(t('ManagePatient.failedToUpdatePatient'))
                for (const visit of visits) {
                    const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.updateVisit(visit);
                    if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.matchedCount !== 1 || res.data.modifiedCount !== 1)
                        throw new Error(t('ManagePatient.failedToUpdatePatientVisits'))
                }
            }
            else {
                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createPatient(patient!)
                if (res.code !== 200 || !res.data || res.data.acknowledged !== true || res.data.insertedId.toString() === '')
                    throw new Error(t('ManagePatient.failedToRegisterPatient'))

                id = res.data.insertedId.toString()

                for (const visit of visits) {
                    visit.patientId = id
                    if (visit._id) {
                        const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.updateVisit(visit);
                        if (res.code !== 200 || !res.data || !res.data.acknowledged)
                            throw new Error(t('ManagePatient.failedToRegisterPatientVisits'))
                    }
                    else {
                        const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.createVisit(visit);
                        if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.insertedId.toString() === '')
                            throw new Error(t('ManagePatient.failedToRegisterPatientVisits'))
                    }
                }
            }

            response = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadFiles(id as string, files)
            if (response.code !== 200 || response.data !== true)
                throw new Error(t('ManagePatient.failedToUploadPatientsDocuments'))
        } catch (error) {
            console.error(error)
        } finally {
            if (!response || response.data !== true) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('ManagePatient.failedToRegisteredPatient')
                })
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('ManagePatient.successfullyRegisteredPatient')
            })
        }
    }

    return (
        <>
            {loading
                ? <CircularLoadingIcon />
                : <div className='grid grid-cols-11 space-x-1 space-y-1 size-full'>
                    <div className='col-span-full'>
                        <h4>{inputPatient ? t('ManagePatient.UpdatePatient') : t('ManagePatient.RegisterPatient')}</h4>
                    </div>

                    <Stack direction='vertical' stackProps={{ className: 'sm:col-span-5 col-span-full' }}>
                        {/* Social Id */}
                        <Input
                            label={t('ManagePatient.socialId')}
                            labelId={t('ManagePatient.socialId')}
                            className='w-[7rem]'
                            containerProps={{ className: 'w-full' }}
                            labelContainerProps={{ stackProps: { className: 'justify-between' } }}
                            onChange={(e) => {
                                const id = e.target.value
                                if (id.length !== 10)
                                    setSocialIdError(true)
                                else
                                    setSocialIdError(false)

                                setPatient({ ...patient, socialId: id })
                            }}
                            id='socialId'
                            value={patient?.socialId ?? ''}
                            required
                        // error={socialIdError}
                        // helperText={socialIdError ? 'must have 10 digits' : ''}
                        />
                        {/* First name */}
                        <Input
                            label={t('ManagePatient.firstName')}
                            labelId={t('ManagePatient.firstName')}
                            className='w-[7rem]'
                            containerProps={{ className: 'w-full' }}
                            labelContainerProps={{ stackProps: { className: 'justify-between' } }}
                            onChange={(e) => setPatient({ ...patient!, firstName: e.target.value })}
                            id='firstName'
                            value={patient?.firstName ?? ''}
                        />

                        {/* Last name */}
                        <Input
                            label={t('ManagePatient.lastName')}
                            labelId={t('ManagePatient.lastName')}
                            className='w-[7rem]'
                            containerProps={{ className: 'w-full' }}
                            labelContainerProps={{ stackProps: { className: 'justify-between' } }}
                            onChange={(e) => setPatient({ ...patient!, lastName: e.target.value })}
                            id='lastName'
                            value={patient?.lastName ?? ''}
                        />

                        {/* Address */}
                        <Button className='w-fit' variant='outline' onClick={() => setShowAddress(true)}>
                            {t('ManagePatient.address')}
                        </Button>
                        <EditorModal
                            open={showAddress}
                            onClose={() => setShowAddress(false)}
                            text={patient?.address?.text}
                            canvasId={patient?.address?.canvas as string}
                            onSave={(address, canvasId) => setPatient({ ...patient!, address: { text: address, canvas: canvasId } })}
                            title={t('ManagePatient.address')}
                        />

                        {/* Medical History */}
                        <Button className='w-fit' variant='outline' onClick={() => setShowMedicalHistory(true)}>
                            {t('ManagePatient.medicalHistory')}
                        </Button>
                        <MedicalHistory
                            open={showMedicalHistory}
                            onClose={() => setShowMedicalHistory(false)}
                            inputMedicalHistory={patient?.medicalHistory}
                            onSave={(mh) => {
                                setPatient({ ...patient!, medicalHistory: mh });
                                setShowMedicalHistory(false)
                            }}
                        />

                        {/* Files */}
                        <Button onClick={() => setShowFiles(true)}>Documents</Button>
                        {patient && patient._id &&
                            <Modal open={showFiles} onClose={() => setShowFiles(false)}>
                                <DocumentManagement patientId={patient._id as string} />
                            </Modal>
                        }
                    </Stack>

                    <div className='sm:col-span-1 invisible sm:visible justify-center'>
                        <div className="flex flex-row justify-center size-full">
                            <Separator orientation='vertical' />
                        </div>
                    </div>

                    <Stack direction='vertical' stackProps={{ className: 'sm:col-span-5 col-span-full' }}>
                        {/* Phone Number */}
                        <Input
                            label={t('ManagePatient.phoneNumber')}
                            labelId={t('ManagePatient.phoneNumber')}
                            className='w-[7rem]'
                            containerProps={{ className: 'w-full' }}
                            labelContainerProps={{ stackProps: { className: 'justify-between' } }}
                            value={patient?.phoneNumber ?? ''}
                            onChange={(e) => { if ((e.target.value.trim().match(/\D+/)?.length ?? 0) <= 0) setPatient({ ...patient!, phoneNumber: e.target.value }) }}
                        />

                        {/* Age */}
                        <Input
                            label={t('ManagePatient.age')}
                            labelId={t('ManagePatient.age')}
                            className='w-[7rem]'
                            containerProps={{ className: 'w-full' }}
                            labelContainerProps={{ stackProps: { className: 'justify-between' } }}
                            value={patient?.age ?? ''}
                            readOnly
                            disabled
                        />

                        {/* Birth Date */}
                        <Stack stackProps={{ className: 'justify-between items-center m-0' }}>
                            <p>
                                {t('ManagePatient.birthDate')}
                            </p>
                            <DateField
                                width='4rem'
                                onChange={(date) => {
                                    const birthDate = toDateTimeView({ date, time: { hour: 0, minute: 0, second: 0 } }, { ...locale, calendar: 'Gregorian' }, locale)

                                    const now = DateTime.local({ zone: locale.zone })

                                    setPatient({
                                        ...patient!,
                                        age: now.year - birthDate.date.year,
                                        birthDate: DateTime.local(birthDate.date.year, birthDate.date.month, birthDate.date.day, { zone: locale.zone }).toUnixInteger(),
                                    })
                                }}
                                defaultDate={patient?.birthDate ? toDateTimeView(patient?.birthDate, locale).date : undefined}
                            />
                        </Stack>

                        {/* Gender */}
                        <Stack stackProps={{ className: 'justify-between items-center m-0' }}>
                            <p>
                                {t('ManagePatient.gender')}
                            </p>
                            <Select
                                onValueChange={(value) => setPatient({ ...patient!, gender: value })}
                                defaultValue={patient?.gender ?? ''}
                                inputProps={{ className: 'w-[7rem]' }}
                            >
                                <Select.Item value='male' >{t('ManagePatient.male')}</Select.Item>
                                <Select.Item value='female' >{t('ManagePatient.female')}</Select.Item>
                            </Select>
                        </Stack>
                    </Stack>

                    <div className='col-span-full' />

                    {/* Manage Visits */}
                    <div className='col-span-full'>
                        {patient && <ManageVisits patientId={patient._id! as string} onChange={(visits: Visit[]) => setVisits(visits)} defaultVisits={visits} />}
                    </div>

                    <div className='col-span-full'>
                        {/* Submit */}
                        <Button
                            className='w-full'
                            fgColor='success'
                            onClick={() => {
                                setDialogTitle(`About to ${inputPatient ? 'update' : 'register'}...`)
                                setDialogContent('Are you sure?')
                                setDialogOpen(true)
                            }}>
                            {t('ManagePatient.done')}
                        </Button>
                    </div>
                    <div className='sm:col-span-11'>
                    </div>
                </div >
            }

            <Modal
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            >
                <Stack direction='vertical'>
                    {dialogContent}
                    <Button onClick={() => setDialogOpen(false)}>No</Button>
                    <Button onClick={() => { submit(); setDialogOpen(false) }}>Yes</Button>
                </Stack>
            </Modal>
        </>
    )
}
