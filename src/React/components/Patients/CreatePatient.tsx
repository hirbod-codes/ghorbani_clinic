import { styled } from '@mui/material/styles';
import { Grid, Button, Stack, TextField, Select, MenuItem, ButtonGroup, InputLabel, FormControl } from '@mui/material';
import { useState } from 'react';
import type { dbAPI } from '../../../Electron/Database/renderer/dbAPI';
import { DateTime } from 'luxon'

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import { persionToGregorian } from '../time-helpers';
import { PERSIAN_MONTHS_EN, PersianDate, leap_persian, persian_to_jd, validatePersianDate } from '../persian-calendar';
import { jd_to_gregorian, leap_gregorian } from '../gregorian-calendar';

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

export function CreatePatient() {
    // let g_year = 2025, p_year = 1404
    // const years = []
    // for (let i = 0; i < 100; i++) {
    //     years.push({
    //         g_year: g_year,
    //         g_year_leap: leap_gregorian(g_year),
    //         p_year: p_year,
    //         p_year_leap: leap_persian(p_year)
    //     })
    //     g_year--
    //     p_year--
    // }
    // console.log(years);
    // console.log(years.filter(e => e.g_year_leap || e.p_year_leap));

    const [id, setId] = useState('')

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [socialId, setSocialId] = useState<number>(undefined)
    const [gender, setGender] = useState('')
    const [age, setAge] = useState<number>(0)

    const [birthDate, setBirthDate] = useState<number>(undefined)
    const [birthDateYear, setBirthDateYear] = useState('')
    const [birthDateMonth, setBirthDateMonth] = useState('')
    const [birthDateDay, setBirthDateDay] = useState('')
    const setBirthDateIfPossible = () => {
        let date: PersianDate
        try {
            const year = Number(birthDateYear)
            const month = PERSIAN_MONTHS_EN.indexOf(birthDateMonth)
            const day = Number(birthDateDay) - 1
            date = { year, month, day }
            validatePersianDate(date)
        } catch (error) { return }

        const rawConvertedDate = jd_to_gregorian(persian_to_jd(date))

        const convertedDate = DateTime.fromFormat(`${rawConvertedDate.year}/${rawConvertedDate.month + 1}/${rawConvertedDate.day + 1}`, 'yyyy/MMMM/d', { zone: 'Asia/Tehran' })
        console.log('convertedDate', convertedDate.toLocaleString(DateTime.DATETIME_FULL), convertedDate.toUnixInteger());

        setBirthDate(convertedDate.toUnixInteger())
    }
    setBirthDateIfPossible()

    const [visitDues, setVisitDues] = useState<number[]>([])

    const [files, setFiles] = useState([])

    const [socialIdError, setSocialIdError] = useState<boolean>(false)
    const [ageError, setAgeError] = useState<boolean>(false)

    return (
        <>
            <Stack justifyContent={'space-around'} sx={{ height: '100%', width: '100%' }}>
                <h1>Create patient</h1>
                <Grid container spacing={2} >
                    <Grid item>
                        <TextField variant='standard' onChange={(e) => setFirstName(e.target.value)} id='firstName' value={firstName} label='firstName' sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item>
                        <TextField variant='standard' onChange={(e) => setLastName(e.target.value)} id='lastName' value={lastName} label='lastName' sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item>
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
                        <FormControl variant='standard' >
                            <InputLabel id="gender-label">Gender</InputLabel>
                            <Select onChange={(e) => {
                                if (['male', 'female'].includes(e.target.value)) {
                                    setAgeError(false)
                                    setGender(e.target.value as 'male' | 'female')
                                } else
                                    setAgeError(true)
                            }} labelId="gender-label" id='gender' value={gender} sx={{ width: '7rem' }} >
                                <MenuItem value='male'>male</MenuItem>
                                <MenuItem value='female'>female</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <TextField variant='standard' onChange={(e) => {
                            const age = Number(e.target.value)
                            if (age <= 150 || age >= 0) {
                                setAgeError(false)
                                setAge(age)
                            }
                            else
                                setAgeError(true)
                        }} id='age' value={age} label='age' type='number' error={ageError} helperText={ageError ? 'Age must be between 0 and 150' : ''} sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item>
                        <ButtonGroup variant="text" >
                            <TextField variant='standard' onChange={(e) => { setBirthDateYear(e.target.value) }} id='birthDateYear' value={birthDateYear} label='Year' sx={{ width: '7rem' }} />
                            <FormControl variant='standard' >
                                <InputLabel id="month-label">Month</InputLabel>
                                <Select onChange={(e) => { setBirthDateMonth(e.target.value) }} labelId="month-label" id='birthDateMonth' value={birthDateMonth} sx={{ width: '7rem' }} >
                                    {PERSIAN_MONTHS_EN.map((m, i) =>
                                        <MenuItem key={i} value={m}>{m}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <TextField variant='standard' onChange={(e) => { setBirthDateDay(e.target.value) }} id='birthDateDay' value={birthDateDay} label='Day' sx={{ width: '7rem' }} />
                        </ButtonGroup>
                    </Grid>
                    <Grid item>
                        <TextField variant='standard' onChange={() => {
                            //
                        }} id='visitDues' value={visitDues} label='visitDues' sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item xs={12}>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                        >
                            Upload file
                            <VisuallyHiddenInput type="file" multiple={true} onChange={async (e) => {
                                const fs: { fileName: string, bytes: Uint8Array }[] = []
                                for (const f of (e.target.files as unknown) as File[])
                                    fs.push({ fileName: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })

                                setFiles(fs)

                                // const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.uploadFiles(id, files);
                                // console.log(result);
                            }} />
                        </Button>
                    </Grid>
                </Grid>
            </Stack>
        </>
    )
}