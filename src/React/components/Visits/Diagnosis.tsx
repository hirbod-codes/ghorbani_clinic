import { Box, Divider, IconButton, Stack, TextField } from "@mui/material";
import { useState } from "react";

import AddIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';

export function Diagnosis({ onChange }: { onChange: (notes: string[]) => void }) {
    const [notes, setNotes] = useState<string[]>([])

    const updateNotes = (notes: string[]): void => {
        setNotes(notes)
        onChange(notes)
    }

    return (
        <>
            <Stack direction='column' >
                {notes.map((e, i) =>
                    <Stack key={i} direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} justifyContent={'center'}>
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
                )}

                <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} justifyContent={'center'}>
                    <IconButton
                        color="success"
                        onClick={() => {
                            notes.push('')
                            updateNotes(notes)
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => {
                            notes.pop()
                            updateNotes(notes)
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </Stack>
        </>
    )
}