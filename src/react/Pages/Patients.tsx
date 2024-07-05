import { useState, useContext, useEffect, useRef } from "react";
import { DataGrid } from "../Components/DataGrid/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { ResultContext } from "../Contexts/ResultContext";
import { t } from "i18next";
import { Button, CircularProgress, Grid, IconButton, Modal, Paper, Slide, Typography } from "@mui/material";
import LoadingScreen from "../Components/LoadingScreen";
import { GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Patient } from "../../Electron/Database/Models/Patient";
import { AddOutlined, DeleteOutline, EditOutlined, RefreshOutlined } from "@mui/icons-material";
import { AuthContext } from "../Contexts/AuthContext";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { ManagePatient } from "../Components/Patients/ManagePatient";

export function Patients() {
    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)
    const setResult = useContext(ResultContext).setResult

    const [page, setPage] = useState({ offset: 0, limit: 25 })

    const [loading, setLoading] = useState<boolean>(true)
    const [patients, setPatients] = useState<Patient[]>([])

    const [editingPatientId, setEditingPatientId] = useState<string | undefined>(undefined)
    const [creatingPatient, setCreatingPatient] = useState<boolean>(false)
    const [deletingPatientId, setDeletingPatientId] = useState<string | undefined>(undefined)

    const [showingStringArray, setShowingStringArray] = useState<string[] | undefined>(undefined)

    console.log('Patients', { setResult, configuration, patients, showingStringArray })

    const init = async (offset: number, limit: number) => {
        setLoading(true)
        console.log('init', 'start');
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatients(offset, limit)
        console.log('fetchPatients', 'res', res)
        setLoading(false)

        if (res.code !== 200 || !res.data) {
            setResult({
                severity: 'error',
                message: t('failedToFetchPatients')
            })
            return
        }

        setResult({
            severity: 'success',
            message: t('successfullyFetchedPatients')
        })
        setPatients(res.data)

        console.log('init', 'end');
    }

    useEffect(() => {
        console.log('Patients', 'useEffect', 'start');
        init(page.offset, page.limit).then(() => console.log('useEffect', 'end'))
    }, [page])

    if (!patients || patients.length === 0)
        return (<LoadingScreen />)

    const createsPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).create(resources.PATIENT)
    const updatesPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).update(resources.PATIENT)
    const deletesPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.PATIENT)

    const columns: GridColDef<any>[] = [
        {
            field: 'address',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.address ? <Button onClick={() => { const a = patients.find(p => p._id === params.row._id)?.address; setShowingStringArray(a ? [a] : undefined) }}>{t('Show')}</Button> : null)
        },
        {
            field: 'medicalHistory',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.medicalHistory && params.row.medicalHistory.length !== 0 ? <Button onClick={() => setShowingStringArray(patients.find(p => p._id === params.row._id)?.medicalHistory)}>{t('Show')}</Button> : null)
        },
        {
            field: 'birthDate',
            type: 'number',
            valueFormatter: (ts: number) => fromUnixToFormat(configuration.get.locale, ts, DATE),
            width: 200,
        },
        {
            field: 'createdAt',
            type: 'number',
            valueFormatter: (ts: number) => fromUnixToFormat(configuration.get.locale, ts, DATE),
            width: 200,
        },
        {
            field: 'updatedAt',
            type: 'number',
            valueFormatter: (ts: number) => fromUnixToFormat(configuration.get.locale, ts, DATE),
            width: 200,
        },
    ]

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={12} height={'100%'}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <DataGrid
                            data={patients}
                            hideFooter={false}
                            overWriteColumns={columns}
                            customToolbar={[
                                <Button onClick={async () => await init(page.offset, page.limit)} startIcon={<RefreshOutlined />}>{t('Refresh')}</Button>,
                                createsPatient && <Button onClick={() => setCreatingPatient(true)} startIcon={<AddOutlined />}>{t('Create')}</Button>,
                            ]}
                            additionalColumns={[
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    headerName: t('actions'),
                                    headerAlign: 'center',
                                    align: 'center',
                                    width: 120,
                                    getActions: ({ row }) => [
                                        updatesPatient ? <GridActionsCellItem icon={editingPatientId === row._id ? <CircularProgress size={20} /> : <EditOutlined />} onClick={() => setEditingPatientId(patients.find(p => p._id === row._id)?._id as string)} label={t('edit')} /> : null,
                                        deletesPatient ? <GridActionsCellItem icon={deletingPatientId === row._id ? <CircularProgress size={20} /> : <DeleteOutline />} onClick={async () => {
                                            setDeletingPatientId(row._id)
                                            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deletePatient(row._id)
                                            setDeletingPatientId(undefined)

                                            if (res.code !== 200 || !res.data.acknowledged || res.data.deletedCount !== 1)
                                                setResult({
                                                    severity: 'error',
                                                    message: t('failedToDeletePatient')
                                                })
                                            setResult({
                                                severity: 'success',
                                                message: t('successfullyDeletedPatient')
                                            })
                                            await init(page.offset, page.limit)
                                        }} label={t('delete')} /> : null,
                                    ]
                                },
                            ]}
                            autoSizing
                            loading={loading}
                            serverSidePagination
                            onPaginationModelChange={(m, d) => setPage({ offset: m.page, limit: m.pageSize })}
                            orderedColumnsFields={['actions']}
                            hiddenColumns={['_id']}
                        />
                    </Paper>
                </Grid>
            </Grid>

            <Modal
                onClose={() => setEditingPatientId(undefined)}
                open={editingPatientId !== undefined || creatingPatient}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={editingPatientId !== undefined || creatingPatient ? 'up' : 'down'} in={editingPatientId !== undefined || creatingPatient} timeout={250}>
                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                        <ManagePatient patient={patients.find(p => p._id && p._id === editingPatientId)} />
                    </Paper>
                </Slide>
            </Modal>

            <Modal
                onClose={() => setShowingStringArray(undefined)}
                open={showingStringArray !== undefined}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={showingStringArray !== undefined ? 'up' : 'down'} in={showingStringArray !== undefined} timeout={250}>
                    <Paper sx={{ width: '60%', overflowY: 'auto', height: '80%', padding: '0.5rem 2rem' }}>
                        {showingStringArray && showingStringArray?.map((str, i) =>
                            <Typography key={i} variant='body1'>
                                {str}
                            </Typography>
                        )}
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}

