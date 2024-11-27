import { Grid, Paper } from "@mui/material";
import { MedicalHistoryDataGrid } from "../Components/MedicalHistory/MedicalHistoryDataGrid";
import { memo, useEffect, useState } from "react";
import { subscribe } from "../Lib/Events";
import { PAGE_SLIDER_ANIMATION_END_EVENT_NAME } from "./AnimatedLayout";
import LoadingScreen from "../Components/LoadingScreen";

export const MedicalHistories = memo(function MedicalHistories() {
    const [showGrid, setShowGrid] = useState(false)

    useEffect(() => {
        subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
            if (e?.detail === '/MedicalHistories')
                setShowGrid(true)
        })
    }, [])

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={12} height={'100%'}>
                    <Paper style={{ padding: '1rem', height: '100%' }} elevation={3}>
                        {showGrid
                            ? < MedicalHistoryDataGrid />
                            : <LoadingScreen />
                        }
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
})

