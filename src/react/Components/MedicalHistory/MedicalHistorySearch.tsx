import { Done, SearchOutlined } from "@mui/icons-material";
import { CircularProgress, IconButton, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Paper, Stack, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { t } from "i18next";
import { useContext, useMemo, useState } from "react";
import { MedicalHistory } from "../../../Electron/Database/Models/MedicalHistory";
import { mainTransition } from "../../Styles/animations";
import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { TrashIcon } from "../Icons/TrashIcon";
import { AuthContext } from "../../Contexts/AuthContext";
import { resources } from "../../../Electron/Database/Repositories/Auth/resources";
import { publish } from "../../Lib/Events";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";

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

export function MedicalHistorySearch() {
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

                <Paper sx={{ flexGrow: 2, width: '100%', overflow: 'hidden' }} elevation={3}>
                    <AnimatePresence mode='wait'>
                        <List>
                            {
                                medicalHistories.map((md, i) =>
                                    <motion.div
                                        key={i}
                                        initial='enter'
                                        animate='active'
                                        exit='exit'
                                        variants={{ ...variants }}
                                        transition={mainTransition}
                                        style={{ width: '100%' }}
                                    >
                                        <ListItem>
                                            <ListItemText primary={md.name} />

                                            {deletesMedicalHistory &&
                                                <IconButton onClick={() => deleteMedicalHistory(md._id as string)}>
                                                    <TrashIcon color="red" />
                                                </IconButton>
                                            }
                                        </ListItem>
                                    </motion.div>
                                )
                            }
                        </List>
                    </AnimatePresence>
                </Paper>
            </Stack >

            <Dialog open={dialog.open} onClose={closeDialog} >
                {dialog.title &&
                    <DialogTitle>
                        {dialog.title}
                    </DialogTitle>
                }
                <DialogContent>
                    <DialogContentText whiteSpace={'break-spaces'}>
                        {dialog.content}
                    </DialogContentText>
                </DialogContent>
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
            </Dialog>
        </>
    )
}

