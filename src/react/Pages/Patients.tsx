import { useState, useContext, useEffect } from "react";
import { DataGrid } from "../Components/DataGrid/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import { t } from "i18next";
import { Button, CircularProgress, Grid, Paper } from "@mui/material";
import LoadingScreen from "../Components/LoadingScreen";
import { GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Patient } from "../../Electron/Database/Models/Patient";
import { AddOutlined, DeleteOutline, EditOutlined, RefreshOutlined } from "@mui/icons-material";
import { AuthContext } from "../Contexts/AuthContext";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { ManagePatient } from "../Components/Patients/ManagePatient";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish, subscribe } from "../Lib/Events";
import { configAPI } from '../../Electron/Configuration/renderer';
import { MedicalHistory } from "../Components/Patients/MedicalHistory";
import { EditorModal } from "../Components/Editor/EditorModal";
import { NavigationContext } from "../Contexts/NavigationContext";
import { PAGE_SLIDER_ANIMATION_END_EVENT_NAME } from "./AnimatedLayout";

export function Patients() {
    const nav = useContext(NavigationContext)

    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)

    const [page, setPage] = useState({ offset: 0, limit: 25 })
    const [hiddenColumns, setHiddenColumns] = useState<string[]>(['_id'])

    const [loading, setLoading] = useState<boolean>(true)
    const [patients, setPatients] = useState<Patient[]>([])

    const [editingPatientId, setEditingPatientId] = useState<string | undefined>(undefined)
    const [creatingPatient, setCreatingPatient] = useState<boolean>(false)
    const [deletingPatientId, setDeletingPatientId] = useState<string | undefined>(undefined)

    const [activePatientId, setActivePatientId] = useState<string | undefined>(undefined)
    const [showingAddress, setShowingAddress] = useState<boolean>(false)
    const [showingMH, setShowingMH] = useState<boolean>(false)

    console.log('Patients', {
        auth,
        configuration,
        page,
        hiddenColumns,
        loading,
        patients,
        editingPatientId,
        creatingPatient,
        deletingPatientId,
        showingAddress,
        showingMH
    })

    const init = async (offset: number, limit: number) => {
        try {
            console.group('Patients', 'init');

            setLoading(true)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatients(offset, limit)
            console.log({ res })
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
        }
        finally { console.groupEnd() }
    }

    useEffect(() => {
        console.log('Patients', 'useEffect1', !(!auth || !auth.user || !auth.accessControl));
        if (!auth || !auth.user || !auth.accessControl)
            return

        init(page.offset, page.limit)
    }, [page, auth])

    useEffect(() => {
        console.log('Patients', 'useEffect2', 'start', 'pageHasLoaded');
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (c?.columnVisibilityModels?.patients)
                    setHiddenColumns(Object.entries(c.columnVisibilityModels.patients).filter(f => f[1] === false).map(arr => arr[0]))
            })
    }, [])

    const [showGrid, setShowGrid] = useState(false)
    useEffect(() => {
        subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
            if (e?.detail === '/Patients')
                setShowGrid(true)
        })
    }, [])

    if (!auth || !auth.user || !auth.accessControl)
        return (<LoadingScreen />)

    const createsPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).create(resources.PATIENT)
    const updatesPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).update(resources.PATIENT)
    const deletesPatient = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.PATIENT)

    const columns: GridColDef<any>[] = [
        {
            field: 'address',
            type: 'actions',
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.address ? <Button onClick={() => {
                setActivePatientId(patients.find(p => p._id === params.row._id)?._id as string)
                setShowingAddress(true)
            }}>{t('Show')}</Button> : null)
        },
        {
            field: '_id',
        },
        {
            field: 'medicalHistory',
            type: 'actions',
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.medicalHistory && params.row.medicalHistory.length !== 0 ? <Button onClick={() => {
                setActivePatientId(patients.find(p => p._id === params.row._id)?._id as string)
                setShowingMH(true)
            }}>{t('Show')}</Button> : null)
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
        return (
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={12} height={'100%'}>
                    <Paper style={{ padding: '1rem', height: '100%' }}>
                        <LoadingScreen />
                    </Paper>
                </Grid>
            </Grid>
        )

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={12} height={'100%'}>
                    <Paper style={{ padding: '1rem', height: '100%' }}>
                        {!showGrid
                            ? <CircularProgress size='medium' />
                            : <DataGrid
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
                                            updatesPatient ? <GridActionsCellItem icon={editingPatientId === row._id ? <CircularProgress size={20} /> : <EditOutlined />} onClick={() => {
                                                setEditingPatientId(patients.find(p => p._id === row._id)?._id as string)
                                            }} label={t('edit')} /> : null,
                                            deletesPatient ? <GridActionsCellItem icon={deletingPatientId === row._id ? <CircularProgress size={20} /> : <DeleteOutline />} onClick={async () => {
                                                try {
                                                    console.group('Patients', 'deletesPatient', 'onClick')

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
                                                }
                                                finally { console.groupEnd() }
                                            }} label={t('delete')} /> : null,
                                        ]
                                    },
                                ]}
                            />
                        }
                    </Paper>
                </Grid>
            </Grid>

            <ManagePatient
                open={editingPatientId !== undefined || creatingPatient}
                onClose={() => { setEditingPatientId(undefined); setCreatingPatient(false) }}
                inputPatient={patients.find(p => p._id && p._id === editingPatientId)}
            />

            <EditorModal
                open={showingAddress}
                onClose={() => {
                    setActivePatientId(undefined)
                    setShowingAddress(false)
                }}
                text={patients.find(f => f._id === activePatientId)?.address?.text}
                canvasId={patients.find(f => f._id === activePatientId)?.address?.canvas as string}
                title={t('address')}
                onSave={async (address, canvasId) => {
                    try {
                        console.group('Patients', 'Address', 'onSave')
                        console.log({ address, canvasId })

                        const p = patients.find(f => f._id === activePatientId)
                        if (!p)
                            return

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updatePatient({ ...p, address: { text: address, canvas: canvasId } })
                        console.log({ res })
                        if (res.code !== 200 || !res.data.acknowledged || res.data.matchedCount !== 1) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('failedToUpdatePatientAddress')
                            })

                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('successfullyUpdatedPatientAddress')
                        })

                        setActivePatientId(undefined)
                        setShowingMH(false)

                        await init(page.offset, page.limit)
                    }
                    finally { console.groupEnd() }
                }}
            />

            <MedicalHistory
                inputMedicalHistory={patients.find(f => f._id === activePatientId)?.medicalHistory}
                open={showingMH}
                onClose={() => {
                    setActivePatientId(undefined)
                    setShowingMH(false)
                }}
                onChange={async (mh) => {
                    try {
                        console.group('Patients', 'MedicalHistory', 'onChange')

                        console.log({ mh })

                        const p = patients.find(f => f._id === activePatientId)
                        if (!p)
                            return

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updatePatient({ ...p, medicalHistory: mh })
                        console.log({ res })
                        if (res.code !== 200 || !res.data.acknowledged || res.data.matchedCount !== 1) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('failedToUpdatePatientMedicalHistory')
                            })

                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('successfullyUpdatedPatientMedicalHistory')
                        })

                        setActivePatientId(undefined)
                        setShowingMH(false)

                        await init(page.offset, page.limit)
                    }
                    finally { console.groupEnd() }
                }}
            />
        </>
    )
}

