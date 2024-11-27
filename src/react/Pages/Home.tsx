import { Box, Button, Grid } from "@mui/material";
import { SearchPatientField } from "../Components/Search/SearchPatientField";
import { Analytics } from "../Components/Home/Analytics";
import { Clock } from "../Components/Clock";
import { publish } from "../Lib/Events";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { t } from "i18next";
import { memo } from "react";

export const Home = memo(function Home() {
    console.log('Home')

    return (
        <>
            <Button onClick={() => {
                publish(RESULT_EVENT_NAME, {
                    severity: 'success',
                    message: t('foundPatient')
                });
            }}>click</Button>
            <Grid container spacing={1} p={1}>
                <Grid item xs={12} sm={3}>
                    <Clock />
                </Grid>
                <Grid item xs={0} sm={9}></Grid>

                <Grid item xs={0} sm={3}></Grid>
                <Grid item xs={12} sm={6}>
                    <SearchPatientField />
                </Grid>
                <Grid item xs={0} sm={3}></Grid>

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
