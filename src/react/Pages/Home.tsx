import { Box, Grid } from "@mui/material";
import { SearchPatientField } from "../Components/Search/SearchPatientField";
import { Analytics } from "../Components/Home/Analytics";
import { Clock } from "../Components/Clock";
import { memo } from "react";
import { Calendar } from "../Components/Calendar";

export const Home = memo(function Home() {
    console.log('Home')

    return (
        <>
            <Grid container spacing={1} p={1}>
                <Grid item xs={0} sm={3}></Grid>
                <Grid item xs={12} sm={6}>
                    <SearchPatientField />
                </Grid>
                <Grid item xs={0} sm={3}></Grid>

                <Grid item>
                    <Clock />
                </Grid>

                <Grid item xs={0} sm={3}>
                    <Calendar />
                </Grid>
                <Grid item xs={0} sm={9}></Grid>

                <Grid item xs={12}>
                    <Box mb={10}></Box>
                </Grid>

                <Grid item xs={12}>
                    <Analytics />
                </Grid>
            </Grid>
        </>
    )
})
