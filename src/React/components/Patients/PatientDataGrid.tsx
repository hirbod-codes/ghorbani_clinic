import { useState, useRef, useMemo } from 'react';
import { DataGrid, GridAutosizeOptions, GridColDef, GridPaginationMeta, useGridApiRef, GridToolbar } from '@mui/x-data-grid';
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
                const patients = JSON.parse(patientsJson)
                for (const patient of patients) {
                    patient.id = patient._id
                    delete patient._id
                }
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
    if (apiRef.current.autosizeColumns)
        apiRef.current.autosizeColumns(autosizeOptions)
    return (
        <div style={{ height: 400, width: '100%' }}>
            <Stack spacing={1} direction="row" sx={{ mb: 1 }} flexWrap="wrap" >
                <Button variant="outlined" onClick={() => apiRef.current.autosizeColumns(autosizeOptions)}>
                    Resize
                </Button>
                <FormControlLabel sx={{ ml: 0 }} label="Include headers"
                    control={
                        <Checkbox
                            checked={autosizeOptions.includeHeaders}
                            onChange={(ev) => setAutosizeOptions({ ...autosizeOptions, includeHeaders: ev.target.checked })}
                        />
                    }
                />
                <FormControlLabel sx={{ ml: 0 }} label="Include outliers"
                    control={
                        <Checkbox
                            checked={autosizeOptions.includeOutliers}
                            onChange={(ev) => setAutosizeOptions({ ...autosizeOptions, includeOutliers: ev.target.checked })}
                        />
                    }
                />
                <TextField size="small" variant='standard' label="Outliers factor" value={autosizeOptions.outliersFactor} sx={{ width: '12ch' }}
                    onChange={(ev) => setAutosizeOptions({ ...autosizeOptions, outliersFactor: Number(ev.target.value) })}
                />
                <FormControlLabel sx={{ ml: 0 }} label="Expand"
                    control={
                        <Checkbox
                            checked={autosizeOptions.expand}
                            onChange={(ev) => setAutosizeOptions({ ...autosizeOptions, expand: ev.target.checked })}
                        />
                    }
                />
            </Stack>
            <DataGrid
                apiRef={apiRef}
                slots={{
                    toolbar: GridToolbar,
                }}
                rows={patients}
                rowCount={-1}
                columns={columns}
                initialState={{
                    columns: {
                        columnVisibilityModel: {
                            id: false,
                        },
                        orderedFields: ['Created at']
                    },
                    pagination: {
                        rowCount: -1,
                    },
                    density: 'comfortable'
                }}
                paginationMeta={paginationMeta}
                loading={isLoading}
                pageSizeOptions={[5, 10, 25, 50]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={(m) => { setIsLoading(true); setPaginationModel(m) }}
            />
        </div>
    );
}
