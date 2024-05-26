import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { Stack, TextField } from '@mui/material';
import { useState } from 'react';
import type { dbAPI } from '../../../Electron/Database/renderer/dbAPI';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

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
    const [id, setId] = useState('')
    const [fileName, setFileName] = useState('')

    return (
        <>
            <Stack>
                <h1>Create patient</h1>
                <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setId(e.target.value)} id='id' value={id} label='id' fullWidth required />
                <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileName(e.target.value)} id='fileName' value={fileName} label='fileName' fullWidth required />
                <Button startIcon={<CloudDownloadIcon />} onClick={() => (window as typeof window & { dbAPI: dbAPI }).dbAPI.openFile(id, fileName)}></Button>

                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Upload file
                    <VisuallyHiddenInput type="file" onChange={async (e) => {
                        const files = []
                        for (const f of (e.target.files as unknown) as File[])
                            files.push({ fileName: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })

                        const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.uploadFiles(id, files);
                        console.log(result);
                    }} />
                </Button>
            </Stack>
        </>
    )
}