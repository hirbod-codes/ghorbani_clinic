import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, List, ListItem, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { t } from "i18next";
import { useState, useMemo, useContext } from 'react'
import { PatientsMedicalHistory } from "../../../Electron/Database/Models/Patient";
import { EditOutlined } from "@mui/icons-material";
import { Editor } from "../Editor/Editor";
import { Modal } from "../Modal";
import { MedicalHistorySearch } from "../MedicalHistory/MedicalHistorySearch";
import { resources } from "../../../Electron/Database/Repositories/Auth/resources";
import { AuthContext } from "../../Contexts/AuthContext";

export type MedicalHistoryProps = {
    open: boolean;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    inputMedicalHistory?: PatientsMedicalHistory | undefined;
    onSave?: (medicalHistory: PatientsMedicalHistory) => any;
    onChange?: (medicalHistory: PatientsMedicalHistory) => any;
}

export function MedicalHistory({ open, onSave, onClose, inputMedicalHistory, onChange }: MedicalHistoryProps) {
    const auth = useContext(AuthContext)
    const [openDrawer, setOpenDrawer] = useState<boolean>(false)
    const [medicalHistory, setMedicalHistory] = useState<PatientsMedicalHistory | undefined>(inputMedicalHistory)

    const [isEditingHistories, setIsEditingHistories] = useState<boolean>(false)

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    console.log('MedicalHistory', { openDrawer, medicalHistory, hasUnsavedChanges, inputMedicalHistory })

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        e: undefined,
        r: undefined,
    }
    const [dialog, setDialog] = useState(initDialog)
    const closeDialog = () => setDialog(initDialog)

    const updateMedicalHistory = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).update(resources.MEDICAL_HISTORY), [auth])

    return (
        <>
            <Modal
                onClose={(e, r) => {
                    console.log({ e, r })
                    if (hasUnsavedChanges)
                        setDialog({
                            open: true,
                            title: t('MedicalHistories.exiting'),
                            content: t('MedicalHistories.areYouSure?YouHaveUnsavedChanges'),
                            e,
                            r
                        })
                    else if (onClose)
                        onClose(e, r)
                }}
                open={open}
            >
                <Stack direction='column' justifyContent='end' sx={{ height: '100%', width: '100%' }} spacing={3}>

                    <Paper sx={{ width: '100%', flexGrow: 2, p: 2 }}>
                        <Stack direction='row' sx={{ height: '100%', width: '100%' }} justifyContent='space-between' spacing={2}>
                            <Paper elevation={2} sx={{ maxWidth: '48%', height: '100%', flexGrow: 2, p: 3 }}>
                                <Stack direction='column' sx={{ height: '100%', width: '100%' }} spacing={2} divider={<Divider orientation="horizontal" variant='middle' />}>
                                    {updateMedicalHistory &&
                                        // using Stack component because alignItems='start' will make dividers invisible!!
                                        <Stack direction='row' justifyContent='start'>
                                            <IconButton size="small" onClick={() => setIsEditingHistories(true)}>
                                                <EditOutlined />
                                            </IconButton>
                                        </Stack>
                                    }

                                    <Box sx={{ width: '100%', overflow: 'auto', textWrap: 'nowrap' }}>
                                        <Typography variant='h6'>
                                            {t('MedicalHistories.medicalHistory')}
                                        </Typography>
                                    </Box>

                                    <List sx={{ overflow: 'auto', flexGrow: 2 }}>
                                        {medicalHistory?.histories?.map((h, i) =>
                                            <ListItem key={i}>
                                                <ListItemText primary={h} />
                                            </ListItem>
                                        )}
                                    </List>
                                </Stack>
                            </Paper>

                            <Divider orientation="vertical" variant='middle' />

                            <Paper elevation={2} sx={{ maxWidth: '48%', height: '100%', flexGrow: 2, p: 3 }}>
                                <Editor
                                    title={t('MedicalHistories.medicalHistory')}
                                    hideCanvas={!updateMedicalHistory}
                                    hideTextEditor={!updateMedicalHistory}
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
                        </Stack>
                    </Paper>

                    <Divider orientation="horizontal" variant='middle' />

                    <Button variant='outlined' onClick={async () => {
                        if (onSave)
                            await onSave(medicalHistory)
                        setHasUnsavedChanges(false)
                    }}>
                        {t('MedicalHistories.save')}
                    </Button>
                </Stack>
            </Modal >

            <Modal open={isEditingHistories} onClose={() => { setIsEditingHistories(false) }}>
                <MedicalHistorySearch
                    deletable
                    creatable
                    selectable
                    defaultSelection={medicalHistory?.histories}
                    onSelectionChange={(s) => {
                        setHasUnsavedChanges(true)
                        setMedicalHistory({ ...medicalHistory, histories: s })
                    }}
                />
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
                    <Button onClick={closeDialog}>{t('MedicalHistories.No')}</Button>
                    <Button onClick={() => {
                        if (onClose)
                            onClose(dialog.e, dialog.r)

                        closeDialog()
                    }}>{t('MedicalHistories.Yes')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

