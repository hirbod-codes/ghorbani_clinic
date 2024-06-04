import { useState, useRef, useMemo, useContext, ReactNode } from 'react';
import { DataGrid, GridColDef, GridPaginationMeta, useGridApiRef, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
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

import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CheckIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import { ManagePatient } from './ManagePatient';

type Row = Patient & { visits: Visit[], id: string, actions: ReactNode[] }

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

    const [showPatient, setShowPatient] = useState(false)
    const [focusedPatient, setFocusedPatient] = useState<Row>()

    const [showLongText, setShowLongText] = useState(false)
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

    const columns: GridColDef[] = patients.length > 0 ? Object.keys(patients[patients.length - 1]).filter(k => k !== '_id').map(k => {
        const column: GridColDef = {
            field: k === '_id' ? 'id' : k,
            headerName: new StringHumanizer(k === '_id' ? 'id' : k).humanize(),
            editable: true,
        }

        switch (k) {
            case 'createdAt':
                column.type = 'number'
                column.renderCell = ({ row }) => fromUnixToFormat(locale, row[k]);
                break;

            case 'updatedAt':
                column.type = 'number'
                column.renderCell = ({ row }) => fromUnixToFormat(locale, row[k]);
                break;

            case 'birthDate':
                column.type = 'number'
                column.renderCell = ({ row }) => fromUnixToFormat(locale, row[k]);
                break;

            case 'visits':
                column.renderCell = ({ row }) => (<Button variant='text' onClick={() => { setFocusedPatient(row); setShowVisits(true); }}>visits</Button>);
                break;

            case 'medicalHistory':
                column.renderCell = ({ row }) => row[k][0] ? (<Button variant='text' onClick={() => { setLongText(row[k]); setShowLongText(true); }}>{row[k][0].slice(0, 10)}</Button>) : null;
                break;

            case 'address':
                column.renderCell = ({ row }) => (<Button variant='text' onClick={() => { setLongText([row[k]]); setShowLongText(true); }}>{row[k].slice(0, 10)}</Button>);
                break;

            case 'age':
                column.type = 'number'
                break;

            case 'socialId':
                column.type = 'string'
                break;

            case 'firstName':
                column.type = 'string'
                break;

            case 'lastName':
                column.type = 'string'
                break;

            case 'gender':
                column.type = 'string'
                break;

            default:
        }

        return column
    }) : []

    columns.push({
        field: 'actions',
        type: 'actions',
        getActions: ({ row }) => [
            <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => deletePatient(row)}
            />,
            <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => { setFocusedPatient(row); setShowPatient(true) }}
            />,
        ]
    })

    console.log('PatientDataGrid', 'columns', columns)
    console.log('PatientDataGrid', 'patients', patients)
    console.log('PatientDataGrid', 'focusedPatient', focusedPatient)

    const paginationMetaRef = useRef<GridPaginationMeta>();
    // Memoize to avoid flickering when the `hasNextPage` is `undefined` during refetch
    const paginationMeta = useMemo(() => {
        if (
            hasNextPage !== undefined &&
            paginationMetaRef.current?.hasNextPage !== hasNextPage
        )
            paginationMetaRef.current = { hasNextPage };

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

    const deletePatient = async (row: Row) => {
        let e = false
        try {
            if (!await (window as typeof window & { dbAPI: dbAPI }).dbAPI.deletePatient(row.id))
                throw new Error('failed to delete the patient.')
        } catch (error) {
            console.error(error)
            e = true
        } finally {
            if (e !== true) {
                setSnackbarSeverity('error')
                setSnackbarMessage('failed to delete the patient.')
                setOpenSnackbar(true)
            }

            setSnackbarSeverity('success')
            setSnackbarMessage('The patient was successfully deleted.')
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
                            orderedFields: ['createdAt', ...columns.map(c => c.field)]
                        },
                        pagination: {
                            rowCount: -1,
                        },
                    }}
                    density='comfortable'
                    rowSelection={false}
                    loading={isLoading}
                    paginationMeta={paginationMeta}
                    pageSizeOptions={[5, 10, 25, 50]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={(m) => { setIsLoading(true); setPaginationModel(m) }}
                />
            </div>

            <Modal onClose={() => { setShowPatient(false) }} open={showPatient} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={showPatient ? 'up' : 'down'} in={showPatient} timeout={250}>
                    <Paper sx={{ maxWidth: '80%', maxHeight: '75%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <ManagePatient inputPatient={focusedPatient} />
                    </Paper>
                </Slide>
            </Modal>

            <Modal onClose={() => { setShowVisits(false) }} open={showVisits} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={showVisits ? 'up' : 'down'} in={showVisits} timeout={250}>
                    <Paper sx={{ maxWidth: '80%', maxHeight: '75%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
                        <ManageVisits defaultVisits={focusedPatient?.visits} patientId={focusedPatient?.id} onComplete={(visits) => { updatePatientVisits(visits); setShowVisits(false) }} />
                    </Paper>
                </Slide>
            </Modal>

            <Modal onClose={() => { setShowLongText(false) }} open={showLongText} closeAfterTransition disableAutoFocus sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }} slotProps={{ backdrop: { sx: { top: '2rem' } } }}>
                <Slide direction={showLongText ? 'up' : 'down'} in={showLongText} timeout={250}>
                    <Paper sx={{ maxWidth: '80%', padding: '0.5rem 2rem', overflowY: 'auto' }}>
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
