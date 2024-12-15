import { AddOutlined, Done, RemoveOutlined, SearchOutlined } from "@mui/icons-material";
import { CircularProgress, IconButton, InputAdornment, Paper, Stack, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Typography, Checkbox, Divider, Box } from "@mui/material";
import { t } from "i18next";
import { useContext, useEffect, useMemo, useState } from "react";
import { MedicalHistory } from "../../../Electron/Database/Models/MedicalHistory";
import { mainTransition } from "../../Styles/animations";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { TrashIcon } from "../Icons/TrashIcon";
import { AuthContext } from "../../Contexts/AuthContext";
import { resources } from "../../../Electron/Database/Repositories/Auth/resources";
import { publish } from "../../Lib/Events";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { EditorModal } from "../Editor/EditorModal";
import { AnimatedList } from "../Animations/AnimatedList";

const xOffset = 100;
const delay = 100
const variants = {
    enter: (i: number) => ({
        name: 'enter',
        x: -xOffset.toString() + '%',
        transition: { ...mainTransition, delay: i * delay }
    }),
    active: {
        name: 'active',
        x: 0,
        transition: { ...mainTransition, delay: 0.5 }
    },
    exit: (i: number) => ({
        name: 'exit',
        x: xOffset.toString() + '%',
        transition: { ...mainTransition, delay: i * delay }
    })
};

