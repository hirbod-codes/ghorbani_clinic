import { Box, Button, Checkbox, CircularProgress, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Modal, Paper, Slide, Stack, TextField, Typography } from "@mui/material";
import { t } from "i18next";
import { useState, useEffect } from 'react'
import { ArrowBox } from "../ArrowBox/ArrowBox";
import { useSpring, animated, easings } from 'react-spring';
import useMeasure from 'react-use-measure'
import { PatientsMedicalHistory } from "../../../Electron/Database/Models/Patient";
import LoadingScreen from "../LoadingScreen";
import { RendererDbAPI } from "../../../Electron/Database/handleDbRendererEvents";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { AddOutlined } from "@mui/icons-material";

export type MedicalHistoryProps = {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    inputMedicalHistory?: PatientsMedicalHistory | undefined;
    onChange?: (medicalHistory: PatientsMedicalHistory) => any
}

export function MedicalHistory({ open, onClose, inputMedicalHistory, onChange }: MedicalHistoryProps) {
    const [openDrawer, setOpenDrawer] = useState<boolean>(false)

    const [addingMedicalHistoryLoading, setAddingMedicalHistoryLoading] = useState<boolean>(false)
    const [addingMedicalHistory, setAddingMedicalHistory] = useState<string | undefined>(undefined)
    const [medicalHistory, setMedicalHistory] = useState<PatientsMedicalHistory | undefined>(inputMedicalHistory ?? { description: '', histories: [] })

    const [loading, setLoading] = useState<boolean>(true)
    const [fetchedHistories, setFetchedHistories] = useState<string[] | undefined>(undefined)

    const [containerRef, { height }] = useMeasure()

    const drawerAnimationLeft = useSpring({
        left: openDrawer ? '0' : '-50%',
        config: { easing: easings.easeInBack }
    })

    const init = async () => {
        setLoading(true)
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getMedicalHistories()
        setLoading(false)

        if (res.code !== 200) {
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToFetchMedicalHistories')
            })

            return
        }

        publish(RESULT_EVENT_NAME, {
            severity: 'success',
            message: t('successfullyFetchedMedicalHistories')
        })

        const mh = res.data.map(m => m.name).filter(f => f !== null || f !== undefined || f.trim() !== '') ?? []

        setFetchedHistories(mh)
    }

    useEffect(() => {
        init()
    }, [])

    console.log('MedicalHistory', { openDrawer, medicalHistory, fetchedHistories })

    const toggleHistory = (v: boolean, fh: string) => {
        if (v && medicalHistory.histories.find(f => f === fh) === undefined) {
            medicalHistory.histories.push(fh)
            setMedicalHistory({ ...medicalHistory })
            if (onChange)
                onChange({ ...medicalHistory })
        }
        else if (!v && medicalHistory.histories.find(f => f === fh) !== undefined) {
            setMedicalHistory({ ...medicalHistory, histories: medicalHistory.histories.filter(f => f !== fh) })
            if (onChange)
                onChange({ ...medicalHistory, histories: medicalHistory.histories.filter(f => f !== fh) })
        }
    }

    return (
        <>
            <Modal
                onClose={() => setAddingMedicalHistory(undefined)}
                open={addingMedicalHistory !== undefined}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={addingMedicalHistory !== undefined ? 'up' : 'down'} in={addingMedicalHistory !== undefined} timeout={250}>
                    <Paper sx={{ position: 'absolute', top: 0, width: '100%', height: '100%', padding: '0.5rem 2rem', overflow: 'auto' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant='h5'>
                                    {t('AddMedicalHistoryTitle')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth variant='standard' type='text' onChange={(e) => setAddingMedicalHistory(e.target.value)} />
                            </Grid>
                            <Grid item xs={6}>
                                <Button fullWidth variant='outlined' color='success' onClick={async () => {
                                    if (!addingMedicalHistory || addingMedicalHistory.trim() === '')
                                        return

                                    setAddingMedicalHistoryLoading(true)
                                    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createMedicalHistory({ name: addingMedicalHistory })
                                    setAddingMedicalHistoryLoading(false)

                                    if (res.code !== 200 || !res.data.acknowledged) {
                                        publish(RESULT_EVENT_NAME, {
                                            severity: 'error',
                                            message: t('failedToAddMedicalHistory')
                                        })

                                        return
                                    }

                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'success',
                                        message: t('successfullyAddedMedicalHistory')
                                    })

                                    await init()
                                    setAddingMedicalHistory(undefined)
                                }}>
                                    {addingMedicalHistoryLoading ? <CircularProgress /> : t('add')}
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button fullWidth variant='outlined' color='error' onClick={() => setAddingMedicalHistory(undefined)}>
                                    {t('cancel')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Slide>
            </Modal>

            <Modal
                onClose={onClose}
                open={open}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={open ? 'up' : 'down'} in={open} timeout={250}>
                    <Box sx={{ width: '80%', height: '80%', position: 'relative', overflow: 'hidden', p: 0, m: 0 }} ref={containerRef}>
                        <animated.div style={{ position: 'relative', width: '50%', left: drawerAnimationLeft.left, zIndex: 100 }}>
                            <Paper sx={{ height, padding: '0.5rem 2rem', overflow: 'auto', zIndex: 101 }}>
                                {loading
                                    ? <LoadingScreen />
                                    :
                                    (
                                        fetchedHistories === undefined
                                            ?
                                            <LoadingScreen>
                                                {!loading &&
                                                    <Button variant="outlined" onClick={async () => await init()} sx={{ mt: 1 }}>
                                                        {t('tryAgain')}
                                                    </Button>
                                                }
                                            </LoadingScreen>
                                            :
                                            <List sx={{ pt: 3 }}>
                                                {fetchedHistories.map((fh, i) =>
                                                    <ListItem key={i} disablePadding>
                                                        <ListItemButton
                                                            dense
                                                            onClick={() => {
                                                                const v = !medicalHistory.histories.find(f => f === fh) !== undefined
                                                                toggleHistory(v, fh)
                                                            }}
                                                        >
                                                            <ListItemIcon>
                                                                <Checkbox
                                                                    edge="start"
                                                                    checked={medicalHistory.histories.find(f => f === fh) !== undefined}
                                                                    onChange={(e, v) => {
                                                                        toggleHistory(v, fh)
                                                                    }}
                                                                    disableRipple
                                                                />
                                                            </ListItemIcon>
                                                            <ListItemText primary={fh} />
                                                            <ListItemIcon>
                                                                <Checkbox
                                                                    edge="start"
                                                                    checked={medicalHistory.histories.find(f => f === fh) !== undefined}
                                                                    onChange={(e, v) => {
                                                                        toggleHistory(v, fh)
                                                                    }}
                                                                    disableRipple
                                                                />
                                                            </ListItemIcon>
                                                        </ListItemButton>
                                                    </ListItem>
                                                )}
                                                <Divider variant='middle' />
                                                <ListItem>
                                                    <Stack direction='row' justifyContent='center'>
                                                        <IconButton onClick={() => setAddingMedicalHistory('')}>
                                                            {addingMedicalHistory ? <CircularProgress /> : <AddOutlined />}
                                                        </IconButton>
                                                    </Stack>
                                                </ListItem>
                                            </List>
                                    )
                                }
                            </Paper>
                        </animated.div>

                        <Box sx={{ position: 'absolute', top: '50%', transform: 'translate(0, -50%)', zIndex: 9 }} onClick={() => setOpenDrawer(true)}>
                            <ArrowBox />
                        </Box>

                        <Paper sx={{ position: 'absolute', top: 0, width: '100%', height: '100%', padding: '0.5rem 2rem', overflow: 'auto' }} onClick={() => { if (openDrawer) setOpenDrawer(false) }}>
                            <Grid container spacing={1} p={1} sx={{ height: '100%' }}>
                                <Grid item md={5}>
                                    <Paper elevation={2} sx={{ width: '100%', height: '100%', p: 3 }}>
                                        <List>
                                            <Typography variant='h4'>
                                                {t('medicalHistory')}
                                            </Typography>
                                            {medicalHistory.histories.map((h, i) =>
                                                <ListItem key={i}>
                                                    <ListItemText primary={h} />
                                                </ListItem>
                                            )}
                                        </List>
                                    </Paper>
                                </Grid>

                                <Grid item container justifyContent='center' md={2}>
                                    <Divider orientation="vertical" variant='middle' />
                                </Grid>

                                <Grid item md={5}>
                                    <Paper elevation={2} sx={{ width: '100%', height: '100%', p: 3 }}>
                                        <Typography variant='h4' height={'10%'}>
                                            {t('description')}
                                        </Typography>
                                        <TextField
                                            variant='standard'
                                            value={medicalHistory.description ?? ''}
                                            label='Medical history'
                                            multiline
                                            minRows={10}
                                            sx={{
                                                height: '90%',
                                                "& .MuiInputBase-root": {
                                                    flexGrow: 1,
                                                    alignItems: 'stretch'
                                                }
                                            }}
                                            fullWidth
                                            onChange={(e) => {
                                                setMedicalHistory({ ...medicalHistory, description: e.target.value })
                                                if (onChange)
                                                    onChange({ ...medicalHistory, description: e.target.value })
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </Slide>
            </Modal>
        </>
    )
}

