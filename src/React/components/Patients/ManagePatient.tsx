import { styled } from '@mui/material/styles';
import { Grid, Modal, Paper, Button, Stack, TextField, Select, MenuItem, InputLabel, FormControl, Divider, Slide, DialogTitle, DialogContent, DialogContentText, DialogActions, Dialog, Snackbar, Alert, AlertColor, AlertPropsColorOverrides, CircularProgress } from '@mui/material';
import type { OverridableStringUnion } from '@mui/types/index'
import { useState, useContext, ReactNode } from 'react';
import type { dbAPI } from '../../../Electron/Database/dbAPI';
import { DateTime } from 'luxon'

import AddIcon from '@mui/icons-material/AddOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { fromDateTimeParts, fromUnix } from '../DateTime/date-time-helpers';
import { ConfigurationContext } from '../../ConfigurationContext';
import { Patient } from '../../../Electron/Database/Models/Patient';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { DateField } from '../DateTime/DateField';
import { ManageVisits } from '../Visits/ManageVisits';

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

async function getVisits(patientId: string): Promise<Visit[]> {
    const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.getVisits(patientId)
    return JSON.parse(result)
}

export function ManagePatient({ inputPatient }: { inputPatient?: Patient | null | undefined }) {
    const locale = useContext(ConfigurationContext).get.locale

    const [socialIdError, setSocialIdError] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(true)

    const [patient, setPatient] = useState<Patient>()
    const [visits, setVisits] = useState<Visit[]>([])

    if (!patient && !inputPatient) {
        setPatient({
            schemaVersion: 'v0.0.1',
            createdAt: DateTime.local({ zone: locale.zone }).toUnixInteger(),
            updatedAt: DateTime.local({ zone: locale.zone }).toUnixInteger(),
        })
        setLoading(false)
    }
    else if (!patient && inputPatient) {
        setPatient(inputPatient)
        if (inputPatient.birthDate)
            getVisits(inputPatient._id as string).then((v) => {
                setLoading(false)
                setVisits(v)
            })
    }

    const [openVisitCreateModal, setOpenVisitCreateModal] = useState(false)

    const [files, setFiles] = useState<{ fileName: string, bytes: Buffer | Uint8Array }[]>([])

    const submit = async () => {
        let id = undefined, result = undefined

        try {
            if (inputPatient) {
                id = patient._id
                if (!await (window as typeof window & { dbAPI: dbAPI }).dbAPI.updatePatient(patient))
                    throw new Error('failed to update the patient.')
                for (const visit of visits)
                    if (!await (window as typeof window & { dbAPI: dbAPI }).dbAPI.updateVisit(visit))
                        throw new Error('failed to update the patient\'s visits.')
            }
            else {
                id = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.createPatient(patient)
                for (const visit of visits) {
                    visit.patientId = id
                    if (!await (window as typeof window & { dbAPI: dbAPI }).dbAPI.createVisit(visit))
                        throw new Error('failed to create the patient\'s visits.')
                }
            }

            result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.uploadFiles(id as string, files)
            if (!result)
                throw new Error('failed to upload the patient\'s documents.')
        } catch (error) {
            console.error(error)
        } finally {
            if (result !== true) {
                setSnackbarSeverity('error')
                setSnackbarMessage('failed to register the patient.')
                setOpenSnackbar(true)
            }

            setSnackbarSeverity('success')
            setSnackbarMessage('The patient was successfully registered.')
            setOpenSnackbar(true)
        }
    }

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogTitle, setDialogTitle] = useState('')
    const [dialogContent, setDialogContent] = useState('')

    const [openSnackbar, setOpenSnackbar] = useState(true)
    const [snackbarSeverity, setSnackbarSeverity] = useState<OverridableStringUnion<AlertColor, AlertPropsColorOverrides>>('info')
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarAction] = useState<ReactNode | null>(null)

    if (loading)
        return (
            <Stack direction='row' justifyContent={'center'} sx={{ height: '100%', width: '100%', p: 3 }}>
                <CircularProgress />
            </Stack>
        )

    return (
        <>
            <Stack justifyContent={'space-around'} sx={{ height: '100%', width: '100%' }}>
                <h1>Register patient</h1>
                <Grid container spacing={2} >
                    <Grid item>
                        {/* First name */}
                        <TextField variant='standard' onChange={(e) => setPatient({ ...patient, firstName: e.target.value })} id='firstName' value={patient.firstName ?? ''} label='First name' sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item>
                        {/* Last name */}
                        <TextField variant='standard' onChange={(e) => setPatient({ ...patient, lastName: e.target.value })} id='lastName' value={patient.lastName ?? ''} label='Last name' sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item>
                        {/* Social Id */}
                        <TextField variant='standard' onChange={(e) => {
                            const id = e.target.value
                            if (id.length !== 10)
                                setSocialIdError(true)
                            else
                                setSocialIdError(false)

                            setPatient({ ...patient, socialId: id })
                        }} id='socialId' value={patient.socialId ?? ''} label='Social Id' required sx={{ width: '7rem' }} error={socialIdError} helperText={socialIdError ? 'must have 10 digits' : ''} />
                    </Grid>
                    <Grid item>
                        {/* Gender */}
                        <FormControl variant='standard' >
                            <InputLabel id="gender-label">Gender</InputLabel>
                            <Select onChange={(e) => setPatient({ ...patient, gender: e.target.value })} labelId="gender-label" id='gender' value={patient.gender ?? ''} sx={{ width: '7rem' }} >
                                <MenuItem value='male'>male</MenuItem>
                                <MenuItem value='female'>female</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        {/* Age */}
                        <TextField variant='standard' id='age' value={patient.age ?? ''} label='Age' sx={{ width: '7rem' }} disabled />
                    </Grid>
                    <Grid item>
                        {/* Birth Date */}
                        <DateField onChange={(date) => {
                            const birthDate = fromDateTimeParts({ ...locale, calendar: 'Gregorian' }, locale, date)

                            const now = DateTime.local({ zone: locale.zone })

                            setPatient({
                                ...patient,
                                age: now.year - birthDate.date.year,
                                birthDate: DateTime.local(birthDate.date.year, birthDate.date.month, birthDate.date.day, { zone: locale.zone }).toUnixInteger(),
                            })
                        }} defaultDate={patient?.birthDate ? fromUnix(locale, patient.birthDate).date : undefined} />
                    </Grid>
                    <Grid item>
                        {/* Medical History */}
                        <TextField variant='standard' id='medicalHistory' value={patient.medicalHistory ?? ''} label='Medical history' sx={{ width: '7rem' }} multiline rows={patient.medicalHistory ? 3 : 1} onChange={(e) => setPatient({ ...patient, medicalHistory: [e.target.value] })} />
                    </Grid>
                    <Grid item>
                        {/* Address */}
                        <TextField variant='standard' id='address' value={patient.address ?? ''} label='Address' sx={{ width: '7rem' }} multiline rows={patient.address ? 3 : 1} onChange={(e) => setPatient({ ...patient, address: e.target.value })} />
                    </Grid>
                    <Grid item>
                        {/* Visit Controls */}
                        <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} >
                            <Button variant="text" onClick={() => setOpenVisitCreateModal(true)} startIcon={<AddIcon />}>
                                set visits
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        {/* Files */}
                        <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} >
                            {files.length !== 0 &&
                                <Button disabled variant='text'>
                                    {files.length} files are added
                                </Button>
                            }
                            <Button
                                component="label"
                                role={undefined}
                                variant="text"
                                tabIndex={-1}
                                startIcon={<AddIcon />}
                            >
                                Add documents
                                <VisuallyHiddenInput type="file" multiple={true} onChange={async (e) => {
                                    const fs: { fileName: string, bytes: Buffer | Uint8Array }[] = []
                                    fs.concat(files)
                                    for (const f of (e.target.files as unknown) as File[])
                                        fs.push({ fileName: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })

                                    setFiles(fs)
                                }} />
                            </Button>
                            {files.length !== 0 &&
                                <Button variant="text" onClick={() => setFiles([])}>
                                    reset documents
                                </Button>
                            }
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                    </Grid>
                    <Grid item xs={12}>
                        {/* Submit */}
                        <Button variant="contained" fullWidth onClick={() => {
                            setDialogTitle('About to register...')
                            setDialogContent('Are you sure?')
                            setDialogOpen(true)
                        }}>
                            Complete
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <ManageVisits onComplete={(visits: Visit[]) => { setVisits(visits); setOpenVisitCreateModal(false) }} defaultVisits={visits} />
                    </Grid>
                </Grid>
            </Stack>
            {/* Manage Visits */}
            <Modal open={openVisitCreateModal} onClose={() => setOpenVisitCreateModal(false)} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={openVisitCreateModal ? 'up' : 'down'} in={openVisitCreateModal} timeout={250}>
                    <Paper sx={{ maxWidth: '40rem', width: '60%', maxHeight: '75%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <ManageVisits onComplete={(visits: Visit[]) => { setVisits(visits); setOpenVisitCreateModal(false) }} defaultVisits={visits} />
                    </Paper>
                </Slide>
            </Modal>

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

            <Snackbar
                open={openSnackbar}
                autoHideDuration={7000}
                onClose={() => setOpenSnackbar(false)}
                action={snackbarAction}
            >
                <Alert icon={snackbarSeverity === 'success' ? <CheckIcon fontSize="inherit" /> : (snackbarSeverity === 'error' ? <CloseIcon fontSize="inherit" /> : null)} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    )
}


