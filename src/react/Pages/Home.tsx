import { Box, Grid } from "@mui/material";
import { SearchPatientField } from "../Components/Search/SearchPatientField";
import { Analytics } from "../Components/Home/Analytics";
import { Modal } from "../Components/Modal";
import { Canvas } from "../Components/Canvas/test/Canvas";
import { useState } from "react";
import { DataGrid } from "../Components/DataGrid";

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
                        <div style={{ direction: 'ltr', height: '100%', width: '100%' }}>
                            <DataGrid configName="test" data={[]} />
                        </div>
                    </Modal>
                </Grid>

                {/* <Grid item xs={12}>
                    <Modal open={true} >
                        <Canvas />
                    </Modal>
                </Grid> */}
            </Grid>
        </>
    )
}
