import Button from '@mui/material/Button';
import type { dbAPI } from '../../../Electron/Database/renderer/dbAPI';
import type { Patient } from "../../../Electron/Database/Models/Patient";
import { useState } from 'react';

import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

export function ShowPatient({ patient }: { patient: Patient | null }) {
    if (patient === null)
        return (<>{null}</>)

    const [id, setId] = useState('')
    const [fileName, setFileName] = useState('')

    return (
        <>
            <h1>Show patient</h1>
            <h2>{patient._id}</h2>
            <h2>{patient.socialId}</h2>
            <Button startIcon={<CloudDownloadIcon />} onClick={() => (window as typeof window & { dbAPI: dbAPI }).dbAPI.openFile(id, fileName)} />
        </>
    )
}