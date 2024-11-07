import { Done, DoneOutline, RemoveOutlined, SearchOutlined } from "@mui/icons-material";
import { Box, CircularProgress, IconButton, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Paper, Stack, TextField } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { t } from "i18next";
import { useState } from "react";
import { MedicalHistory } from "../../../Electron/Database/Models/MedicalHistory";
import { mainTransition } from "../../Styles/animations";
import { RendererDbAPI } from "src/Electron/Database/renderer";
import { publish } from "src/react/Lib/Events";
import { RESULT_EVENT_NAME } from "src/react/Contexts/ResultWrapper";
import { TrashIcon } from "../Icons/TrashIcon";

const xOffset = 100;
const variants = {
    enter: {
        name: 'enter',
        x: -xOffset.toString() + '%',
        transition: mainTransition
    },
    active: {
        name: 'active',
        x: 0,
        transition: { ...mainTransition, delay: 0.5 }
    },
    exit: {
        name: 'exit',
        x: xOffset.toString() + '%',
        transition: mainTransition
    }
};

export function MedicalHistorySearch() {
    const [searchStr, setSearchStr] = useState<string>('')
    const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([])

    const [isSearching, setIsSearching] = useState<boolean>(false)

    const search = async () => {
        setIsSearching(true)

        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.searchMedicalHistories(searchStr)
        console.log({ res })

        if (res.code !== 200 || !res.data)
            return false

        setMedicalHistories(res.data)

        setIsSearching(false)

        return true
    }

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
                    <AnimatePresence>
                        <List>
                            {
                                medicalHistories.map((md, i) =>
                                    <motion.div
                                        key={i}
                                        initial='enter'
                                        animate='active'
                                        exit='exit'
                                        variants={variants}
                                        transition={mainTransition}
                                        style={{ width: '100%' }}
                                    >
                                        <ListItem>
                                            <ListItemText primary={md.name} />
                                            <ListItemIcon>
                                                <TrashIcon color="red" />
                                            </ListItemIcon>
                                        </ListItem>
                                    </motion.div>
                                )
                            }
                        </List>
                    </AnimatePresence>
                </Paper>
            </Stack>
        </>
    )
}

