import { Box, Grid } from "@mui/material";
import { SearchPatientField } from "../Components/Search/SearchPatientField";
import { Analytics } from "../Components/Home/Analytics";
import { Modal } from "../Components/Modal";
import { useState } from "react";
import { Canvas as TestCanvas } from "../Components/Canvas";

export function Home() {
    console.log('Home')

    const [open, setOpen] = useState(true)
    return (
        <>
            <Grid container spacing={1} p={1}>
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

                <Grid item xs={12}>
                    <Modal open={open} onClose={() => setOpen(false)}>
                        <div style={{ direction: 'ltr', position: 'relative', height: '100%', width: '100%' }}>
                            {/* <div style={{ position: 'absolute', left: '0%', top: 0, height: '100%', width: '100%', padding: '10px', border: '1px solid red' }}> */}
                            {/* <div style={{ position: 'fixed', inset: 0 }}> */}
                            <TestCanvas />
                            {/* </div> */}
                            {/* </div> */}
                        </div>
                    </Modal>
                </Grid>
            </Grid>
        </>
    )
}
