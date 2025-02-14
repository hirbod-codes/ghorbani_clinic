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

export function ManagePatientModal({ open, onClose, inputPatient }: { open: boolean, onClose?: () => void, inputPatient?: Patient }) {
    const [loading, setLoading] = useState<boolean>(false)

    console.log('ManagePatientModal', { loading, open, onClose, inputPatient })

    const submit = async (patient: Patient, visits: Visit[], files: { fileName: string, bytes: Buffer | Uint8Array }[]) => {
        let id: string | undefined = undefined, response: MainProcessResponse<boolean> | undefined = undefined

        try {
            if (inputPatient) {
                id = patient!._id!.toString()
                const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.updatePatient(patient!);
                console.log('updatePatient', { res })
                if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.matchedCount !== 1 || res.data.modifiedCount !== 1)
                    throw new Error(t('ManagePatient.failedToUpdatePatient'))
                for (const visit of visits) {
                    const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.updateVisit(visit);
                    console.log('updateVisit', { res })
                    if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.matchedCount !== 1 || res.data.modifiedCount !== 1)
                        throw new Error(t('ManagePatient.failedToUpdatePatientVisits'))
                }
            }
            else {
                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createPatient(patient!)
                console.log('createPatient', { res })
                if (res.code !== 200 || !res.data || res.data.acknowledged !== true || res.data.insertedId.toString() === '')
                    throw new Error(t('ManagePatient.failedToRegisterPatient'))

                id = res.data.insertedId.toString()

                for (const visit of visits) {
                    visit.patientId = id
                    if (visit._id) {
                        const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.updateVisit(visit);
                        console.log('updateVisit', { res })
                        if (res.code !== 200 || !res.data || !res.data.acknowledged)
                            throw new Error(t('ManagePatient.failedToRegisterPatientVisits'))
                    }
                    else {
                        const res = await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.createVisit(visit);
                        console.log('createVisit', { res })
                        if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.insertedId.toString() === '')
                            throw new Error(t('ManagePatient.failedToRegisterPatientVisits'))
                    }
                }
            }

            response = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadFiles(id as string, files)
            console.log('uploadFiles', { response })
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
                    useResponsiveContainer={false}
                    modalContainerProps={{ className: 'w-5/6' }}
                >
                    <ManagePatient
                        onDone={(p, v, f) => {
                            submit(p, v, f)
                        }}
                    />
                </Modal>
            }
        </>
    )
}
