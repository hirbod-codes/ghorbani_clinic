import { useState, useRef, useMemo, useContext, ReactNode } from 'react';
import { DataGrid, GridColDef, GridPaginationMeta, useGridApiRef, GridToolbar } from '@mui/x-data-grid';
import { Patient } from '../../../Electron/Database/Models/Patient';
import type { dbAPI } from '../../../Electron/Database/renderer/dbAPI';
import { StringHumanizer } from '../string-helpers';

import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Slide from '@mui/material/Slide';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import type { OverridableStringUnion } from '@mui/types/index'
import Alert, { AlertColor, AlertPropsColorOverrides } from '@mui/material/Alert';
import { fromUnixToFormat } from '../DateTime/date-time-helpers';
import { ConfigurationContext } from '../../../React/ConfigurationContext';
import type { Visit } from '../../../Electron/Database/Models/Visit';
import { ManageVisits } from '../Visits/ManageVisits';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export function PatientDataGrid() {
    const locale = useContext(ConfigurationContext).get.locale

    const apiRef = useGridApiRef();
    const [isLoading, setIsLoading] = useState(true)
    const [hasNextPage, setHasNextPage] = useState(true)
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const [patients, setPatients] = useState<Patient[]>([]);

    const [showVisits, setShowVisits] = useState(false)
    const [showLongText, setShowLongText] = useState(false)

    const [focusedPatientId, setFocusedPatientId] = useState<string>()
    const [visits, setVisits] = useState<Visit[]>([])
    const [longText, setLongText] = useState<string[]>([])

    if (isLoading)
        (window as typeof window & { dbAPI: dbAPI }).dbAPI.getPatientsWithVisits(paginationModel.page, paginationModel.pageSize)
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

                setTimeout(() => apiRef.current.autosizeColumns({
                    outliersFactor: 1,
                    includeOutliers: true,
                    includeHeaders: true,
                    expand: true,
                }), 200)
            })
            .catch(() => setIsLoading(false))

    const columns: GridColDef[] = patients.length > 0 ? Object.keys(patients[patients.length - 1]).filter(k => k !== '_id').map(k => ({
        field: k === '_id' ? 'id' : k,
        headerName: new StringHumanizer(k === '_id' ? 'id' : k).humanize(),
        editable: true,
        renderCell: ({ row, field }) => {
            if (!row[field])
                return null

            switch (field) {
                case 'createdAt':
                    return fromUnixToFormat(locale, row[field])

                case 'updatedAt':
                    return fromUnixToFormat(locale, row[field])

                case 'birthDate':
                    return fromUnixToFormat(locale, row[field])

                case 'visits':
                    return (<Button variant='text' onClick={() => { setFocusedPatientId(row['id']); setVisits(row[field]); setShowVisits(true) }}>visits</Button>)

                case 'medicalHistory':
                    return row[field][0] ? (<Button variant='text' onClick={() => { setLongText(row[field]); setShowLongText(true) }}>{row[field][0].slice(0, 10)}</Button>) : null

                case 'address':
                    return (<Button variant='text' onClick={() => { setLongText(row[field]); setShowLongText(true) }}>{row[field].slice(0, 10)}</Button>)

                default:
                    return row[field]
            }
        }
    })) : []

    console.log('PatientDataGrid', 'columns', columns)
    console.log('PatientDataGrid', 'patients', patients)
    console.log('PatientDataGrid', 'visits', visits, 'focusedPatientId', focusedPatientId)

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

    const updatePatientVisits = async (visits: Visit[]) => {
        let e = false
        try {
            for (const visit of visits)
                if (!await (window as typeof window & { dbAPI: dbAPI }).dbAPI.updateVisit(visit))
                    throw new Error('failed to update the patient\'s visits.')
        } catch (error) {
            console.error(error)
            e = true
        } finally {
            if (e !== true) {
                setSnackbarSeverity('error')
                setSnackbarMessage('failed to register the patient.')
                setOpenSnackbar(true)
            }

            setSnackbarSeverity('success')
            setSnackbarMessage('The patient was successfully registered.')
            setOpenSnackbar(true)
        }
    }

    const [openSnackbar, setOpenSnackbar] = useState(true)
    const [snackbarSeverity, setSnackbarSeverity] = useState<OverridableStringUnion<AlertColor, AlertPropsColorOverrides>>('info')
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarAction] = useState<ReactNode | null>(null)

    return (
        <>
            <div style={{ height: 400, width: '100%' }}>
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
                                schemaVersion: false,
                            },
                            orderedFields: ['Created at']
                        },
                        pagination: {
                            rowCount: -1,
                        },
                    }}
                    density='comfortable'
                    loading={isLoading}
                    paginationMeta={paginationMeta}
                    pageSizeOptions={[5, 10, 25, 50]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={(m) => { setIsLoading(true); setPaginationModel(m) }}
                />
            </div>

            <Modal onClose={() => { setShowVisits(false) }} open={showVisits} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={showVisits ? 'up' : 'down'} in={showVisits} timeout={250}>
                    <Paper sx={{ maxWidth: '40rem', width: '60%', maxHeight: '75%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <ManageVisits defaultVisits={visits} patientId={focusedPatientId} onComplete={() => { updatePatientVisits(visits); setShowVisits(false) }} />
                    </Paper>
                </Slide>
            </Modal>

            <Modal onClose={() => { setShowLongText(false) }} open={showLongText} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={showLongText ? 'up' : 'down'} in={showLongText} timeout={250}>
                    <Paper sx={{ maxWidth: '40rem', width: '60%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        {longText.map((t, i) => (
                            <h3 key={i}>{t}</h3>
                        ))}
                    </Paper>
                </Slide>
            </Modal>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={7000}
                onClose={() => setOpenSnackbar(false)}
                action={snackbarAction}
            >
                <Alert icon={snackbarSeverity === 'success' ? <CheckIcon fontSize="inherit" /> : (snackbarSeverity === 'error' ? <CloseIcon fontSize="inherit" /> : null)} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
