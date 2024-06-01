import { Box, Modal, Paper, Divider, Grid, IconButton, Stack, TextField, Slide } from '@mui/material';

import { AnimatedCounter } from '../components/AnimatedCounter';
import { AuthContext } from '../../Electron/Auth/renderer/AuthContext';
import { useContext, useRef, useState } from 'react';
import { CreatePatient } from '../components/Patients/CreatePatient';
import type { Patient } from '../../Electron/Database/Models/Patient';
import { ShowPatient } from '../components/Patients/ShowPatient';

import AddIcon from '@mui/icons-material/AddOutlined';
import type { dbAPI } from '../../Electron/Database/renderer/dbAPI';

export function Home() {
    const { user } = useContext(AuthContext)

    const [searchError, setSearchError] = useState(false)
    const [searchHelperText, setSearchHelperText] = useState('')
    const [patient, setPatient] = useState<Patient | null>(null)
    const [openPatientCreationModal, setOpenPatientCreationModal] = useState(true)
    const [openPatientViewerModal, setOpenPatientViewerModal] = useState(false)

    const [modalDirection, setModalDirection] = useState<"up" | "left" | "right" | "down">('up')
    const modalContainerRef = useRef<HTMLElement>(null);

    const search = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length !== 10) {
            setSearchHelperText('must have 10 digits.')
            setSearchError(true)
        } else {
            setSearchHelperText('')
            setSearchError(false)
        }

        const patient = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.getPatient(Number(e.target.value))

        if (patient) {
            setPatient(patient)
            setModalDirection('up')
            setOpenPatientViewerModal(true)
        }

    }

    if (!user)
        return (<>{null}</>)
    else
        return (
            <Box ref={modalContainerRef}>
                <Grid container rowSpacing={2} sx={{ border: '1px solid red' }}>
                    <Grid item xs={12} sx={{ border: '1px solid gray' }}>
                    </Grid>
                    <Grid item xs={12} sx={{ border: '1px solid gray' }}>
                        <Stack spacing={1} direction={'row'} divider={<Divider orientation="vertical" variant='middle' flexItem />} justifyContent='center' alignItems='center'>
                            <TextField variant='filled' size='small' type='number' onChange={search} id='search' label='Search' error={searchError} helperText={searchHelperText} />
                            <Box>
                                <IconButton size='small' color='inherit' onClick={() => { setModalDirection('up'); setOpenPatientCreationModal(true) }}>
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

                    <Modal onClose={() => { setModalDirection('down'); setOpenPatientCreationModal(false) }} open={openPatientCreationModal} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                        <Slide direction={modalDirection} in={openPatientCreationModal} timeout={250}>
                            <Paper sx={{ maxHeight: '30rem', height: '85%', maxWidth: '40rem', width: '60%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                                <CreatePatient />
                            </Paper>
                        </Slide>
                    </Modal>

                    <Modal onClose={() => { setModalDirection('down'); setOpenPatientViewerModal(false) }} open={openPatientViewerModal} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                        <Slide direction={modalDirection} in={openPatientViewerModal} timeout={250}>
                            <Paper sx={{ maxHeight: '30rem', height: '85%', maxWidth: '40rem', width: '60%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                                <ShowPatient patient={patient} />
                            </Paper>
                        </Slide>
                    </Modal>
                </Grid>
            </Box>
        );
}
