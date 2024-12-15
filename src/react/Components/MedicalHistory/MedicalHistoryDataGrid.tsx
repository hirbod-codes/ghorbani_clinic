import { useContext, useEffect, useMemo, useState } from "react"
import { MedicalHistory } from "../../../Electron/Database/Models/MedicalHistory"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../../react/Contexts/AuthContext"
import { ConfigurationContext } from "../../../react/Contexts/ConfigurationContext"
import { resources } from "../../../Electron/Database/Repositories/Auth/resources"
import { RendererDbAPI } from "../../../Electron/Database/renderer"
import { publish } from "../../../react/Lib/Events"
import { RESULT_EVENT_NAME } from "../../../react/Contexts/ResultWrapper"
import { t } from "i18next"
import { ColumnDef } from "@tanstack/react-table"
import { DATE, toFormat } from "../../../react/Lib/DateTime/date-time-helpers"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, IconButton, Stack } from "@mui/material"
import { AddOutlined, DeleteOutline, RefreshOutlined, SearchOutlined } from "@mui/icons-material"
import { DataGrid } from "../DataGrid"
import { EditorModal } from "../Editor/EditorModal"
import { Modal } from "../Modal"
import { MedicalHistorySearch } from "./MedicalHistorySearch"

export function MedicalHistoryDataGrid() {
    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)
    const navigate = useNavigate()

    if (!auth?.accessControl?.can(auth.user.roleName).read(resources.MEDICAL_HISTORY).granted)
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
    const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([])

    const [creatingMedicalHistory, setCreatingMedicalHistory] = useState<boolean>(false)
    const [deletingMedicalHistoryId, setDeletingMedicalHistoryId] = useState<string | undefined>(undefined)

    const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false)

    console.log('MedicalHistories', {
        auth,
        configuration,
        page,
        loading,
        medicalHistories,
        creatingMedicalHistory,
        deletingMedicalHistoryId,
    })

    const init = async (offset: number, limit: number): Promise<boolean> => {
        try {
            console.group('MedicalHistories', 'init');

            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getMedicalHistories(offset, limit)
            console.log({ res })

            if (res.code !== 200 || !res.data) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('MedicalHistories.failedToFetchMedicalHistories')
                })

                return false
            }

            if (res.data.length > 0) {
                setMedicalHistories(res.data.map((md, i) => ({ ...md, counter: (page.offset * page.limit) + i + 1 })))
                return true
            }

            return false
        }
        finally { console.groupEnd() }
    }

    useEffect(() => {
        if (!medicalHistories || medicalHistories.length === 0)
            init(page.offset, page.limit)
                .then(() => {
                    setLoading(false)
                })
    }, [])

    const createsMedicalHistory = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).create(resources.MEDICAL_HISTORY), [auth])
    const deletesMedicalHistory = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.MEDICAL_HISTORY), [auth])

    const overWriteColumns: ColumnDef<any>[] = [
        {
            accessorKey: '_id',
            id: '_id',
        },
        {
            accessorKey: 'name',
            id: 'name',
            cell: (props) => <Stack direction='row' sx={{ maxHeight: '100px', overflow: 'auto', width: '200px' }}>{props.getValue() as any}</Stack>,
        },
        {
            accessorKey: 'createdAt',
            id: 'createdAt',
            cell: (props) => toFormat(props.getValue() as number, configuration.local, undefined, DATE),
        },
        {
            accessorKey: 'updatedAt',
            id: 'updatedAt',
            cell: (props) => toFormat(props.getValue() as number, configuration.local, undefined, DATE),
        },
    ]

    const additionalColumns: ColumnDef<any>[] = !deletesMedicalHistory ? [] : [
        {
            id: 'actions',
            accessorKey: 'actions',
            cell: ({ row }) => <IconButton
                onClick={async () => {
                    setDialog({
                        open: true,
                        content: t('MedicalHistories.deleteMedicalHistoryDialogContent'),
                        action: async () => {
                            try {
                                console.group('MedicalHistories', 'deletesMedicalHistory', 'onClick')

                                setDeletingMedicalHistoryId(row.original._id)
                                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteMedicalHistoryById(row.original._id)
                                setDeletingMedicalHistoryId(undefined)

                                if (res.code !== 200 || !res.data.acknowledged || res.data.deletedCount !== 1)
                                    publish(RESULT_EVENT_NAME, {
                                        severity: 'error',
                                        message: t('MedicalHistories.failedToDeleteMedicalHistory')
                                    })

                                await init(page.offset, page.limit)

                                publish(RESULT_EVENT_NAME, {
                                    severity: 'success',
                                    message: t('MedicalHistories.successfullyDeletedMedicalHistory')
                                })
                            }
                            finally { console.groupEnd() }
                        }
                    })
                }}
            >
                {deletingMedicalHistoryId === row.original._id ? <CircularProgress size={20} /> : <DeleteOutline />}
            </IconButton>
        },
    ]

    return (
        <>
            {!loading &&
                <DataGrid
                    configName='medicalHistories'
                    data={medicalHistories ?? []}
                    defaultColumnOrderModel={['actions', 'name']}
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
                        <Button onClick={async () => await init(page.offset, page.limit)} startIcon={<RefreshOutlined />}>{t('MedicalHistories.Refresh')}</Button>,
                        <Button onClick={async () => setSearchModalOpen(true)} startIcon={<SearchOutlined />}>{t('MedicalHistories.Search')}</Button>,
                        createsMedicalHistory && <Button onClick={() => setCreatingMedicalHistory(true)} startIcon={<AddOutlined />}>{t('MedicalHistories.Create')}</Button>,
                    ]}
                />}

            <Modal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} >
                <MedicalHistorySearch creatable deletable />
            </Modal>

            {/* Medical history creation, Name field */}
            <EditorModal
                open={creatingMedicalHistory}
                onClose={() => setCreatingMedicalHistory(false)}
                hideCanvas={true}
                title={t('MedicalHistories.creationModalTitle')}
                onSave={async (address, canvasId) => {
                    try {
                        console.group('MedicalHistories', 'Address', 'onSave')
                        console.log({ address, canvasId })

                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createMedicalHistory({ name: address })
                        console.log({ res })
                        if (res.code !== 200 || !res.data.acknowledged) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('MedicalHistories.failedToUpdatePatientAddress')
                            })

                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('MedicalHistories.successfullyUpdatedPatientAddress')
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
                    <Button onClick={closeDialog}>{t('MedicalHistories.No')}</Button>
                    <Button onClick={() => {
                        if (dialog.action && typeof dialog.action === 'function')
                            dialog.action()
                        closeDialog()
                    }}>{t('MedicalHistories.Yes')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

