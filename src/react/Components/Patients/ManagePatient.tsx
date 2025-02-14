import { useState, useContext, useEffect, memo } from 'react';
import { DateTime } from 'luxon'

import { Patient } from '../../../Electron/Database/Models/Patient';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { DateField } from '../Base/DateTime/DateField';
import { ManageVisits } from '../Visits/ManageVisit';
import { t } from 'i18next';
import { RendererDbAPI } from '../../../Electron/Database/renderer';
import { MedicalHistory } from './MedicalHistory';
import { EditorModal } from '../Base/Editor/EditorModal';
import { DocumentManagement } from '../DocumentManagement';
import { toDateTimeView } from '../../Lib/DateTime/date-time-helpers';
import { Modal } from '../Base/Modal';
import { Input } from '../Base/Input';
import { Button } from '../Base/Button';
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

export const ManagePatient = memo(function ManagePatient({ inputPatient, onDone }: { onDone?: (patient: Patient, visits: Visit[], files: { fileName: string, bytes: Buffer | Uint8Array }[]) => void, inputPatient?: Patient }) {
    const locale = useContext(ConfigurationContext)!.local

    const [socialIdError, setSocialIdError] = useState<boolean>(false)

    const [showMedicalHistory, setShowMedicalHistory] = useState<boolean>(false)
    const [showAddress, setShowAddress] = useState<boolean>(false)

    const [patient, setPatient] = useState<Patient | undefined>(inputPatient)
    const [visits, setVisits] = useState<Visit[]>([])

    const [files, setFiles] = useState<{ fileName: string, bytes: Buffer | Uint8Array }[]>([])
    const [showFiles, setShowFiles] = useState<boolean>(false)

    console.log('ManagePatient', { socialIdError, patient, visits, files, inputPatient })

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

    return (
        <div className='grid grid-cols-11 space-x-1 space-y-1 w-full'>
            <div className='col-span-full text-lg py-4'>
                {inputPatient ? t('ManagePatient.UpdatePatient') : t('ManagePatient.RegisterPatient')}
            </div>

            <Stack direction='vertical' stackProps={{ className: 'lg:col-span-5 col-span-full' }}>
                {/* Social Id */}
                <Input
                    label={t('ManagePatient.socialId')}
                    labelId={t('ManagePatient.socialId')}
                    className='w-[7rem]'
                    containerProps={{ className: 'w-full' }}
                    labelContainerProps={{ stackProps: { className: 'justify-between' } }}
                    onChange={(e) => {
                        const id = e.target.value
                        if (id.length > 10)
                            return

                        if (id.length !== 10 && id.length !== 0)
                            setSocialIdError(true)
                        else
                            setSocialIdError(false)

                        setPatient({ ...patient, socialId: id })
                    }}
                    id='socialId'
                    value={patient?.socialId ?? ''}
                    required
                    animateHeight
                    errorText={socialIdError ? 'must have 10 digits' : undefined}
                    helperText={!patient?.socialId || patient?.socialId.trim() === '' ? 'required' : undefined}
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
                    onDone={(mh) => {
                        setPatient({ ...patient!, medicalHistory: mh });
                        setShowMedicalHistory(false)
                    }}
                />

                {/* Files */}
                <Button className='w-fit' variant='outline' onClick={() => setShowFiles(true)}>{t('ManagePatient.Documents')}</Button>
                {patient && patient._id &&
                    <Modal open={showFiles} onClose={() => setShowFiles(false)}>
                        <DocumentManagement patientId={patient._id as string} />
                    </Modal>
                }
            </Stack>

            <div className='lg:col-span-1 invisible lg:visible flex flex-row justify-center '>
                <Separator orientation='vertical' />
            </div>

            <Stack direction='vertical' stackProps={{ className: 'lg:col-span-5 col-span-full' }}>
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
                        id='birthDate'
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
                        id='gender'
                        onValueChange={(value) => setPatient({ ...patient!, gender: value })}
                        defaultValue={patient?.gender ?? ''}
                        inputProps={{ className: 'w-[7rem]' }}
                    >
                        <Select.Item value='male' >{t('ManagePatient.male')}</Select.Item>
                        <Select.Item value='female' >{t('ManagePatient.female')}</Select.Item>
                    </Select>
                </Stack>
            </Stack>

            <div className='col-span-full py-2' />

            <div className='col-span-full text-md w-full text-center border-b'>
                {t('ManagePatient.visits')}
            </div>

            {/* Manage Visits */}
            <div className='col-span-full'>
                <ManageVisits patientId={patient?._id as string | undefined} onChange={(visits: Visit[]) => setVisits(visits)} defaultVisits={visits} />
            </div>

            <div className='col-span-full'>
                {/* Submit */}
                <Button
                    className='w-full'
                    fgColor='success-foreground'
                    bgColor='success'
                    onClick={() => {
                        if (onDone && patient)
                            onDone(patient, visits, files)
                    }}>
                    {t('ManagePatient.done')}
                </Button>
            </div>
        </div>
    )
})
