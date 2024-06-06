import { Box, Modal, Paper, Divider, Grid, IconButton, Stack, TextField, Slide, CircularProgress, Button } from '@mui/material';

import { AnimatedCounter } from '../components/AnimatedCounter';
import { AuthContext } from '../../Electron/Auth/renderer/AuthContext';
import { useContext, useRef, useState } from 'react';
import { ManagePatient } from '../components/Patients/ManagePatient';
import { collectionName as patientsCollectionName, type Patient } from '../../Electron/Database/Models/Patient';

import AddIcon from '@mui/icons-material/AddOutlined';
import type { IPatientRepository } from '../../Electron/Database/dbAPI';
import { PatientDataGrid } from '../components/Patients/PatientDataGrid';
import { collectionName as visitsCollectionName } from '../../Electron/Database/Models/Visit';

export function Home() {
    const { user } = useContext(AuthContext)

    const [searchError, setSearchError] = useState(false)
    const [searchHelperText, setSearchHelperText] = useState('')

    const [patient, setPatient] = useState<Patient>(undefined)
    const [openPatientModal, setOpenPatientModal] = useState(false)

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

            const patientJson = await (window as typeof window & { dbAPI: IPatientRepository }).dbAPI.getPatient(socialId)

            const patient = JSON.parse(patientJson)

            if (patient) {
                setPatient(patient)
                setOpenPatientModal(true)
            }
        } finally {
            setSearching(false)
        }
    }

    if (!user)
        return (<>{null}</>)
    else
        return (
            <>
                <Grid container rowSpacing={2} sx={{ border: '1px solid red' }}>
                    <Grid item xs={12} sx={{ border: '1px solid gray' }}>
                    </Grid>
                    <Grid item xs={12} sx={{ border: '1px solid gray' }}>
                        <Stack spacing={1} direction={'row'} divider={<Divider orientation="vertical" variant='middle' flexItem />} justifyContent='center' alignItems='center'>
                            {searching &&
                                <CircularProgress />
                            }
                            {user?.privileges?.includes(`read.${patientsCollectionName}`) && !searching &&
                                <TextField variant='filled' size='small' type='number' onChange={handleSearch} id='search' label='Search' error={searchError} helperText={searchHelperText} />
                            }
                            {user?.privileges?.includes(`create.${patientsCollectionName}`) &&
                                <Box>
                                    <IconButton size='small' color='inherit' onClick={() => { setOpenPatientModal(true) }}>
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                            }
                        </Stack>
                    </Grid>
                    <Grid item sx={{ border: '1px solid gray' }} xs={12} container justifyContent={'center'}>
                        <h2>Hello from React</h2>
                    </Grid>
                    <Grid item sx={{ border: '1px solid gray' }} xs={12} container justifyContent={'center'}>
                        <AnimatedCounter countTo={500} />
                    </Grid>
                    {user.privileges.includes(`read.${patientsCollectionName}`) && user.privileges.includes(`read.${visitsCollectionName}`) &&
                        <Grid item xs={12}>
                            <Paper sx={{ m: 5, p: 5, pt: 2, pb: 2 }}>
                                <PatientDataGrid />
                            </Paper>
                        </Grid>
                    }
                </Grid>

                <Modal onClose={() => { setOpenPatientModal(false) }} open={openPatientModal} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                    <Slide direction={openPatientModal ? 'up' : 'down'} in={openPatientModal} timeout={250}>
                        <Paper sx={{ maxWidth: '40rem', width: '60%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                            <ManagePatient inputPatient={patient} />
                        </Paper>
                    </Slide>
                </Modal>
            </>
        );
}
