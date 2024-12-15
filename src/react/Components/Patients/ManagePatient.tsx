import { styled } from '@mui/material/styles';
import { Grid, Button, Stack, TextField, Select, MenuItem, FormControl, Divider, DialogTitle, DialogContent, DialogContentText, DialogActions, Dialog, Typography, Modal, Slide, Paper } from '@mui/material';
import { useState, useContext, useEffect } from 'react';
import { DateTime } from 'luxon'

import { Patient } from '../../../Electron/Database/Models/Patient';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { ConfigurationContext } from '../../Contexts/Configuration/ConfigurationContext';
import { DateField } from '../DateTime/DateField';
import { ManageVisits } from '../Visits/ManageVisit';
import LoadingScreen from '../LoadingScreen';
import { t } from 'i18next';
import { RendererDbAPI } from '../../../Electron/Database/renderer';
import { RESULT_EVENT_NAME } from '../../Contexts/ResultWrapper';
import { publish } from '../../Lib/Events';
import { MedicalHistory } from './MedicalHistory';
import { EditorModal } from '../Editor/EditorModal';
import { DocumentManagement } from '../DocumentManagement';
import { toDateTime, toDateTimeView } from '../../Lib/DateTime/date-time-helpers';
import { MainProcessResponse } from 'src/Electron/types';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

async function getVisits(patientId?: string): Promise<Visit[] | undefined> {
    if (!patientId)
        return undefined

    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisitsByPatientId(patientId)
    console.log({ res })
    if (res.code !== 200)
        return undefined

    return res.data ?? []
}

export function ManagePatient({ open, onClose, inputPatient }: { open: boolean, onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void, inputPatient?: Patient }) {
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
            <Modal
                onClose={onClose}
                open={open}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={open ? 'up' : 'down'} in={open} timeout={250}>
                    <Paper sx={{ width: '80%', height: '90%', padding: '0.5rem 2rem', overflow: 'auto' }}>
                        {loading
                            ? <LoadingScreen />
                            : (
                                errorMessage !== undefined
                                    ? <Typography align='center'>{errorMessage}</Typography>
                                    :
                                    <>
                                        <Grid container spacing={2} columns={11}>
                                            <Grid item xs={11}>
                                                <Typography variant='h4'>
                                                    {inputPatient ? 'Update' : 'Register'} patient
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={5}>
                                                <Stack direction='column' spacing={1}>
                                                    {/* Social Id */}
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Typography variant='body1'>
                                                            {t('ManagePatient.socialId')}
                                                        </Typography>
                                                        <TextField variant='standard' onChange={(e) => {
                                                            const id = e.target.value
                                                            if (id.length !== 10)
                                                                setSocialIdError(true)
                                                            else
                                                                setSocialIdError(false)

                                                            setPatient({ ...patient, socialId: id })
                                                        }} id='socialId' value={patient?.socialId ?? ''} required sx={{ width: '7rem' }} error={socialIdError} helperText={socialIdError ? 'must have 10 digits' : ''} />
                                                    </Stack>
                                                    {/* First name */}
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Typography variant='body1'>
                                                            {t('ManagePatient.firstName')}
                                                        </Typography>
                                                        <TextField variant='standard' onChange={(e) => setPatient({ ...patient!, firstName: e.target.value })} id='firstName' value={patient?.firstName ?? ''} sx={{ width: '7rem' }} />
                                                    </Stack>

                                                    {/* Last name */}
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Typography variant='body1'>
                                                            {t('ManagePatient.lastName')}
                                                        </Typography>
                                                        <TextField variant='standard' onChange={(e) => setPatient({ ...patient!, lastName: e.target.value })} id='lastName' value={patient?.lastName ?? ''} sx={{ width: '7rem' }} />
                                                    </Stack>

                                                    {/* Address */}
                                                    <Button sx={{ width: 'fit-content' }} variant='outlined' onClick={() => setShowAddress(true)}>
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
                                                    <Button sx={{ width: 'fit-content' }} variant='outlined' onClick={() => setShowMedicalHistory(true)}>
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
                                            </Grid>

                                            <Grid item container xs={1} justifyContent='center'>
                                                <Divider orientation='vertical' variant='middle' />
                                            </Grid>

                                            <Grid item xs={5}>
                                                <Stack direction='column' spacing={1}>
                                                    {/* Phone Number */}
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Typography variant='body1'>
                                                            {t('ManagePatient.phoneNumber')}
                                                        </Typography>
                                                        <TextField variant='standard' value={patient?.phoneNumber ?? ''} sx={{ width: '7rem' }} />
                                                    </Stack>

                                                    {/* Age */}
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Typography variant='body1'>
                                                            {t('ManagePatient.age')}
                                                        </Typography>
                                                        <TextField variant='standard' value={patient?.age ?? ''} sx={{ width: '7rem' }} disabled />
                                                    </Stack>

                                                    {/* Birth Date */}
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Typography variant='body1'>
                                                            {t('ManagePatient.birthDate')}
                                                        </Typography>
                                                        <DateField
                                                            width='4rem'
                                                            onChange={(date) => {
                                                                const birthDate = toDateTimeView(toDateTime({ date, time: { hour: 0, minute: 0, second: 0 } }, { ...locale, calendar: 'Gregorian' }, locale))

                                                                const now = DateTime.local({ zone: locale.zone })

                                                                setPatient({
                                                                    ...patient!,
                                                                    age: now.year - birthDate.date.year,
                                                                    birthDate: DateTime.local(birthDate.date.year, birthDate.date.month, birthDate.date.day, { zone: locale.zone }).toUnixInteger(),
                                                                })
                                                            }}
                                                            defaultDate={patient?.birthDate ? toDateTimeView(toDateTime(patient?.birthDate, locale)).date : undefined} />
                                                    </Stack>

                                                    {/* Gender */}
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Typography variant='body1'>
                                                            {t('ManagePatient.gender')}
                                                        </Typography>
                                                        <FormControl variant='standard' >
                                                            <Select onChange={(e) => setPatient({ ...patient!, gender: e.target.value })} value={patient?.gender ?? ''} sx={{ width: '7rem' }} >
                                                                <MenuItem value='male'>male</MenuItem>
                                                                <MenuItem value='female'>female</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Stack>
                                                </Stack>
                                            </Grid>

                                            <Grid item xs={11}>
                                            </Grid>

                                            {/* Manage Visits */}
                                            <Grid item xs={11}>
                                                {patient && <ManageVisits patientId={patient._id! as string} onChange={(visits: Visit[]) => setVisits(visits)} defaultVisits={visits} />}
                                            </Grid>

                                            <Grid item xs={11}>
                                                {/* Submit */}
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    color='success'
                                                    onClick={() => {
                                                        setDialogTitle(`About to ${inputPatient ? 'update' : 'register'}...`)
                                                        setDialogContent('Are you sure?')
                                                        setDialogOpen(true)
                                                    }}>
                                                    {t('ManagePatient.done')}
                                                </Button>
                                            </Grid>
                                            <Grid item xs={11}>
                                            </Grid>
                                        </Grid>

                                        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} >
                                            <DialogTitle>
                                                {dialogTitle}
                                            </DialogTitle>
                                            <DialogContent>
                                                <DialogContentText>
                                                    {dialogContent}
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={() => setDialogOpen(false)}>No</Button>
                                                <Button onClick={() => { submit(); setDialogOpen(false) }}>Yes</Button>
                                            </DialogActions>
                                        </Dialog>
                                    </>
                            )}
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}
