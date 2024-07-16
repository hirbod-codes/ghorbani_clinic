import { Box, Checkbox, Divider, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Modal, Paper, Slide, TextField, Typography } from "@mui/material";
import { t } from "i18next";
import { useState, useEffect } from 'react'
import { ArrowBox } from "../ArrowBox/ArrowBox";
import { useSpring, animated, easings } from 'react-spring';
import useMeasure from 'react-use-measure'
import { MedicalHistory } from "../../../Electron/Database/Models/Patient";
import LoadingScreen from "../LoadingScreen";

export type MedicalHistoryProps = {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    inputMedicalHistory?: MedicalHistory | undefined;
    onChange?: (medicalHistory: MedicalHistory) => any
}

export function MedicalHistory({ open, onClose, inputMedicalHistory, onChange }: MedicalHistoryProps) {
    const [openDrawer, setOpenDrawer] = useState(false)

    const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | undefined>(inputMedicalHistory ?? { description: '', histories: [] })

    const [fetchedHistories, setFetchedHistories] = useState<string[] | undefined>(undefined)

    const [containerRef, { height }] = useMeasure()

    const drawerAnimation = useSpring({
        left: openDrawer ? '0' : '-12rem',
        config: { easing: easings.easeInBack }
    })

    useEffect(() => {
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
                onClose={onClose}
                open={open}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={open ? 'up' : 'down'} in={open} timeout={250}>
                    <Box sx={{ width: '80%', height: '80%', position: 'relative', overflow: 'hidden', p: 0, m: 0 }} ref={containerRef}>
                        <animated.div style={{ position: 'relative', width: '12rem', left: drawerAnimation.left, zIndex: 100 }}>
                            <Paper sx={{ height, padding: '0.5rem 2rem', zIndex: 101 }}>
                                {fetchedHistories === undefined
                                    ? <LoadingScreen />
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
                                                </ListItemButton>
                                            </ListItem>
                                        )}
                                    </List>
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