export function MedicalHistorySearch({ creatable = false, deletable = false, defaultSelection, selectable = false, onSelectionChange }: { creatable?: boolean, deletable?: boolean, defaultSelection?: string[], selectable?: boolean, onSelectionChange?: (selection: string[]) => (void | Promise<void>) }) {
    const auth = useContext(AuthContext)

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        action: null
    }
    const [dialog, setDialog] = useState<{
        open: boolean,
        title?: string,
        content: string,
        action: () => void | Promise<void>
    }>(initDialog)
    const closeDialog = () => setDialog(initDialog)

    const [creatingMedicalHistory, setCreatingMedicalHistory] = useState(false)

    const [searchStr, setSearchStr] = useState<string>('')
    const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([])

    const [isSearching, setIsSearching] = useState<boolean>(false)

    const search = async () => {
        setIsSearching(true)

        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.searchMedicalHistories(searchStr)
        console.log({ res })

        if (res.code !== 200 || !res.data)
            return false

        setIsSearching(false)

        setMedicalHistories(res.data)

        return true
    }

    const createsMedicalHistory = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).create(resources.MEDICAL_HISTORY), [auth])
    const deletesMedicalHistory = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.MEDICAL_HISTORY), [auth])

    const deleteMedicalHistory = async (id: string) =>
        setDialog({
            open: true,
            content: t('MedicalHistories.deleteMedicalHistoryDialogContent'),
            action: async () => {
                try {
                    console.group('MedicalHistories', 'deletesMedicalHistory', 'onClick', id)

                    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteMedicalHistoryById(id)
                    console.log({ res })

                    if (res.code !== 200 || !res.data.acknowledged || res.data.deletedCount !== 1) {
                        publish(RESULT_EVENT_NAME, {
                            severity: 'error',
                            message: t('MedicalHistories.failedToDeleteMedicalHistory')
                        })
                        return
                    }

                    await search()
                }
                catch (err) { console.error(err) }
                finally { console.groupEnd() }
            }
        })

    const [selection, setSelection] = useState(defaultSelection ?? [])

    useEffect(() => {
        if (onSelectionChange)
            onSelectionChange(selection)
    }, [selection])

    return (
        <>
            <Stack direction='column' justifyContent='start' alignItems='center' sx={{ width: '100%', height: '100%' }} spacing={2}>
                <Stack direction='row' alignItems='center'>
                    <TextField
                        variant='standard'
                        type='text'
                        value={searchStr}
                        onChange={(e) => setSearchStr(e.target.value)}
                        label={t('MedicalHistorySearch.search')}
                        InputProps={{
                            startAdornment: <InputAdornment position='end'>
                                <SearchOutlined />
                            </InputAdornment>
                        }}
                    />

                    {isSearching
                        ? <CircularProgress size={20} />
                        : <IconButton size='small' onClick={search}>
                            <Done />
                        </IconButton>
                    }
                </Stack>

                <Box sx={{ flexGrow: 2, overflow: 'hidden', width: '100%' }}>
                    <Stack direction='column' justifyContent='space-between' sx={{ height: '100%', width: '100%' }}>
                        <Paper sx={{ height: '48%', width: '100%', p: 2, overflow: 'auto' }} elevation={3}>
                            <AnimatedList
                                collection={medicalHistories.map((md, i) => ({
                                    key: md.name,
                                    elm:
                                        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2} sx={{ width: '100%' }}>
                                            {selectable === true &&
                                                <Checkbox size='small' checked={selection?.find(f => f === md.name) !== undefined} onChange={(e) => setSelection((old) => {
                                                    if (old.find(f => f === md.name) !== undefined)
                                                        return old.filter(f => f !== md.name)
                                                    else
                                                        return [...old, md.name]
                                                })} />
                                            }
                                            <Typography variant='body1' sx={{ overflow: 'auto' }}>
                                                {md.name}
                                            </Typography>
                                            {deletesMedicalHistory && deletable &&
                                                <IconButton onClick={() => deleteMedicalHistory(md._id as string)}>
                                                    <TrashIcon color="red" />
                                                </IconButton>
                                            }
                                        </Stack>
                                }))}
                                withDelay={true}
                            />
                        </Paper>

                        <Divider orientation="horizontal" />

                        {selectable &&
                            <Paper sx={{ height: '48%', width: '100%', p: 2, overflow: 'auto' }} elevation={3}>
                                <AnimatedList
                                    collection={selection.map((name, i) => ({
                                        key: name,
                                        elm:
                                            <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2} sx={{ width: '100%' }}>
                                                <Typography variant='body1' sx={{ overflow: 'auto' }}>
                                                    {name}
                                                </Typography>

                                                <IconButton onClick={() => setSelection(selection.filter(f => f !== name))}>
                                                    <RemoveOutlined color="error" />
                                                </IconButton>
                                            </Stack>
                                    }))}
                                    withDelay={true}
                                />
                            </Paper>
                        }
                    </Stack>
                </Box>

                {createsMedicalHistory && creatable &&
                    <IconButton onClick={() => setCreatingMedicalHistory(true)} color="success">
                        <AddOutlined />
                    </IconButton>
                }
            </Stack >

            {/* Medical history creation, Name field */}
            < EditorModal
                open={creatingMedicalHistory}
                onClose={() => setCreatingMedicalHistory(false)
                }
                hideCanvas={true}
                title={t('MedicalHistories.creationModalTitle')}
                onSave={async (address, canvasId) => {
                    try {
                        console.group('MedicalHistories', 'Address', 'onSave')
                        console.log({ address, canvasId })

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createMedicalHistory({ name: address })
                        console.log({ res })
                        if (res.code !== 200 || !res.data.acknowledged) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('MedicalHistories.failedToUpdatePatientAddress')
                            })

                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('MedicalHistories.successfullyUpdatedPatientAddress')
                        })

                        await search()
                    }
                    finally { console.groupEnd() }
                }}
            />

            < Dialog open={dialog.open} onClose={closeDialog} >
                {
                    dialog.title &&
                    <DialogTitle>
                        {dialog.title}
                    </DialogTitle>
                }
                < DialogContent >
                    <DialogContentText whiteSpace={'break-spaces'}>
                        {dialog.content}
                    </DialogContentText>
                </DialogContent >
                <DialogActions>
                    <Button onClick={closeDialog}>{t('MedicalHistories.No')}</Button>
                    <Button onClick={async () => {
                        if (dialog.action)
                            await dialog.action()
                        closeDialog()
                    }}>
                        {t('MedicalHistories.Yes')}
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    )
}

