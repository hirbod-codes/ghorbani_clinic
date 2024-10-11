import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Modal, Paper, Slide, Stack, TextField, Typography, useTheme } from "@mui/material";
import { t } from "i18next";
import { useState, useEffect } from 'react'
import { ArrowBox } from "./ArrowBox";
import { useSpring, animated, easings } from 'react-spring';
import useMeasure from 'react-use-measure'
import { PatientsMedicalHistory } from "../../../Electron/Database/Models/Patient";
import LoadingScreen from "../LoadingScreen";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { AddOutlined, ArrowLeftOutlined, ArrowRightOutlined, DeleteOutlined } from "@mui/icons-material";
import { Editor } from "../Editor/Editor";
import { TrashIcon } from "../Icons/TrashIcon";

export type MedicalHistoryProps = {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    inputMedicalHistory?: PatientsMedicalHistory | undefined;
    onSave?: (medicalHistory: PatientsMedicalHistory) => any;
    onChange?: (medicalHistory: PatientsMedicalHistory) => any;
}

export function MedicalHistory({ open, onSave, onClose, inputMedicalHistory, onChange }: MedicalHistoryProps) {
    const theme = useTheme()

    const [openDrawer, setOpenDrawer] = useState<boolean>(false)

    const [removingMedicalHistoryLoading, setRemovingMedicalHistoryLoading] = useState<number | undefined>(undefined)
    const [addingMedicalHistoryLoading, setAddingMedicalHistoryLoading] = useState<boolean>(false)

    const [addingMedicalHistory, setAddingMedicalHistory] = useState<string | undefined>(undefined)
    const [medicalHistory, setMedicalHistory] = useState<PatientsMedicalHistory | undefined>(inputMedicalHistory)
    useEffect(() => {
        setMedicalHistory(inputMedicalHistory ?? { description: { text: '', canvas: undefined }, histories: [] })
    }, [inputMedicalHistory])

    const [loading, setLoading] = useState<boolean>(true)
    const [fetchedHistories, setFetchedHistories] = useState<string[] | undefined>(undefined)

    const [containerRef, { height }] = useMeasure()

    const drawerAnimationLeft = useSpring({
        left: theme.direction === 'ltr' ? (openDrawer ? '0' : '-50%') : (openDrawer ? '0%' : '100%'),
        config: { easing: easings.easeInBack }
    })

    const init = async () => {
        setLoading(true)
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getMedicalHistories()
        setLoading(false)

        if (res.code !== 200) {
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('MedicalHistory.failedToFetchMedicalHistories')
            })

            return
        }

        publish(RESULT_EVENT_NAME, {
            severity: 'success',
            message: t('MedicalHistory.successfullyFetchedMedicalHistories')
        })

        const mh = res.data.map(m => m.name).filter(f => f !== null || f !== undefined || f.trim() !== '') ?? []

        setFetchedHistories(mh)
    }

    useEffect(() => {
        init()
    }, [])

    const toggleHistory = (v: boolean, fh: string) => {
        setHasUnsavedChanges(true)

        if (!medicalHistory?.histories)
            medicalHistory.histories = []

        if (v && medicalHistory?.histories?.find(f => f === fh) === undefined) {
            medicalHistory?.histories?.push(fh)
            setMedicalHistory({ ...medicalHistory })
        }
        else if (!v && medicalHistory?.histories?.find(f => f === fh) !== undefined)
            setMedicalHistory({ ...medicalHistory, histories: medicalHistory?.histories?.filter(f => f !== fh) })
    }

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    console.log('MedicalHistory', { openDrawer, medicalHistory, fetchedHistories, hasUnsavedChanges })

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        e: undefined,
        r: undefined,
    }
    const [dialog, setDialog] = useState(initDialog)
    const closeDialog = () => setDialog(initDialog)

    return (
        <>
            <Modal
                onClose={(e, r) => {
                    console.log({ e, r })
                    if (hasUnsavedChanges)
                        setDialog({
                            open: true,
                            title: t('MedicalHistory.exiting'),
                            content: t('MedicalHistory.areYouSure?YouHaveUnsavedChanges'),
                            e,
                            r
                        })
                    else if (onClose)
                        onClose(e, r)
                }}
                open={open}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={open ? 'up' : 'down'} in={open} timeout={250}>
                    <Box sx={{ width: '80vw', height: '80vh', position: 'relative', overflow: 'hidden', p: 0, m: 0 }} ref={containerRef}>
                        <animated.div style={{ position: 'relative', width: '50%', left: drawerAnimationLeft.left, zIndex: 100 }}>
                            <Paper sx={{ height, padding: '0.5rem 0rem', overflow: 'auto', zIndex: 101 }}>
                                {loading
                                    ? <LoadingScreen />
                                    :
                                    (
                                        fetchedHistories === undefined
                                            ?
                                            <LoadingScreen>
                                                {!loading &&
                                                    <Button variant="outlined" onClick={async () => await init()} sx={{ mt: 1 }}>
                                                        {t('MedicalHistory.tryAgain')}
                                                    </Button>
                                                }
                                            </LoadingScreen>
                                            :
                                            <List sx={{ p: 1 }} dense>
                                                {fetchedHistories.map((fh, i) =>
                                                    <ListItem
                                                        key={i}
                                                        dense
                                                        disableGutters
                                                        secondaryAction={
                                                            removingMedicalHistoryLoading !== undefined && removingMedicalHistoryLoading === i
                                                                ? <CircularProgress />
                                                                :
                                                                <IconButton onClick={async () => {
                                                                    try {
                                                                        setRemovingMedicalHistoryLoading(i)

                                                                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteMedicalHistoryByName(fh)

                                                                        if (res.code !== 200 || !res.data.acknowledged) {
                                                                            publish(RESULT_EVENT_NAME, {
                                                                                severity: 'error',
                                                                                message: t('MedicalHistory.failedToRemoveMedicalHistory')
                                                                            })

                                                                            return
                                                                        }

                                                                        publish(RESULT_EVENT_NAME, {
                                                                            severity: 'success',
                                                                            message: t('MedicalHistory.successfullyRemovedMedicalHistory')
                                                                        })

                                                                        setFetchedHistories(fetchedHistories.filter((f, fi) => fi !== i))
                                                                    } catch (error) {
                                                                        console.error(error)
                                                                    } finally {
                                                                        setRemovingMedicalHistoryLoading(undefined)
                                                                    }
                                                                }} color='error' sx={{ ml: 2 }}>
                                                                    <TrashIcon color="error" />
                                                                </IconButton>
                                                        }
                                                    >
                                                        <ListItemButton
                                                            dense
                                                            onClick={() => {
                                                                const v = !medicalHistory?.histories?.find(f => f === fh) !== undefined
                                                                toggleHistory(v, fh)
                                                            }}
                                                        >
                                                            <ListItemIcon>
                                                                <Checkbox
                                                                    color='success'
                                                                    edge="start"
                                                                    checked={medicalHistory?.histories?.find(f => f === fh) !== undefined}
                                                                    onChange={(e, v) => {
                                                                        toggleHistory(v, fh)
                                                                    }}
                                                                    disableRipple
                                                                />
                                                            </ListItemIcon>
                                                            <ListItemText primary={fh} primaryTypographyProps={{
                                                                style: {
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'auto'
                                                                }
                                                            }} />
                                                        </ListItemButton>
                                                    </ListItem>
                                                )}
                                                <Divider variant='middle' />
                                                <ListItem>
                                                    <Stack direction='row' justifyContent='center' sx={{ width: '100%' }}>
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

                        <Stack direction='column' justifyContent='center' sx={{ borderRadius: 1, height: '2rem', boxShadow: '0px 0px 10px 2px rgba(0,0,0,0.2)', cursor: 'pointer', position: 'absolute', top: '50%', transform: 'translate(0, -50%)', zIndex: 9 }} onClick={() => setOpenDrawer(true)}>
                            {
                                theme.direction === 'ltr'
                                    ? <ArrowRightOutlined />
                                    : <ArrowLeftOutlined />
                            }
                        </Stack>

                        <Paper sx={{ position: 'absolute', top: 0, width: '100%', height: '100%', padding: '0.5rem 2rem', overflow: 'hidden' }} onClick={() => { if (openDrawer) setOpenDrawer(false) }}>
                            <Grid container sx={{ height: '100%' }} columns={24}>
                                <Grid item xs={11} sx={{ height: '100%' }}>
                                    <Paper elevation={2} sx={{ width: '100%', height: '100%', p: 3 }}>
                                        <Stack direction='column' sx={{ height: '100%' }}>
                                            <Typography variant='h4'>
                                                {t('MedicalHistory.medicalHistory')}
                                            </Typography>
                                            <Divider />
                                            <List sx={{ overflow: 'auto', flexGrow: 2 }}>
                                                {medicalHistory?.histories?.map((h, i) =>
                                                    <ListItem key={i}>
                                                        <ListItemText primary={h} />
                                                    </ListItem>
                                                )}
                                            </List>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                <Grid item xs={1} container justifyContent='center' >
                                    <Divider orientation="vertical" variant='middle' />
                                </Grid>

                                <Grid item xs={11} sx={{ height: '100%' }}>
                                    <Paper elevation={2} sx={{ width: '100%', height: '100%', p: 3 }}>
                                        <Editor
                                            title={t('MedicalHistory.medicalHistory')}
                                            text={medicalHistory?.description?.text}
                                            canvasId={medicalHistory?.description?.canvas as string}
                                            onSave={(text, canvas) => {
                                                setMedicalHistory({ ...medicalHistory, description: { text, canvas } });
                                                if (onSave)
                                                    onSave({ ...medicalHistory, description: { text, canvas } })
                                            }}
                                            onChange={(text, canvas) => {
                                                if (onChange)
                                                    onChange({ ...medicalHistory, description: { text, canvas } })
                                            }}
                                            setHasUnsavedChanges={setHasUnsavedChanges}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </Slide>
            </Modal>

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
                        <Grid container spacing={0}>
                            <Grid item xs={12}>
                                <Typography variant='h5'>
                                    {t('MedicalHistory.AddMedicalHistoryTitle')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth variant='standard' type='text' onChange={(e) => setAddingMedicalHistory(e.target.value)} />
                            </Grid>
                            <Grid item xs={6}>
                                <Button fullWidth variant='outlined' color='error' onClick={() => setAddingMedicalHistory(undefined)}>
                                    {t('MedicalHistory.cancel')}
                                </Button>
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
                                            message: t('MedicalHistory.failedToAddMedicalHistory')
                                        })

                                        return
                                    }

                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'success',
                                        message: t('MedicalHistory.successfullyAddedMedicalHistory')
                                    })

                                    await init()
                                    setAddingMedicalHistory(undefined)
                                }}>
                                    {addingMedicalHistoryLoading ? <CircularProgress /> : t('MedicalHistory.add')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Slide>
            </Modal>

            <Dialog open={dialog.open} onClose={closeDialog} >
                <DialogTitle>
                    {dialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText whiteSpace={'break-spaces'}>
                        {dialog.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>{t('MedicalHistory.No')}</Button>
                    <Button onClick={() => {
                        if (onClose)
                            onClose(dialog.e, dialog.r)

                        closeDialog()
                    }}>{t('MedicalHistory.Yes')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

