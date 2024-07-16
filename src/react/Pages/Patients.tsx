import { useState, useContext, useEffect } from "react";
import { DataGrid } from "../Components/DataGrid/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { t } from "i18next";
import { Box, Button, CircularProgress, Fade, Grid, Modal, Paper, Slide, Typography } from "@mui/material";
import LoadingScreen from "../Components/LoadingScreen";
import { GridActionsCellItem, GridColDef, GridColumnVisibilityModel, GridRenderCellParams } from "@mui/x-data-grid";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Patient, PatientsMedicalHistory } from "../../Electron/Database/Models/Patient";
import { AddOutlined, DeleteOutline, EditOutlined, RefreshOutlined } from "@mui/icons-material";
import { AuthContext } from "../Contexts/AuthContext";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { ManagePatient } from "../Components/Patients/ManagePatient";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish } from "../Lib/Events";
import { configAPI } from "../../Electron/Configuration/renderer/configAPI";
import { MedicalHistory } from "../Components/Patients/MedicalHistory";
import { Address } from "../Components/Patients/Address";

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
        setLoading(true)
        console.log('Patients', 'init', 'start');
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatients(offset, limit)
        console.log('Patients', 'fetchPatients', 'res', res)
        setLoading(false)

        if (res.code !== 200 || !res.data) {
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToFetchPatients')
            })

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('successfullyFetchedPatients')
            })
            return
        }

        publish(RESULT_EVENT_NAME, {
            severity: 'error',
            message: t('failedToFetchPatients')
        })

        publish(RESULT_EVENT_NAME, {
            severity: 'success',
            message: t('successfullyFetchedPatients')
        })
        setPatients(res.data)

        console.log('Patients', 'init', 'end');
    }

    useEffect(() => {
        console.log('Patients', 'useEffect', 'start');
        if (!auth || !auth.user || !auth.accessControl)
            return

        init(page.offset, page.limit).then(() => console.log('Patients', 'useEffect', 'end'))
    }, [page, auth])

    useEffect(() => {
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (c?.columnVisibilityModels?.patients)
                    setHiddenColumns(Object.entries(c.columnVisibilityModels.patients).filter(f => f[1] === false).map(arr => arr[0]))
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
            hideable: false,

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

            <ManagePatient
                open={editingPatientId !== undefined || creatingPatient}
                onClose={() => { setEditingPatientId(undefined); setCreatingPatient(false) }}
                inputPatient={patients.find(p => p._id && p._id === editingPatientId)}
            />

            <Address
                open={showingAddress}
                onClose={() => {
                    setActivePatientId(undefined)
                    setShowingAddress(false)
                }}
                defaultAddress={patients.find(f => f._id === activePatientId)?.address}
                onChange={async (address) => {
                    const p = patients.find(f => f._id === activePatientId)
                    if (!p)
                        return

                    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updatePatient({ ...p, address: address })
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
                }}
            />

            <MedicalHistory
                inputMedicalHistory={patients.find(f => f._id === activePatientId)?.medicalHistory}
                open={showingMH}
                onClose={() => setShowingMH(false)}
                onChange={async (mh) => {
                    const p = patients.find(f => f._id === activePatientId)
                    if (!p)
                        return

                    const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updatePatient({ ...p, medicalHistory: mh })
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
                }}
            />
        </>
    )
}

