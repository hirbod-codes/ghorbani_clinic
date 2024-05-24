import { Box, Grid } from "@mui/material";

import { Search } from "../components/Search";
import { AnimatedCounter } from "../components/AnimatedCounter";


export function Home() {
    return (
        <>
            <Grid container direction='column' spacing={2} sx={{ border: '1px solid red' }}>
                <Grid item xs={12} direction='row' alignSelf={'center'} sx={{ border: '1px solid green' }}>
                    <Box sx={{ width: '20rem' }}>
                        <Search />
                    </Box>
                </Grid>
                <Grid item sx={{ border: '1px solid green' }}>
                    <h2>Hello from React</h2>
                    <AnimatedCounter countTo={500} />
                </Grid>
            </Grid>
        </>
    );
}
