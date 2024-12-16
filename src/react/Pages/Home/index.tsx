import { Box, Grid } from "@mui/material";
import { SearchPatientField } from "../../Components/Search/SearchPatientField";
import { Analytics } from "./Analytics";
import { Clock } from "../../Components/Clock";
import { memo } from "react";
import { Calendar } from "./Calendar";

export const Home = memo(function Home() {

    return (
        <>
            <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
                {/* To fix negative margin */}
                <Grid container sx={{ width: '100%' }}>
                    <Grid container spacing={2} sx={{ p: 1, width: '100%' }}>
                        <Grid item xs={0} sm={3} />
                        <Grid item xs={12} sm={6}>
                            <SearchPatientField />
                        </Grid>
                        <Grid item xs={0} sm={3} />

                        <Grid item xs={12} sm={3}>
                            {/* <Clock /> */}
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Calendar />
                        </Grid>
                        <Grid item xs={0} sm={true} />

                        <Grid item xs={12} sm={4}>
                            <Analytics />
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
})
