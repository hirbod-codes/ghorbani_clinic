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
import { Separator } from '../../shadcn/components/ui/separator';
import { Select } from '../Base/Select';

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

    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
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

    console.log('ManagePatient', { socialIdError, errorMessage, loading, patient, visits, files, open, onClose, inputPatient })

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
            <Modal onClose={onClose} open={open}>
                <div className='w-[80%] h-[90%] px-2 py-8 overflow-auto'>
                    {loading
                        ? <CircularLoadingIcon />
                        : (
                            errorMessage !== undefined
                                ? <p className='text-center'>{errorMessage}</p>
                                :
                                <>
                                    <div className='grid-cols-11 space-x-1 space-y-1'>
                                        <div className='sm:col-span-11'>
                                            <h4>{inputPatient ? 'Update' : 'Register'}{t('ManagePatient.Patient')}</h4>
                                        </div>

                                        <div className='sm:col-span-5'>
                                            <div className='flex flex-col space-x-1 space-y-1'>
                                                {/* Social Id */}
                                                <div className='flex flex-row justify-between items-center'>
                                                    <p>{t('ManagePatient.socialId')}</p>
                                                    <Input
                                                        className='w-[7rem]'
                                                        onChange={(e) => {
                                                            const id = e.target.value
                                                            if (id.length !== 10)
                                                                setSocialIdError(true)
                                                            else
                                                                setSocialIdError(false)

                                                            setPatient({ ...patient, socialId: id })
                                                        }} id='socialId' value={patient?.socialId ?? ''}
                                                        required
                                                    // error={socialIdError}
                                                    // helperText={socialIdError ? 'must have 10 digits' : ''}
                                                    />
                                                </div>
                                                {/* First name */}
                                                <div className='flex flex-row justify-between items-center'>
                                                    <p>
                                                        {t('ManagePatient.firstName')}
                                                    </p>
                                                    <Input className='w-[7rem]' onChange={(e) => setPatient({ ...patient!, firstName: e.target.value })} id='firstName' value={patient?.firstName ?? ''} />
                                                </div>

                                                {/* Last name */}
                                                <div className='flex flex-row justify-between items-center'>
                                                    <p>
                                                        {t('ManagePatient.lastName')}
                                                    </p>
                                                    <Input onChange={(e) => setPatient({ ...patient!, lastName: e.target.value })} id='lastName' value={patient?.lastName ?? ''} />
                                                </div>

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
                                            </div>
                                        </div>

                                        <div className='sm:col-span-1 justify-center'>
                                            <Separator />
                                        </div>

                                        <div className='sm:col-span-5'>
                                            <div className='flex flex-col space-x-1 space-y-1'>
                                                {/* Phone Number */}
                                                <div className='flex flex-row justify-between items-center'>
                                                    <p>
                                                        {t('ManagePatient.phoneNumber')}
                                                    </p>
                                                    <Input className='w=[7rem]' value={patient?.phoneNumber ?? ''} />
                                                </div>

                                                {/* Age */}
                                                <div className='flex flex-row justify-between items-center'>
                                                    <p>
                                                        {t('ManagePatient.age')}
                                                    </p>
                                                    <Input className='w=[7rem]' value={patient?.age ?? ''} disabled />
                                                </div>

                                                {/* Birth Date */}
                                                <div className='flex flex-row justify-between items-center'>
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
                                                        defaultDate={patient?.birthDate ? toDateTimeView(patient?.birthDate, locale).date : undefined} />
                                                </div>

                                                {/* Gender */}
                                                <div className='flex flex-row justify-between items-center'>
                                                    <p>
                                                        {t('ManagePatient.gender')}
                                                    </p>
                                                    <Select
                                                        selectOptions={{ type: 'items', items: [{ displayValue: t('ManagePatient.male'), value: 'male' }, { displayValue: t('ManagePatient.female'), value: 'female' }] }}
                                                        onValueChange={(value) => setPatient({ ...patient!, gender: value })} value={patient?.gender ?? ''}
                                                        triggerProps={{ className: 'w-[7rem]' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className='sm:col-span-11' />

                                        {/* Manage Visits */}
                                        <div className='sm:col-span-11'>
                                            {patient && <ManageVisits patientId={patient._id! as string} onChange={(visits: Visit[]) => setVisits(visits)} defaultVisits={visits} />}
                                        </div>

                                        <div className='sm:col-span-11'>
                                            {/* Submit */}
                                            <Button
                                                className='w-full'
                                                color='success'
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
                                    </div>

                                    <Modal
                                        open={dialogOpen}
                                        onClose={() => setDialogOpen(false)}
                                        title={dialogTitle}
                                        footer={<>
                                            <Button onClick={() => setDialogOpen(false)}>No</Button>
                                            <Button onClick={() => { submit(); setDialogOpen(false) }}>Yes</Button>
                                        </>}
                                    >
                                        {dialogContent}
                                    </Modal>
                                </>
                        )}
                </div>
            </Modal >
        </>
    )
}
