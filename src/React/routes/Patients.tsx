import { Paper } from "@mui/material";
import { PatientDataGrid } from "../components/Patients/PatientDataGrid";

export function Patients() {
    return (
        <>
            <Paper sx={{ m: 5, p: 5, pt: 2, pb: 2 }}>
                <PatientDataGrid />
            </Paper>
        </>
    )
}