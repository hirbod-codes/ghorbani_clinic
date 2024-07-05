import { useState, useRef } from "react";

import { Box, Divider, IconButton, Button, Stack, TextField, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { AddOutlined, CloseOutlined } from '@mui/icons-material';

export function Diagnosis({ onChange, defaultNotes }: { defaultNotes?: string[], onChange?: (notes: string[]) => void }) {
    const [notes, setNotes] = useState<string[]>([])

    const updateNotes = (notes: string[]): void => {
        setNotes([...notes])

        if (onChange)
            onChange(notes)
    }

    const isDefaultSet = useRef(false)
    if (!isDefaultSet.current && defaultNotes) {
        setNotes([...defaultNotes]);
        isDefaultSet.current = true
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
                                        maxRows={4}
                                        fullWidth
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
                                                <CloseOutlined />
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
                    }} startIcon={<AddOutlined />}>
                        Add a note
                    </Button>
                </Stack>
            </Stack>
        </>
    )
}
