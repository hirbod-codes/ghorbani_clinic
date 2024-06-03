import { useState, useRef, useMemo } from 'react';
import { DataGrid, GridColDef, GridPaginationMeta, useGridApiRef } from '@mui/x-data-grid';
import { Patient } from '../../../Electron/Database/Models/Patient';
import type { dbAPI } from '../../../Electron/Database/renderer/dbAPI';
import { StringHumanizer } from '../string-helpers';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export function PatientDataGrid() {
    const [isLoading, setIsLoading] = useState(true)
    const [hasNextPage, setHasNextPage] = useState(true)
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const [patients, setPatients] = useState<Patient[]>([]);

    if (isLoading)
        (window as typeof window & { dbAPI: dbAPI }).dbAPI.getPatients(paginationModel.page, paginationModel.pageSize)
            .then((patientsJson) => {
                const patients = JSON.parse(patientsJson).map((p: Patient) => ({ id: p._id, schemaVersion: p.schemaVersion, medicalHistory: p.medicalHistory }))
                // for (const patient of patients) {
                //     patient.id = patient._id
                //     delete patient._id
                // }
                setPatients(patients)
                if (patients.length < paginationModel.pageSize)
                    setHasNextPage(false)
                setIsLoading(false)
            })
            .catch(() => setIsLoading(false))

    const columns: GridColDef[] = patients.length > 0 ? Object.keys(patients[0]).filter(k => k !== '_id').map(k => ({
        type: 'string',
        field: k === '_id' ? 'id' : k,
        headerName: new StringHumanizer(k === '_id' ? 'id' : k).humanize(),
        editable: true,
        align: 'left',
    })) : []

    console.log('columns', columns)
    console.log('patients', patients)

    const paginationMetaRef = useRef<GridPaginationMeta>();

    // Memoize to avoid flickering when the `hasNextPage` is `undefined` during refetch
    const paginationMeta = useMemo(() => {
        if (
            hasNextPage !== undefined &&
            paginationMetaRef.current?.hasNextPage !== hasNextPage
        ) {
            paginationMetaRef.current = { hasNextPage };
        }
        return paginationMetaRef.current;
    }, [hasNextPage]);

    const apiRef = useGridApiRef();
    const [autosizeOptions, setAutosizeOptions] = useState<GridAutosizeOptions>({
        outliersFactor: 1,
        includeOutliers: true,
        includeHeaders: true,
        expand: true,
    })

    return (
        <div style={{ height: 400, width: '100%' }}>
            <Stack
                spacing={1}
                direction="row"
                alignItems="center"
                sx={{ mb: 1 }}
                useFlexGap
                flexWrap="wrap"
            >
                <Button
                    variant="outlined"
                    onClick={() => apiRef.current.autosizeColumns(autosizeOptions)}
                >
                    Autosize columns
                </Button>
                <FormControlLabel
                    sx={{ ml: 0 }}
                    control={
                        <Checkbox
                            checked={includeHeaders}
                            onChange={(ev) => setIncludeHeaders(ev.target.checked)}
                        />
                    }
                    label="Include headers"
                />
                <FormControlLabel
                    sx={{ ml: 0 }}
                    control={
                        <Checkbox
                            checked={includeOutliers}
                            onChange={(event) => setExcludeOutliers(event.target.checked)}
                        />
                    }
                    label="Include outliers"
                />
                <TextField
                    size="small"
                    label="Outliers factor"
                    value={outliersFactor}
                    onChange={(ev) => setOutliersFactor(ev.target.value)}
                    sx={{ width: '12ch' }}
                />
                <FormControlLabel
                    sx={{ ml: 0 }}
                    control={
                        <Checkbox
                            checked={expand}
                            onChange={(ev) => setExpand(ev.target.checked)}
                        />
                    }
                    label="Expand"
                />
            </Stack>
            <DataGrid
                apiRef={apiRef}
                rows={patients}
                rowCount={-1}
                columns={columns}
                autosizeOptions={autosizeOptions}
                // initialState={{ ...data.initialState, pagination: { rowCount: -1 } }}
                paginationMeta={paginationMeta}
                loading={isLoading}
                pageSizeOptions={[5, 10, 25, 50]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={(m, d) => { setIsLoading(true); setPaginationModel(m) }}
                density="compact"
            />
        </div>
    );
}
