import { useState, useContext, useEffect } from "react";
import { DataGrid } from "../Components/DataGrid/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { t } from "i18next";
import { Button, CircularProgress, Fade, Grid, Modal, Paper, Slide, Typography } from "@mui/material";
import LoadingScreen from "../Components/LoadingScreen";
import { GridActionsCellItem, GridColDef, GridColumnVisibilityModel, GridRenderCellParams } from "@mui/x-data-grid";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Patient } from "../../Electron/Database/Models/Patient";
import { AddOutlined, DeleteOutline, EditOutlined, RefreshOutlined } from "@mui/icons-material";
import { AuthContext } from "../Contexts/AuthContext";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { ManagePatient } from "../Components/Patients/ManagePatient";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish } from "../Lib/Events";
import { configAPI } from "../../Electron/Configuration/renderer/configAPI";

export function Patients() {
    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)

    const [page, setPage] = useState({ offset: 0, limit: 25 })
    const [hiddenColumns, setHiddenColumns] = useState<string[]>(['_id'])

    const [loading, setLoading] = useState<boolean>(true)
    const [patients, setPatients] = useState<Patient[]>([])

    const [editingPatientId, setEditingPatientId] = useState<string | undefined>(undefined)
    const [creatingPatient, setCreatingPatient] = useState<boolean>(false)
    const [deletingPatientId, setDeletingPatientId] = useState<string | undefined>(undefined)

    const [showingAddress, setShowingAddress] = useState<string | undefined>(undefined)
    const [showingMH, setShowingMH] = useState<string[] | undefined>(undefined)

    console.log('Patients', { configuration, patients, showingAddress })

    const init = async (offset: number, limit: number) => {
        setLoading(true)
        console.log('init', 'start');
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatients(offset, limit)
        console.log('fetchPatients', 'res', res)
        setLoading(false)

        if (res.code !== 200 || !res.data) {
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToFetchPatients')
            })
            return
        }

        publish(RESULT_EVENT_NAME, {
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

    useEffect(() => {
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (c?.columnVisibilityModels?.patients)
                    setHiddenColumns(Object.entries(c.columnVisibilityModels.patients).filter(f => f[1] === false).map(arr => arr[0]))
            })
    }, [])

    const createsPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).create(resources.PATIENT)
    const updatesPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).update(resources.PATIENT)
    const deletesPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.PATIENT)

    const columns: GridColDef<any>[] = [
        {
            field: 'address',
            type: 'actions',
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.address ? <Button onClick={() => setShowingAddress(patients.find(p => p._id === params.row._id)?.address)}>{t('Show')}</Button> : null)
        },
        {
            field: '_id',
            hideable: false,

        },
        {
            field: 'medicalHistory',
            type: 'actions',
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.medicalHistory && params.row.medicalHistory.length !== 0 ? <Button onClick={() => setShowingMH(patients.find(p => p._id === params.row._id)?.medicalHistory)}>{t('Show')}</Button> : null)
        },
        {
            field: 'birthDate',
            type: 'number',
            valueGetter: (ts: number) => fromUnixToFormat(configuration.get.locale, ts, DATE),
        },
        {
            field: 'createdAt',
            type: 'number',
            valueGetter: (ts: number) => fromUnixToFormat(configuration.get.locale, ts, DATE),
        },
        {
            field: 'updatedAt',
            type: 'number',
            valueGetter: (ts: number) => fromUnixToFormat(configuration.get.locale, ts, DATE),
        },
    ]

    if (!patients || patients.length === 0)
        return (<LoadingScreen />)

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={12} height={'100%'}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <DataGrid
                            name='patients'
                            data={patients}
                            hideFooter={false}
                            overWriteColumns={columns}
                            loading={loading}
                            serverSidePagination
                            onPaginationModelChange={(m, d) => setPage({ offset: m.page, limit: m.pageSize })}
                            orderedColumnsFields={['actions']}
                            storeColumnVisibilityModel
                            hiddenColumns={hiddenColumns}
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
                                                publish(RESULT_EVENT_NAME, {
                                                    severity: 'error',
                                                    message: t('failedToDeletePatient')
                                                })

                                            await init(page.offset, page.limit)

                                            publish(RESULT_EVENT_NAME, {
                                                severity: 'success',
                                                message: t('successfullyDeletedPatient')
                                            })
                                        }} label={t('delete')} /> : null,
                                    ]
                                },
                            ]}
                        />
                    </Paper>
                </Grid>
            </Grid>

            <Modal
                onClose={() => { setEditingPatientId(undefined); setCreatingPatient(false) }}
                open={editingPatientId !== undefined || creatingPatient}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={editingPatientId !== undefined || creatingPatient ? 'up' : 'down'} in={editingPatientId !== undefined || creatingPatient} timeout={250}>
                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                        <ManagePatient inputPatient={patients.find(p => p._id && p._id === editingPatientId)} />
                    </Paper>
                </Slide>
            </Modal>

            <Modal
                onClose={() => setShowingAddress(undefined)}
                open={showingAddress !== undefined}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Fade in={showingAddress !== undefined} timeout={250}>
                    <Paper sx={{ width: '60%', overflowY: 'auto', padding: '0.5rem 2rem' }}>
                        {showingAddress &&
                            <Typography variant='body1'>
                                {showingAddress}
                            </Typography>
                        }
                    </Paper>
                </Fade>
            </Modal>

            <Modal
                onClose={() => setShowingMH(undefined)}
                open={showingMH !== undefined}
                closeAfterTransition
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Fade in={showingMH !== undefined} timeout={250}>
                    <Paper sx={{ width: '60%', overflowY: 'auto', padding: '0.5rem 2rem' }}>
                        {showingMH && showingMH?.map((mh, i) =>
                            <Typography key={i} variant='body1'>
                                {mh}
                            </Typography>
                        )}
                    </Paper>
                </Fade>
            </Modal>
        </>
    )
}

