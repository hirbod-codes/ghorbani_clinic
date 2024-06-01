import { styled } from '@mui/material/styles';
import { Grid, Modal, Paper, Button, Stack, TextField, Select, MenuItem, ButtonGroup, InputLabel, FormControl, Divider, Slide, List, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { useState, useContext } from 'react';
// import type { dbAPI } from '../../../Electron/Database/renderer/dbAPI';
import { DateTime } from 'luxon'

import AddIcon from '@mui/icons-material/AddOutlined';

import { fromDateTime, fromDateTimeParts, getLocaleMonths, persianToGregorian, toFormat } from '../DateTime/date-time-helpers';
import type { PersianDate } from '../DateTime/date-time';
import { ConfigurationContext } from '../../ConfigurationContext';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

type Birth = {
    age: number,
    year: number,
    month: number,
    day: number,
    birthDateTimestamp: number,
}

type VisitDue = {
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    visitTimestamp: number,
}

export function CreatePatient() {
    const locale = useContext(ConfigurationContext).get.locale
    const localeMonths = getLocaleMonths(locale, DateTime.local({ zone: locale.zone }).year)

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')

    const [socialId, setSocialId] = useState<number>(undefined)
    const [socialIdError, setSocialIdError] = useState<boolean>(false)

    const [gender, setGender] = useState('')

    const [birth, setBirth] = useState<Birth>({ age: undefined, birthDateTimestamp: undefined, year: undefined, month: undefined, day: undefined })
    const setBirthDate = (birth: Birth) => {
        const date: PersianDate = { year: birth.year, month: birth.month, day: birth.day }

        const convertedDate = fromDateTimeParts(
            { ...locale, calendar: 'Gregorian' },
            locale,
            date
        )

        const now = DateTime.local({ zone: locale.zone })
        const today = fromDateTime(
            { ...locale },
            'Gregorian',
            now
        )

        setBirth({
            year: birth.year,
            month: birth.month,
            day: birth.day,
            age: today.date.year - convertedDate.date.year,
            birthDateTimestamp: now.toUnixInteger(),
        })
    }

    const [openVisitShowModal, setOpenVisitShowModal] = useState(false)
    const [openVisitCreateModal, setOpenVisitCreateModal] = useState(false)
    const [visitDues, setVisitDues] = useState<VisitDue[]>([])

    const now = DateTime.local({ zone: locale.zone })
    const today = fromDateTime(
        { ...locale },
        'Gregorian',
        now
    )
    console.log('now', now);
    console.log('today', today);
    const defaultVisitDue: VisitDue = {
        year: today.date.year,
        month: today.date.month,
        day: today.date.day,
        hour: today.time.hour,
        minute: today.time.minute,
        second: today.time.second,
        visitTimestamp: now.toUnixInteger(),
    }
    console.log('defaultVisitDue', defaultVisitDue);
    const [addingVisitDue, setAddingVisitDue] = useState<VisitDue>(defaultVisitDue)
    console.log(`${addingVisitDue.hour}:${addingVisitDue.minute}:${addingVisitDue.second}`)

    const [files, setFiles] = useState([])

    const submit = () => {
        // const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.uploadFiles(id, files);
        // console.log(result);
    }

    return (
        <>
            <Stack justifyContent={'space-around'} sx={{ height: '100%', width: '100%' }}>
                <h1>Register patient</h1>
                <Grid container spacing={2} >
                    <Grid item>
                        {/* First name */}
                        <TextField variant='standard' onChange={(e) => setFirstName(e.target.value)} id='firstName' value={firstName} label='firstName' sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item>
                        {/* Last name */}
                        <TextField variant='standard' onChange={(e) => setLastName(e.target.value)} id='lastName' value={lastName} label='lastName' sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item>
                        {/* Social Id */}
                        <TextField variant='standard' onChange={(e) => {
                            const s = e.target.value
                            console.log(s);
                            if (s.length !== 10)
                                setSocialIdError(true)
                            else
                                setSocialIdError(false)

                            setSocialId(Number(s))
                        }} id='socialId' value={socialId} label='socialId' type='number' sx={{ width: '7rem' }} error={socialIdError} helperText={socialIdError ? 'must have 10 digits' : ''} />
                    </Grid>
                    <Grid item>
                        {/* Gender */}
                        <FormControl variant='standard' >
                            <InputLabel id="gender-label">Gender</InputLabel>
                            <Select onChange={(e) => setGender(e.target.value as 'male' | 'female')} labelId="gender-label" id='gender' value={gender} sx={{ width: '7rem' }} >
                                <MenuItem value='male'>male</MenuItem>
                                <MenuItem value='female'>female</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        {/* Age */}
                        <TextField variant='standard' id='age' value={birth.age === undefined || birth.age <= 0 ? '' : birth.age} label='age' type='number' sx={{ width: '7rem' }} disabled />
                    </Grid>
                    <Grid item>
                        {/* Birth Date */}
                        <ButtonGroup variant="text" >
                            <TextField variant='standard' onChange={(e) => {
                                try {
                                    if (birth.month === undefined || birth.day === undefined)
                                        setBirth({ ...birth, year: Number(e.target.value) })
                                    else
                                        setBirthDate({ ...birth, year: Number(e.target.value) })
                                } catch (error) { console.error('year', error); return }
                            }} id='birthDateYear' value={birth.year === undefined ? '' : birth.year} label='Year' sx={{ width: '7rem' }} type='number' />
                            <FormControl variant='standard' >
                                <InputLabel id="month-label">Month</InputLabel>
                                <Select onChange={(e) => {
                                    try {
                                        if (birth.year === undefined || birth.day === undefined)
                                            setBirth({ ...birth, month: localeMonths.findIndex(m => m.name === e.target.value.toString()) + 1 })
                                        else
                                            setBirthDate({ ...birth, month: localeMonths.findIndex(m => m.name === e.target.value.toString()) + 1 })
                                    } catch (error) { console.error('month', error); return }
                                }} labelId="month-label" id='birthDateMonth' value={birth.month === undefined ? '' : localeMonths[birth.month - 1].name} sx={{ width: '7rem' }} >
                                    {localeMonths.map((m, i) =>
                                        <MenuItem key={i} value={m.name}>{m.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <TextField variant='standard' onChange={(e) => {
                                try {
                                    if (birth.year === undefined || birth.month === undefined)
                                        setBirth({ ...birth, day: Number(e.target.value) })
                                    else
                                        setBirthDate({ ...birth, day: Number(e.target.value) })
                                } catch (error) { console.error('day', error); return }
                            }} id='birthDateDay' value={birth.day === undefined ? '' : birth.day} label='Day' sx={{ width: '7rem' }} type='number' />
                        </ButtonGroup>
                    </Grid>
                    <Grid item>
                        {/* Visit Controls */}
                        <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} >
                            {visitDues.length !== 0 &&
                                <Button variant="text" onClick={() => setOpenVisitShowModal(true)}>
                                    Show visits
                                </Button>
                            }
                            <Button variant="text" onClick={() => setOpenVisitCreateModal(true)} startIcon={<AddIcon />}>
                                Add a visit
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        {/* Files */}
                        <Stack direction='row' spacing={1} divider={<Divider orientation='vertical' variant='middle' flexItem />} >
                            {files.length !== 0 &&
                                <Button disabled variant='text'>
                                    {files.length} files are added
                                </Button>
                            }
                            <Button
                                component="label"
                                role={undefined}
                                variant="text"
                                tabIndex={-1}
                                startIcon={<AddIcon />}
                            >
                                Add file
                                <VisuallyHiddenInput type="file" multiple={true} onChange={async (e) => {
                                    const fs: { fileName: string, bytes: Uint8Array }[] = []
                                    for (const f of (e.target.files as unknown) as File[])
                                        fs.push({ fileName: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })

                                    setFiles(fs)
                                }} />
                            </Button>
                            {files.length !== 0 &&
                                <Button variant="text" onClick={() => setFiles([])}>
                                    reset files
                                </Button>
                            }
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                    </Grid>
                    <Grid item xs={12}>
                        {/* Submit */}
                        <Button variant="contained" onClick={submit} fullWidth>
                            submit
                        </Button>
                    </Grid>
                </Grid>
            </Stack>
            {/* Show Visits */}
            <Modal open={openVisitShowModal} onClose={() => setOpenVisitShowModal(false)} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={openVisitShowModal ? 'up' : 'down'} in={openVisitShowModal} timeout={250}>
                    <Paper sx={{ maxWidth: '40rem', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <List dense>
                            {visitDues.map((e, i) =>
                                <ListItemButton key={i}>
                                    <ListItemIcon>{i + 1}</ListItemIcon>
                                    <ListItemText primary={toFormat({ date: { year: e.year, month: e.month, day: e.day }, time: { hour: 0, minute: 0, second: 0 } }, locale, 'cccc d/M/y')} />
                                </ListItemButton>
                            )}
                        </List>
                    </Paper>
                </Slide>
            </Modal>
            {/* Create Visit */}
            <Modal open={openVisitCreateModal} onClose={() => setOpenVisitCreateModal(false)} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={openVisitCreateModal ? 'up' : 'down'} in={openVisitCreateModal} timeout={250}>
                    <Paper sx={{ maxWidth: '40rem', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <ButtonGroup variant="text" >
                            <TextField variant='standard' onChange={(e) => {
                                try {
                                    setAddingVisitDue({ ...addingVisitDue, year: Number(e.target.value) })
                                } catch (error) { console.error('year', error); return }
                            }} id='visitDueYear' value={addingVisitDue.year === undefined ? '' : addingVisitDue.year} label='Year' sx={{ width: '7rem' }} type='number' />
                            <FormControl variant='standard' >
                                <InputLabel id="month-label">Month</InputLabel>
                                <Select onChange={(e) => {
                                    try {
                                        setAddingVisitDue({ ...addingVisitDue, month: localeMonths.findIndex(m => m.name === e.target.value.toString()) + 1 })
                                    } catch (error) { console.error('month', error); return }
                                }} labelId="month-label" id='visitDueMonth' value={addingVisitDue.month === undefined ? '' : localeMonths[addingVisitDue.month - 1].name} sx={{ width: '7rem' }} >
                                    {localeMonths.map((m, i) =>
                                        <MenuItem key={i} value={m.name}>{m.name}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <TextField variant='standard' onChange={(e) => {
                                try {
                                    setAddingVisitDue({ ...addingVisitDue, day: Number(e.target.value) })
                                } catch (error) { console.error('day', error); return }
                            }} id='visitDueDay' value={addingVisitDue.day === undefined ? '' : addingVisitDue.day} label='Day' sx={{ width: '7rem' }} type='number' />
                        </ButtonGroup>
                        <TextField
                            type='time'
                            id='visitDueTime'
                            label='Time'
                            variant='standard'
                            inputProps={{ step: '1' }}
                            value={addingVisitDue.hour === undefined ? '' : `${addingVisitDue.hour.toString().padStart(2, '0')}:${addingVisitDue.minute.toString().padStart(2, '0')}:${addingVisitDue.second.toString().padStart(2, '0')}`}
                            onChange={(e) => setAddingVisitDue({ ...addingVisitDue, hour: Number(e.target.value.split(':')[0]), minute: Number(e.target.value.split(':')[1]), second: Number(e.target.value.split(':')[2]), })}
                            sx={{ width: '7rem' }}
                        />
                        <IconButton color='primary' onClick={() => {
                            const date = persianToGregorian({ year: addingVisitDue.year, month: addingVisitDue.month, day: addingVisitDue.day })
                            const convertedDate = DateTime.fromFormat(`${date.year}/${date.month}/${date.day}`, 'y/M/d', { zone: 'Asia/Tehran' })
                            const visitDue: VisitDue = {
                                ...addingVisitDue,
                                hour: addingVisitDue.hour,
                                minute: addingVisitDue.minute,
                                second: addingVisitDue.second,
                                visitTimestamp: convertedDate.setZone('UTC').toUnixInteger()
                            }
                            visitDues.push(visitDue)
                            setVisitDues(visitDues)
                            setOpenVisitCreateModal(false)
                        }} >
                            <AddIcon />
                        </IconButton>
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}