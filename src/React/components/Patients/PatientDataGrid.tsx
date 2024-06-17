import { useState, useRef, useMemo, useContext, ReactNode, useEffect } from 'react';
import { DataGrid, GridColDef, GridPaginationMeta, useGridApiRef, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import { Patient, readableFields } from '../../../Electron/Database/Models/Patient';
import type { IPatientRepository, IVisitRepository } from '../../../Electron/Database/dbAPI';
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
import type { RendererDbAPI } from '../../../Electron/Database/handleDbRendererEvents';

type Row = Patient & { visits: Visit[], id: string, actions: ReactNode[] }

export function PatientDataGrid() {
    const locale = useContext(ConfigurationContext).get.locale

    const [isLoading, setIsLoading] = useState(true)
    const [hasNextPage, setHasNextPage] = useState(true)
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const [columns, setColumns] = useState<GridColDef[] | undefined>(undefined)
    const [patients, setPatients] = useState<Patient[] | undefined>(undefined);

    const [showVisits, setShowVisits] = useState(false)

    const [showPatient, setShowPatient] = useState(false)
    const [focusedPatient, setFocusedPatient] = useState<Row>()

    const [showLongText, setShowLongText] = useState(false)
    const [longText, setLongText] = useState<string[]>([])

    console.log('PatientDataGrid', 'columns', columns)
    console.log('PatientDataGrid', 'patients', patients)
    console.log('PatientDataGrid', 'focusedPatient', focusedPatient)

    if (patients === undefined)
        (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatientsWithVisits(paginationModel.page, paginationModel.pageSize)
            .then((response: any) => {
                console.log('PatientDataGrid', 'response', response)
                if (response.code !== 200) {
                    return
                }

                const ps = (response?.data ?? []).map((p: Patient) => {
                    const entries = Object.entries(p)
                    entries.push(['id', p._id])
                    return Object.fromEntries(entries.filter(arr => arr[0] !== '_id'))
                })

                setPatients(ps)

                if (ps.length < paginationModel.pageSize)
                    setHasNextPage(false)
            })
            .catch(() => {
                setPatients([])
                setIsLoading(false);
            })

    if (patients !== undefined && columns === undefined) {
        const defaultColumn: (k: string) => GridColDef = (k) => ({
            field: k === '_id' ? 'id' : k,
            headerName: new StringHumanizer(k === '_id' ? 'id' : k).humanize(),
            editable: true,
            headerAlign: 'center',
            align: 'center',
            width: 100
        })

        const cs: GridColDef[] = []
        cs.push({
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

        let keys
        keys = ['id', 'socialId', 'firstName', 'lastName', 'age', 'gender']
        keys.forEach(k => {
            if (Object.keys(patients[0]).includes(k))
                cs.push({
                    ...defaultColumn(k),
                    type: 'string',
                })
        })

        if (Object.keys(patients[0]).includes('visits'))
            cs.push({
                ...defaultColumn('visits'),
                type: 'string',
                width: 180,
                renderCell: ({ row }) => (<Button variant='text' onClick={() => { setFocusedPatient(row); setShowVisits(true); }}>visits</Button>)
            })

        if (Object.keys(patients[0]).includes('medicalHistory'))
            cs.push({
                ...defaultColumn('medicalHistory'),
                type: 'string',
                width: 180,
                renderCell: ({ row }) => row['medicalHistory'][0] ? (<Button variant='text' onClick={() => { setLongText(row['medicalHistory']); setShowLongText(true); }}>Show</Button>) : null
            })

        if (Object.keys(patients[0]).includes('address'))
            cs.push({
                ...defaultColumn('address'),
                type: 'string',
                width: 180,
                renderCell: ({ row }) => (<Button variant='text' onClick={() => { setLongText([row['address']]); setShowLongText(true); }}>Show</Button>)
            })

        keys = ['birthDate', 'updatedAt', 'createdAt']
        keys.forEach(k => {
            if (Object.keys(patients[0]).includes(k))
                cs.push({
                    ...defaultColumn(k),
                    type: 'string',
                    width: 100,
                    renderCell: ({ row }) => fromUnixToFormat(locale, row[k], 'y/m/d')
                })
        })

        setColumns(cs)
    }

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
                if (!await (window as typeof window & { dbAPI: IVisitRepository }).dbAPI.updateVisit(visit))
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
            if (!await (window as typeof window & { dbAPI: IPatientRepository }).dbAPI.deletePatient(row.id))
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

    if (isLoading && patients && columns)
        setIsLoading(false)

    if (columns === undefined)
        return (<></>)

    return (
        <>
            <div style={{ height: '80vh', width: '100%' }}>
                <DataGrid
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
                            orderedFields: [...columns.map(c => c.field)]
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
                        <ManageVisits defaultVisits={focusedPatient?.visits} patientId={focusedPatient?.id} onChange={(visits) => { updatePatientVisits(visits); setShowVisits(false) }} />
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
