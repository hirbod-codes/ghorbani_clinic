import { Box, Divider, IconButton, Button, Stack, TextField, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";

import AddIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';

export function Diagnosis({ onChange }: { onChange?: (notes: string[]) => void }) {
    const [notes, setNotes] = useState<string[]>([])

    const updateNotes = (notes: string[]): void => {
        setNotes([...notes])

        if (onChange)
            onChange(notes)
    }

    return (
        <>
            <Stack direction='column' >
                <List>
                    {notes.map((e, i) =>
                        <ListItem key={i}>
                            <ListItemIcon>{i + 1}</ListItemIcon>
                            <ListItemText primary={
                                <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} justifyContent={'center'}>
                                    <TextField
                                        variant='standard'
                                        value={notes[i] ?? ''}
                                        multiline
                                        onChange={(e) => {
                                            notes[i] = e.target.value
                                            updateNotes(notes)
                                        }}
                                    />
                                    <Stack direction='column' spacing={1} justifyContent={'center'}>
                                        <Box>
                                            <IconButton
                                                color="error"
                                                onClick={() => updateNotes(notes.filter((_n, ii) => ii !== i))}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </Box>
                                    </Stack>
                                </Stack>
                            } />
                        </ListItem>
                    )}
                </List>

                <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} justifyContent={'center'}>
                    <Button variant="text" onClick={() => {
                        notes.push('')
                        updateNotes(notes)
                    }} startIcon={<AddIcon />}>
                        Add a note
                    </Button>
                </Stack>
            </Stack>
        </>
    )
}