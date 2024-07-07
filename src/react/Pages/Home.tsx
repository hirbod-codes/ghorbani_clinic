import { useContext, useState, ChangeEvent } from "react";
import { t } from "i18next";
import { Button, CircularProgress, Grid, InputAdornment, Modal, Paper, Slide, TextField, Typography } from "@mui/material";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { SearchOutlined } from "@mui/icons-material";
import { ResultContext } from "../Contexts/ResultContext";
import { Patient } from "../../Electron/Database/Models/Patient";
import { ManagePatient } from "../Components/Patients/ManagePatient";
import { AnimatedCircularProgressBar } from "../Components/ProgressBars/AnimatedCircularProgressBar";

export function Home() {
    const setResult = useContext(ResultContext).setResult

    const [loading, setLoading] = useState<boolean>(false)
    const [socialId, setSocialId] = useState<string | undefined>(undefined)

    const [patient, setPatient] = useState<Patient | undefined>(undefined)

    const onSocialIdChange = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.target.value && e.target.value.trim().length <= 10)
            setSocialId(e.target.value)

        if (!e.target.value || e.target.value.trim().length !== 10)
            return

        setLoading(true)
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatient(e.target.value)
        setLoading(false)

        if (res.code !== 200 || !res.data)
            return

        setResult({
            severity: 'success',
            message: t('foundPatient')
        })

        setPatient(res.data)
    }

    return (
        <>
            <Grid container spacing={1} p={1}>
                <Grid item sm={0} md={'auto'}></Grid>
                <Grid item sm={12} md={6}>
                    <TextField
                        fullWidth
                        label={t('search')}
                        type="text"
                        variant="standard"
                        value={socialId}
                        onChange={onSocialIdChange}
                        error={socialId !== undefined && socialId.length !== 10} helperText={t('InvalidSocialId')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {loading ? <CircularProgress size={20} /> : <SearchOutlined />}
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item sm={0} md={'auto'}></Grid>

                <Grid item xs={6}></Grid>
                <Grid item xs={6}></Grid>
                <Grid item xs={12}></Grid>
            </Grid>

            <Modal
                onClose={() => setPatient(undefined)}
                open={patient !== undefined}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={patient !== undefined ? 'up' : 'down'} in={patient !== undefined} timeout={250}>
                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                        <ManagePatient inputPatient={patient} />
                    </Paper>
                </Slide>
            </Modal>

            <AnimatedCircularProgressBar start={0} end={70}>
                <Typography variant='h4'>
                    patientsCount
                </Typography>
            </AnimatedCircularProgressBar>
        </>
    )
}
