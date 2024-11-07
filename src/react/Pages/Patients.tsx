import { useState, useContext, useEffect, memo, useMemo } from "react";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import { t } from "i18next";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Paper, Stack, useTheme } from "@mui/material";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Patient } from "../../Electron/Database/Models/Patient";
import { AddOutlined, DeleteOutline, EditOutlined, RefreshOutlined } from "@mui/icons-material";
import { AuthContext } from "../Contexts/AuthContext";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish, subscribe } from "../Lib/Events";
import { PAGE_SLIDER_ANIMATION_END_EVENT_NAME } from "./AnimatedLayout";
import { useNavigate } from "react-router-dom";
import { MedicalHistory } from "../Components/Patients/MedicalHistory";
import { EditorModal } from "../Components/Editor/EditorModal";
import { ManagePatient } from "../Components/Patients/ManagePatient";
import LoadingScreen from "../Components/LoadingScreen";
import { DataGrid } from "../Components/DataGrid";
import { ColumnDef } from "@tanstack/react-table";
import { getLuxonLocale } from "../Lib/helpers";

export const Patients = memo(function Patients() {
    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)
    const navigate = useNavigate()

    if (!auth?.accessControl?.can(auth.user.roleName).read(resources.PATIENT).granted)
        navigate('/')

    const initDialog: any = {
        open: false,
        title: '',
        content: '',
        action: null
    }
    const [dialog, setDialog] = useState<{
        open: boolean,
        title?: string,
        content: string,
        action: () => void | Promise<void>
    }>(initDialog)
    const closeDialog = () => setDialog(initDialog)

    const [page, setPage] = useState({ offset: 0, limit: 10 })

    const [loading, setLoading] = useState<boolean>(true)
    const [patients, setPatients] = useState<Patient[]>([])

    const [editingPatientId, setEditingPatientId] = useState<string | undefined>(undefined)
    const [creatingPatient, setCreatingPatient] = useState<boolean>(false)
    const [deletingPatientId, setDeletingPatientId] = useState<string | undefined>(undefined)

    const [activePatientId, setActivePatientId] = useState<string | undefined>(undefined)
    const [showingAddress, setShowingAddress] = useState<boolean>(false)
    const [showingMH, setShowingMH] = useState<boolean>(false)

    const [showGrid, setShowGrid] = useState(false)

    console.log('Patients', {
        auth,
        configuration,
        page,
        loading,
        patients,
        editingPatientId,
        creatingPatient,
        deletingPatientId,
        showingAddress,
        showingMH
    })

    const init = async (offset: number, limit: number): Promise<boolean> => {
        try {
            console.group('Patients', 'init');

            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatients(offset, limit)
            console.log({ res })

            if (res.code !== 200 || !res.data) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Patients.failedToFetchPatients')
                })

                return false
            }

            if (res.data.length > 0) {
                setPatients(res.data)
                return true
            }

            return false
        }
        finally { console.groupEnd() }
    }

    useEffect(() => {
        if (!patients || patients.length === 0)
            init(page.offset, page.limit)
                .then(() => {
                    setLoading(false)
                    subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
                        if (e?.detail === '/Patients')
                            setShowGrid(true)
                    })
                })
    }, [])

    const createsPatient = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).create(resources.PATIENT), [auth])
    const updatesPatient = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).update(resources.PATIENT), [auth])
    const deletesPatient = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.PATIENT), [auth])

    const overWriteColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'address',
            id: 'address',
            cell: (props) => (
                props.getValue()
                    ? <Button
                        onClick={() => {
                            setActivePatientId(patients?.find(p => p._id === props.row.original._id)?._id as string)
                            setShowingAddress(true)
                        }}
                    >
                        {t('Patients.Show')}
                    </Button>
                    : null
            )
        },
        {
            accessorKey: 'socialId',
            id: 'socialId',
            cell: ({ getValue }) => new Intl.NumberFormat(getLuxonLocale(configuration.get.locale.code), { trailingZeroDisplay: 'auto', minimumIntegerDigits: 10, useGrouping: false }).format(getValue() as Intl.StringNumericLiteral)
        },
        {
            accessorKey: '_id',
            id: '_id',
        },
        {
            accessorKey: 'age',
            id: 'age',
            cell: ({ getValue }) => new Intl.NumberFormat(getLuxonLocale(configuration.get.locale.code)).format(Number(getValue() as string))
        },
        {
            accessorKey: 'phoneNumber',
            id: 'phoneNumber',
            cell: ({ getValue }) => new Intl.NumberFormat(getLuxonLocale(configuration.get.locale.code), { trailingZeroDisplay: 'auto', minimumIntegerDigits: 11, useGrouping: false }).format(getValue() as Intl.StringNumericLiteral)
        },
        {
            accessorKey: 'medicalHistory',
            id: 'medicalHistory',
            cell: (props) => (
                props.row.original.medicalHistory && props.row.original.medicalHistory.length !== 0
                    ? <Button
                        onClick={() => {
                            setActivePatientId(patients?.find(p => p._id === props.row.original._id)?._id as string)
                            setShowingMH(true)
                        }}
                    >
                        {t('Patients.Show')}
                    </Button>
                    : null
            )
        },
        {
            accessorKey: 'birthDate',
            id: 'birthDate',
            cell: (props) => fromUnixToFormat(configuration.get.locale, props.getValue() as number, DATE),
        },
        {
            accessorKey: 'createdAt',
            id: 'createdAt',
            cell: (props) => fromUnixToFormat(configuration.get.locale, props.getValue() as number, DATE),
        },
        {
            accessorKey: 'updatedAt',
            id: 'updatedAt',
            cell: (props) => fromUnixToFormat(configuration.get.locale, props.getValue() as number, DATE),
        },
    ]

    const additionalColumns: ColumnDef<any>[] = [
        {
            id: 'actions',
            accessorKey: 'actions',
            cell: ({ row }) =>
                <Stack direction='row' alignItems='center'>
                    {
                        updatesPatient
                            ? <IconButton
                                onClick={() => {
                                    setEditingPatientId(patients?.find(p => p._id === row.original._id)?._id as string)
                                }}
                            >
                                {editingPatientId === row.original._id ? <CircularProgress size={20} /> : <EditOutlined />}
                            </IconButton>
                            : null
                    }
                    {
                        deletesPatient
                            ? <IconButton
                                onClick={async () => {
                                    setDialog({
                                        open: true,
                                        content: t('Patients.deletePatientDialogContent'),
                                        action: async () => {
                                            try {
                                                console.group('Patients', 'deletesPatient', 'onClick')

                                                setDeletingPatientId(row.original._id)
                                                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deletePatient(row.original._id)
                                                setDeletingPatientId(undefined)

                                                if (res.code !== 200 || !res.data.acknowledged || res.data.deletedCount !== 1)
                                                    publish(RESULT_EVENT_NAME, {
                                                        severity: 'error',
                                                        message: t('Patients.failedToDeletePatient')
                                                    })

                                                await init(page.offset, page.limit)

                                                publish(RESULT_EVENT_NAME, {
                                                    severity: 'success',
                                                    message: t('Patients.successfullyDeletedPatient')
                                                })
                                            }
                                            finally { console.groupEnd() }
                                        }
                                    })
                                }}
                            >
                                {deletingPatientId === row.original._id ? <CircularProgress size={20} /> : <DeleteOutline />}
                            </IconButton>
                            : null
                    }
                </Stack>
        },
    ]

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={12} height={'100%'}>
                    <Paper style={{ padding: '1rem', height: '100%' }} elevation={3}>
                        {!patients || patients?.length === 0 || !showGrid
                            ? <LoadingScreen />
                            : <DataGrid
                                configName='patients'
                                data={patients ?? []}
                                orderedColumnsFields={['actions', 'socialId', 'firstName', 'lastName', 'age', 'medicalHistory', 'phoneNumber', 'gender', 'address', 'birthDate']}
                                overWriteColumns={overWriteColumns}
                                additionalColumns={additionalColumns}
                                loading={loading}
                                hasPagination
                                pagination={{ pageSize: page.limit, pageIndex: page.offset }}
                                onPagination={async (p) => {
                                    const result = await init(p.pageIndex, p.pageSize)
                                    if (result)
                                        setPage({ limit: p.pageSize, offset: p.pageIndex })
                                    return result
                                }}
                                appendHeaderNodes={[
                                    <Button onClick={async () => await init(page.offset, page.limit)} startIcon={<RefreshOutlined />}>{t('Patients.Refresh')}</Button>,
                                    createsPatient && <Button onClick={() => setCreatingPatient(true)} startIcon={<AddOutlined />}>{t('Patients.Create')}</Button>,
                                ]}
                            />
                        }
                    </Paper>
                </Grid>
            </Grid>

            <ManagePatient
                open={editingPatientId !== undefined || creatingPatient}
                onClose={() => { setEditingPatientId(undefined); setCreatingPatient(false) }}
                inputPatient={patients?.find(p => p._id && p._id === editingPatientId)}
            />

            {/* Address */}
            <EditorModal
                open={showingAddress}
                onClose={() => {
                    setActivePatientId(undefined)
                    setShowingAddress(false)
                }}
                text={patients?.find(f => f._id === activePatientId)?.address?.text}
                canvasId={patients?.find(f => f._id === activePatientId)?.address?.canvas as string}
                title={t('Patients.address')}
                onSave={async (address, canvasId) => {
                    try {
                        console.group('Patients', 'Address', 'onSave')
                        console.log({ address, canvasId })

                        const p = patients?.find(f => f._id === activePatientId)
                        if (!p)
                            return

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updatePatient({ ...p, address: { text: address, canvas: canvasId } })
                        console.log({ res })
                        if (res.code !== 200 || !res.data.acknowledged || res.data.matchedCount !== 1) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('Patients.failedToUpdatePatientAddress')
                            })

                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('Patients.successfullyUpdatedPatientAddress')
                        })

                        await init(page.offset, page.limit)
                    }
                    finally { console.groupEnd() }
                }}
            />

            <MedicalHistory
                inputMedicalHistory={patients?.find(f => f._id === activePatientId)?.medicalHistory}
                open={showingMH}
                onClose={() => {
                    setActivePatientId(undefined)
                    setShowingMH(false)
                }}
                onSave={async (mh) => {
                    try {
                        console.group('Patients', 'MedicalHistory', 'onChange')

                        console.log({ mh })

                        const p = patients?.find(f => f._id === activePatientId)
                        if (!p)
                            return

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updatePatient({ ...p, medicalHistory: mh })
                        console.log({ res })
                        if (res.code !== 200 || !res.data.acknowledged || res.data.matchedCount !== 1) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('Patients.failedToUpdatePatientMedicalHistory')
                            })

                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('Patients.successfullyUpdatedPatientMedicalHistory')
                        })

                        await init(page.offset, page.limit)
                    }
                    finally { console.groupEnd() }
                }}
            />

            <Dialog open={dialog.open} onClose={closeDialog} >
                {dialog.title &&
                    <DialogTitle>
                        {dialog.title}
                    </DialogTitle>
                }
                <DialogContent>
                    <DialogContentText whiteSpace={'break-spaces'}>
                        {dialog.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>{t('Patients.No')}</Button>
                    <Button onClick={() => {
                        if (dialog.action && typeof dialog.action === 'function')
                            dialog.action()
                        closeDialog()
                    }}>{t('Patients.Yes')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
})

