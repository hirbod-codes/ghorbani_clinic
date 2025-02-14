import { useState, useContext, useEffect, memo, useMemo } from "react";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import { t } from "i18next";
import { DATE, toFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/Configuration/ConfigurationContext";
import { Patient } from "../../Electron/Database/Models/Patient";
import { AuthContext } from "../Contexts/AuthContext";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish, subscribe } from "../Lib/Events";
import { PAGE_SLIDER_ANIMATION_END_EVENT_NAME } from "./AnimatedLayout";
import { useNavigate } from "react-router-dom";
import { MedicalHistory } from "../Components/Patients/MedicalHistory";
import { EditorModal } from "../Components/Base/Editor/EditorModal";
import { ManagePatientModal } from "../Components/Patients/ManagePatientModal";
import { DataGrid } from "../Components/DataGrid";
import { ColumnDef } from "@tanstack/react-table";
import { getLuxonLocale } from "../Lib/localization";
import { Modal } from "../Components/Base/Modal";
import { DocumentManagement } from "../Components/DocumentManagement";
import { Button } from "../Components/Base/Button";
import { CircularLoadingIcon } from "../Components/Base/CircularLoadingIcon";
import { EditIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { Stack } from "../Components/Base/Stack";
import { CircularLoadingScreen } from "../Components/Base/CircularLoadingScreen";
import { ColorStatic } from "../Lib/Colors/ColorStatic";

export const Patients = memo(function Patients() {
    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)!
    const themeOptions = configuration.themeOptions
    const navigate = useNavigate()

    if (!auth?.accessControl?.can(auth?.user?.roleName ?? '').read(resources.PATIENT).granted)
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
    const [showingDocuments, setShowingDocuments] = useState<boolean>(false)

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
                publish(RESULT_EVENT_NAME, {
                    severity: 'success',
                    message: t('Patients.successfullyFetchedPatients')
                })

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
                    // subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
                    // if (e?.detail === '/Patients')
                    setShowGrid(true)
                    // })
                })
    }, [])

    const readsMedicalHistories = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth.user.roleName).read(resources.MEDICAL_HISTORY).granted, [auth])
    const createsPatient = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).create(resources.PATIENT).granted, [auth])
    const updatesPatient = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).update(resources.PATIENT).granted, [auth])
    const deletesPatient = useMemo(() => auth?.user && auth?.accessControl && auth?.accessControl.can(auth?.user.roleName).delete(resources.PATIENT).granted, [auth])

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
            cell: ({ getValue }) => new Intl.NumberFormat(getLuxonLocale(configuration.local.language), { trailingZeroDisplay: 'auto', minimumIntegerDigits: 10, useGrouping: false }).format(getValue() as Intl.StringNumericLiteral)
        },
        {
            accessorKey: '_id',
            id: '_id',
        },
        {
            accessorKey: 'age',
            id: 'age',
            cell: ({ getValue }) => typeof getValue() === 'number' ? new Intl.NumberFormat(getLuxonLocale(configuration.local.language)).format(getValue() as number) : '-'
        },
        {
            accessorKey: 'phoneNumber',
            id: 'phoneNumber',
            cell: ({ getValue }) => getValue() !== undefined && typeof getValue() === 'string' && (getValue() as string).match(/^[0-9]+$/) != null ? new Intl.NumberFormat(getLuxonLocale(configuration.local.language), { trailingZeroDisplay: 'auto', minimumIntegerDigits: 11, useGrouping: false }).format(getValue() as Intl.StringNumericLiteral) : '-'
        },
        {
            accessorKey: 'birthDate',
            id: 'birthDate',
            cell: ({ getValue }) => typeof getValue() === 'number' ? toFormat(getValue() as number, configuration.local, undefined, DATE) : '-',
        },
        {
            accessorKey: 'createdAt',
            id: 'createdAt',
            cell: ({ getValue }) => typeof getValue() === 'number' ? toFormat(getValue() as number, configuration.local, undefined, DATE) : '-',
        },
        {
            accessorKey: 'updatedAt',
            id: 'updatedAt',
            cell: ({ getValue }) => typeof getValue() === 'number' ? toFormat(getValue() as number, configuration.local, undefined, DATE) : '-',
        },
    ]

    if (readsMedicalHistories)
        overWriteColumns.push({
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
        })
    else
        overWriteColumns.push({
            accessorKey: 'medicalHistory',
            id: 'medicalHistory',
            cell: (props) => t('Patients.NoData')
        })

    const additionalColumns: ColumnDef<any>[] = [
        {
            id: 'actions',
            accessorKey: 'actions',
            cell: ({ row }) =>
                <Stack stackProps={{ className: "items-center justify-center" }}>
                    {
                        updatesPatient
                            ? <Button
                                isIcon
                                variant='text'
                                onClick={() => {
                                    setEditingPatientId(patients?.find(p => p._id === row.original._id)?._id as string)
                                }}
                            >
                                {editingPatientId === row.original._id ? <CircularLoadingIcon /> : <EditIcon />}
                            </Button>
                            : null
                    }
                    {
                        deletesPatient
                            ? <Button
                                isIcon
                                variant='text'
                                fgColor='error'
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

                                                if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.deletedCount !== 1)
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
                                {deletingPatientId === row.original._id ? <CircularLoadingIcon /> : <Trash2Icon />}
                            </Button>
                            : null
                    }
                </Stack>
        },
        {
            id: 'documents',
            accessorKey: 'documents',
            cell: ({ row }) =>
                <Button
                    onClick={() => {
                        setActivePatientId(patients?.find(p => p._id === row.original._id)?._id as string)
                        setShowingDocuments(true)
                    }}
                >
                    {t('Patients.Documents')}
                </Button>
        }
    ]

    let dataGridGradientColor = ColorStatic.parse(themeOptions.colors.primary[themeOptions.mode].main).toRgb()
    dataGridGradientColor.setAlpha(0.1)

    return (
        <>
            <div className="size-full shadow-lg">
                {!patients || patients?.length === 0 || !showGrid
                    ? <CircularLoadingScreen />
                    : <DataGrid
                        configName='patients'
                        containerProps={{ stackProps: { style: { backgroundImage: `linear-gradient(to bottom right, ${dataGridGradientColor.toHex()} , transparent)` } } }}
                        data={patients ?? []}
                        defaultColumnOrderModel={['counter', 'actions', 'socialId', 'firstName', 'lastName', 'age', 'documents', 'medicalHistory', 'phoneNumber', 'gender', 'address', 'birthDate']}
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
                            <Button variant="outline" onClick={async () => await init(page.offset, page.limit)}><RefreshCwIcon />{t('Patients.Refresh')}</Button>,
                            createsPatient && <Button variant="outline" onClick={() => setCreatingPatient(true)}><PlusIcon />{t('Patients.Create')}</Button>,
                        ]}
                    />
                }
            </div>

            <Modal
                open={showingDocuments}
                onClose={() => setShowingDocuments(false)}
                modalContainerProps={{ style: { width: '90%' } }}
                childrenContainerProps={{ style: { overflowY: 'auto' } }}
            >
                <DocumentManagement patientId={activePatientId!} />
            </Modal>

            <ManagePatientModal
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
                        if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.matchedCount !== 1) {
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
                onDone={async (mh) => {
                    try {
                        console.group('Patients', 'MedicalHistory', 'onChange')

                        console.log({ mh })

                        const p = patients?.find(f => f._id === activePatientId)
                        if (!p)
                            return

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updatePatient({ ...p, medicalHistory: mh })
                        console.log({ res })
                        if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.matchedCount !== 1) {
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

            <Modal
                open={dialog.open}
                onClose={closeDialog}
            >
                <Stack direction="vertical" stackProps={{ className: 'justify-between' }}>
                    {dialog.content}
                    <Stack>
                        <Button onClick={closeDialog}>{t('Patients.No')}</Button>
                        <Button onClick={() => {
                            if (dialog.action && typeof dialog.action === 'function')
                                dialog.action()
                            closeDialog()
                        }}>{t('Patients.Yes')}</Button>
                    </Stack>
                </Stack>
            </Modal>
        </>
    )
})

