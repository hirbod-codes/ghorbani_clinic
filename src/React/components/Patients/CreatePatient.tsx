import { styled } from '@mui/material/styles';
import { Grid, Button, Stack, TextField, Select, MenuItem, FormControlLabel, FormGroup, ButtonGroup, InputLabel, FormControl } from '@mui/material';
import { useState } from 'react';
import type { dbAPI } from '../../../Electron/Database/renderer/dbAPI';
import { DateTime } from 'luxon'

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { PERSIAN_MONTHS_EN, jd_to_gregorian, leap_gregorian, leap_persian, persian_to_jd } from '../time-helpers';

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
    console.log(DateTime.utc().reconfigure({ outputCalendar: 'persian' }).setZone('Asia/Tehran').toLocaleString(DateTime.DATETIME_FULL));
    console.log(DateTime.fromFormat('1403/3/7 15:30:00', 'd/MMMM/y HH:mm:ss z', { zone: 'Asia/Tehran', outputCalendar: 'persian' }).toLocaleString(DateTime.DATETIME_FULL))

    let g_year = 2024, p_year = 1403
    const years = []
    for (let i = 0; i < 100; i++) {
        years.push({
            g_year: g_year,
            g_year_leap: leap_gregorian(g_year),
            p_year: p_year,
            p_year_leap: leap_persian(p_year)
        })
        g_year--
        p_year--
    }
    console.log(years);
    console.log(years.filter(e => e.g_year_leap || e.p_year_leap));



    const [id, setId] = useState('')

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [socialId, setSocialId] = useState<number>(undefined)
    const [gender, setGender] = useState('')
    const [age, setAge] = useState<number>(0)
    const [birthDate, setBirthDate] = useState<Date>(new Date())
    const [birthDateYear, setBirthDateYear] = useState('')
    const [birthDateMonth, setBirthDateMonth] = useState('')
    const [birthDateDay, setBirthDateDay] = useState('')
    const setBirthDateIfPossible = () => {
        if (birthDateYear && birthDateMonth && birthDateDay) {
            const year = Number(birthDateYear)
            const month = Number(PERSIAN_MONTHS_EN.indexOf(birthDateMonth) + 1)
            const day = Number(birthDateDay)
            const convertedDate = jd_to_gregorian(persian_to_jd(year, month, day))
            console.log('convertedDate', convertedDate);
        }
    }

    const [medicalHistory, setMedicalHistory] = useState<string[]>([])
    const [diagnosis, setDiagnosis] = useState<string[]>([])

    const [visitDues, setVisitDues] = useState<Date[]>([])

    const [createdAt, setCreatedAt] = useState<Date>(new Date())
    const [updatedAt, setUpdatedAt] = useState<Date>(new Date())

    const [files, setFiles] = useState([])

    // const [firstNameError, setFirstNameError] = useState<boolean>(false)
    // const [lastNameError, setLastNameError] = useState<boolean>(false)
    const [socialIdError, setSocialIdError] = useState<boolean>(false)
    // const [genderError, setGenderError] = useState<boolean>(false)
    const [ageError, setAgeError] = useState<boolean>(false)
    // const [birthDateError, setBirthDateError] = useState<boolean>(false)
    // const [medicalHistoryError, setMedicalHistoryError] = useState<boolean>(false)
    // const [diagnosisError, setDiagnosisError] = useState<boolean>(false)
    // const [visitDuesError, setVisitDuesError] = useState<boolean>(false)
    // const [createdAtError, setCreatedAtError] = useState<boolean>(false)
    // const [updatedAtError, setUpdatedAtError] = useState<boolean>(false)

    return (
        <>
            <Stack>
                <h1>Create patient</h1>
                <Grid container spacing={2}>
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
                        }} id='socialId' value={socialId} label='socialId' type='number' sx={{ width: '7rem' }} />
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
                            <TextField variant='standard' onChange={(e) => { setBirthDateYear(e.target.value); setBirthDateIfPossible() }} id='birthDateYear' value={birthDateYear} label='Year' sx={{ width: '7rem' }} />
                            <FormControl variant='standard' >
                                <InputLabel id="month-label">Month</InputLabel>
                                <Select onChange={(e) => { setBirthDateMonth(e.target.value); setBirthDateIfPossible() }} labelId="month-label" id='birthDateMonth' value={birthDateMonth} sx={{ width: '7rem' }} >
                                    {PERSIAN_MONTHS_EN.map((m, i) =>
                                        <MenuItem key={i} value={m}>{m}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            {/* <Select variant='standard' onChange={(e) => { setBirthDateMonth(e.target.value); setBirthDateIfPossible() }} id='birthDateMonth' value={birthDateMonth} label='Month' sx={{ width: '7rem' }} >
                                {PERSIAN_MONTHS_EN.map((m, i) =>
                                    <MenuItem key={i} value={m}>{m}</MenuItem>
                                )}
                            </Select> */}
                            <TextField variant='standard' onChange={(e) => { setBirthDateDay(e.target.value); setBirthDateIfPossible() }} id='birthDateDay' value={birthDateDay} label='Day' sx={{ width: '7rem' }} />
                        </ButtonGroup>
                    </Grid>
                    <Grid item>
                        <TextField variant='standard' onChange={() => {
                            //
                        }} id='visitDues' value={visitDues} label='visitDues' sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item xs={12}>
                    </Grid>
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload file
                        <VisuallyHiddenInput type="file" multiple={true} onChange={async (e) => {
                            const fs = []
                            for (const f of (e.target.files as unknown) as File[])
                                fs.push({ fileName: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })

                            setFiles(fs)

                            const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.uploadFiles(id, files);
                            console.log(result);
                        }} />
                    </Button>
                </Grid>

            </Stack>
        </>
    )
}