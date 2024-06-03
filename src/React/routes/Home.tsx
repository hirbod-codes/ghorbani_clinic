import { Box, Modal, Paper, Divider, Grid, IconButton, Stack, TextField, Slide, CircularProgress, Button } from '@mui/material';

import { AnimatedCounter } from '../components/AnimatedCounter';
import { AuthContext } from '../../Electron/Auth/renderer/AuthContext';
import { useContext, useRef, useState } from 'react';
import { ManagePatient } from '../components/Patients/ManagePatient';
import type { Patient } from '../../Electron/Database/Models/Patient';

import AddIcon from '@mui/icons-material/AddOutlined';
import type { dbAPI } from '../../Electron/Database/renderer/dbAPI';
import ServerPaginationGridNoRowCount from '../components/Patients/PatientDataGrid copy';
import { PatientDataGrid } from '../components/Patients/PatientDataGrid';

export function Home() {
    const { user } = useContext(AuthContext)

    const [searchError, setSearchError] = useState(false)
    const [searchHelperText, setSearchHelperText] = useState('')
    const [patient, setPatient] = useState<Patient | null>(null)

    const [openPatientCreationModal, setOpenPatientCreationModal] = useState(false)
    const [openPatientViewerModal, setOpenPatientViewerModal] = useState(false)

    const modalContainerRef = useRef<HTMLElement>(null);

    const [searching, setSearching] = useState(false)

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length !== 10) {
            setSearchHelperText('must have 10 digits.')
            setSearchError(true)
            return
        }

        search(e.target.value)
    }
    const search = async (socialId: string) => {
        try {
            setSearchHelperText('')
            setSearchError(false)

            setSearching(true)
            setPatient(null)

            const patientJson = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.getPatient(socialId)
            console.log('patientJson', patientJson);

            const patient = JSON.parse(patientJson)
            console.log('patient', patient);

            if (patient) {
                setPatient(patient)
                setOpenPatientViewerModal(true)
            }
        } finally {
            setSearching(false)
        }
    }

    if (!user)
        return (<>{null}</>)
    else
        return (
            <Box ref={modalContainerRef}>
                <Button onClick={() => search('2222222222')}>a</Button>
                <Grid container rowSpacing={2} sx={{ border: '1px solid red' }}>
                    <Grid item xs={12} sx={{ border: '1px solid gray' }}>
                    </Grid>
                    <Grid item xs={12} sx={{ border: '1px solid gray' }}>
                        <Stack spacing={1} direction={'row'} divider={<Divider orientation="vertical" variant='middle' flexItem />} justifyContent='center' alignItems='center'>
                            <TextField variant='filled' size='small' type='number' onChange={handleSearch} id='search' label='Search' error={searchError} helperText={searchHelperText} />
                            <Box>
                                <IconButton size='small' color='inherit' onClick={() => { setOpenPatientCreationModal(true) }}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item sx={{ border: '1px solid gray' }} xs={12} container justifyContent={'center'}>
                        <h2>Hello from React</h2>
                    </Grid>
                    <Grid item sx={{ border: '1px solid gray' }} xs={12} container justifyContent={'center'}>
                        <AnimatedCounter countTo={500} />
                    </Grid>
                    {searching &&
                        <Grid item xs={12} container justifyContent={'center'}>
                            <CircularProgress />
                        </Grid>
                    }
                    <Grid item xs={12}>
                        <Paper sx={{ m: 5, p: 5, pt: 2, pb: 2 }}>
                            <PatientDataGrid />
                        </Paper>
                    </Grid>
                    {/* <Grid item xs={12}>
                        <Paper sx={{ m: 5, p: 5, pt: 2, pb: 2 }}>
                            <ServerPaginationGridNoRowCount />
                        </Paper>
                    </Grid> */}
                </Grid>

                <Modal onClose={() => { setOpenPatientCreationModal(false) }} open={openPatientCreationModal} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                    <Slide direction={openPatientCreationModal ? 'up' : 'down'} in={openPatientCreationModal} timeout={250}>
                        <Paper sx={{ maxWidth: '40rem', width: '60%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                            <ManagePatient />
                        </Paper>
                    </Slide>
                </Modal>

                <Modal onClose={() => { setOpenPatientViewerModal(false) }} open={openPatientViewerModal} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                    <Slide direction={openPatientViewerModal ? 'up' : 'down'} in={openPatientViewerModal} timeout={250}>
                        <Paper sx={{ maxWidth: '40rem', width: '60%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                            <ManagePatient inputPatient={patient} />
                        </Paper>
                    </Slide>
                </Modal>
            </Box>
        );
}
