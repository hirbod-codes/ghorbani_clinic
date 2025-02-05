import { useState } from 'react';

import { Patient } from '../../../Electron/Database/Models/Patient';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { t } from 'i18next';
import { RendererDbAPI } from '../../../Electron/Database/renderer';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';
import { publish } from '../../Lib/Events';
import { MainProcessResponse } from 'src/Electron/types';
import { Modal } from '../Base/Modal';
import { CircularLoadingIcon } from '../Base/CircularLoadingIcon';
import { Button } from '../Base/Button';
import { Stack } from '../Base/Stack';
import { ManagePatient } from './ManagePatient';

async function getVisits(patientId?: string): Promise<Visit[] | undefined> {
    if (!patientId)
        return undefined

    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisitsByPatientId(patientId)
    console.log({ res })
    if (res.code !== 200)
        return undefined

    return res.data ?? []
}

export function ManagePatientModal({ open, onClose, inputPatient }: { open: boolean, onClose?: () => void, inputPatient?: Patient }) {
    const [loading, setLoading] = useState<boolean>(false)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogTitle, setDialogTitle] = useState('')
    const [dialogAction, setDialogAction] = useState<CallableFunction>()
    const [dialogContent, setDialogContent] = useState('')

    console.log('ManagePatientModal', { loading, open, onClose, inputPatient })

    const submit = async (patient: Patient, visits: Visit[], files: { fileName: string, bytes: Buffer | Uint8Array }[]) => {
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
                :
                <Modal
                    open={open}
                    onClose={onClose}
                >
                    <ManagePatient
                        onDone={(p, v, f) => {
                            setDialogTitle(`About to ${inputPatient ? 'update' : 'register'}...`)
                            setDialogContent('Are you sure?')
                            setDialogAction(() => submit(p, v, f))
                            setDialogOpen(true)
                        }}
                    />
                </Modal>

            }

            <Modal
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            >
                <Stack direction='vertical'>
                    {dialogContent}
                    <Button onClick={() => setDialogOpen(false)}>No</Button>
                    <Button onClick={() => { if (dialogAction) dialogAction(); setDialogOpen(false); if (onClose) onClose() }}>Yes</Button>
                </Stack>
            </Modal>
        </>
    )
}
