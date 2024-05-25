import { Box, Grid, TextField } from '@mui/material';

import { AnimatedCounter } from '../components/AnimatedCounter';
import { AuthContext } from '../../Electron/Auth/renderer/AuthContext';
import { useContext } from 'react';

export function Home() {
    const { user } = useContext(AuthContext)

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
                    <Grid item sx={{ border: '1px solid gray' }}>
                        <h2>Hello from React</h2>
                        <AnimatedCounter countTo={500} />
                        {user.username}
                    </Grid>
                </Grid>
            </>
        );
}
