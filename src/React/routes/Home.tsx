import { Box, Grid, TextField } from '@mui/material';

import { AnimatedCounter } from '../components/AnimatedCounter';
import { AuthContext } from '../../Electron/Auth/renderer/AuthContext';
import { useContext, useState } from 'react';
import { CreatePatient } from '../components/Patients/CreatePatient';
import type { Patient } from '../../Electron/Database/Models/Patient';
import { ShowPatient } from '../components/Patients/ShowPatient';

export function Home() {
    const { user } = useContext(AuthContext)

    const [patient, setPatient] = useState<Patient | null>(null)

    if (!user)
        return (<>{null}</>)
    else
        return (
            <>
                <Grid container spacing={0} sx={{ border: '1px solid red' }} justifyContent='space-between'>
                    <Grid container item xs={12} justifyContent={'center'} sx={{ border: '1px solid green' }}>
                        <Box sx={{ width: '30rem', border: '5px solid pink' }}>
                            <TextField variant='filled' onChange={() => { return null }} id='search' label='Search' fullWidth />
                        </Box>
                    </Grid>
                    <Grid item sx={{ border: '1px solid gray' }} xs={12} container justifyContent={'center'}>
                        <h2>Hello from React</h2>
                    </Grid>
                    <Grid item sx={{ border: '1px solid gray' }} xs={12} container justifyContent={'center'}>
                        <AnimatedCounter countTo={500} />
                    </Grid>
                    <Grid item sx={{ border: '1px solid gray' }} xs={12} container justifyContent={'center'}>
                        <ShowPatient patient={patient} />
                    </Grid>
                    <Grid item sx={{ border: '1px solid gray' }} xs={12} container justifyContent={'center'}>
                        <CreatePatient />
                    </Grid>
                </Grid>
            </>
        );
}
