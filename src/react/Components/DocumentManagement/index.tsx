import { useContext, useEffect, useMemo, useState } from "react"
import { RendererDbAPI } from "../../../Electron/Database/renderer"
import { GridFSFile } from "mongodb";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Stack, styled } from "@mui/material";
import { DataGrid } from "../DataGrid";
import { t } from "i18next";
import { AddOutlined, DeleteOutline, DownloadOutlined } from "@mui/icons-material";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { publish } from "../../Lib/Events";
import { ColumnDef } from "@tanstack/react-table";
import { AuthContext } from "../../Contexts/AuthContext";
import { resources } from "../../../Electron/Database/Repositories/Auth/resources";
import { DATE_TIME, fromUnixToFormat } from "../../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { getLuxonLocale } from "../../Lib/helpers";
import { DateTime } from "luxon";
import { dialog } from 'electron'
import { appAPI } from "src/Electron/handleAppRendererEvents";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export function DocumentManagement({ patientId }: { patientId: string }) {
    const configuration = useContext(ConfigurationContext)
    const auth = useContext(AuthContext)
    const [files, setFiles] = useState<GridFSFile[]>([])
    const [adding, setAdding] = useState<boolean>(false)

    const [deletingFileId, setDeletingFileId] = useState<string | undefined>(undefined)
    const [openingFileId, setOpeningFileId] = useState<string | undefined>(undefined)

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

    console.log('DocumentManagement', { files, adding })

    const fetchDocuments = () => (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.retrieveFiles(patientId)
    const fetchAndSetDocuments = async () => {
        const res = await fetchDocuments()
        console.log('DocumentManagement', { res });
        if (res.code >= 200 && res.data !== undefined)
            setFiles(res.data);
    }
    const addDocument = async (files: { fileName: string, bytes: Buffer | Uint8Array }[]) => {
        if (!patientId)
            return

        setAdding(true)
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.uploadFiles(patientId, files)
        setAdding(false)

        if (res.code < 200 || res.data !== true)
            return

        publish(RESULT_EVENT_NAME, {
            severity: 'success',
            message: t('DocumentManagement.successfullyUploadedFiles')
        })
    }

    const createsFile = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).create(resources.FILE), [auth])
    const readsFile = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).read(resources.FILE), [auth])
    const deletesFile = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.FILE), [auth])

    const overWriteColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'uploadDate',
            id: 'uploadDate',
            cell: (props) => {
                console.log(props.getValue());
                return fromUnixToFormat(configuration.get.locale, DateTime.fromISO(props.getValue() as string).toUnixInteger(), DATE_TIME)
            },
        },
        {
            accessorKey: 'length',
            id: 'length',
            header: t('DocumentManagement.size'),
            cell: ({ getValue }) => {
                const n = Number(getValue() as number)
                if (!n || Number.isNaN(n))
                    return '-'

                return new Intl.NumberFormat(getLuxonLocale(configuration.get.locale.code)).format(Math.round(n / 1000)) + ' kb';
            }
        },
    ]

    const additionalColumns: ColumnDef<any>[] = [
        {
            id: 'actions',
            accessorKey: 'actions',
            cell: ({ row }) =>
                <Stack direction='row' alignItems='center'>
                    {
                        deletesFile
                            ? <IconButton
                                onClick={async () => {
                                    try {
                                        console.group('DocumentManagement', 'deletesFile', 'onClick')

                                        setDeletingFileId(row.original._id)
                                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteFile(patientId, row.original._id, row.original.filename)
                                        console.log({ res })
                                        setDeletingFileId(undefined)

                                        if (res.code !== 200 || res.data === false)
                                            publish(RESULT_EVENT_NAME, {
                                                severity: 'error',
                                                message: t('DocumentManagement.failedToDeleteFile')
                                            })

                                        await fetchAndSetDocuments()

                                        publish(RESULT_EVENT_NAME, {
                                            severity: 'success',
                                            message: t('DocumentManagement.successfullyDeletedFile')
                                        })
                                    }
                                    finally { console.groupEnd() }
                                }}
                            >
                                {deletingFileId === row.original._id ? <CircularProgress size={20} /> : <DeleteOutline />}
                            </IconButton>
                            : null
                    }
                    {
                        readsFile
                            ? <IconButton
                                onClick={async () => {
                                    try {
                                        console.group('DocumentManagement', 'opensFile', 'onClick')

                                        const openFile = async () => {
                                            setOpeningFileId(row.original._id)
                                            res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.openFile(patientId, row.original._id, row.original.filename)
                                            console.log({ res })
                                            setOpeningFileId(undefined)

                                            if (res.code !== 200 || res.data === false)
                                                publish(RESULT_EVENT_NAME, {
                                                    severity: 'error',
                                                    message: t('DocumentManagement.failedToOpenFile')
                                                });
                                        }

                                        let res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.fileExists(patientId, row.original._id, row.original.filename)
                                        if (res.code < 200)
                                            publish(RESULT_EVENT_NAME, {
                                                severity: 'error',
                                                message: t('DocumentManagement.failedToFetchFile')
                                            });

                                        if (res.data === true) {
                                            setDialog({
                                                action: openFile,
                                                content: t('DocumentManagement.FileAlreadyExists,DoYouWantToDownloadAgain?'),
                                                open: true,
                                                title: ''
                                            })
                                            return
                                        }
                                    }
                                    finally { console.groupEnd() }
                                }}
                            >
                                {openingFileId === row.original._id ? <CircularProgress size={20} /> : <DownloadOutlined />}
                            </IconButton>
                            : null
                    }
                </Stack>

        },
    ]

    useEffect(() => {
        fetchAndSetDocuments()
    }, [patientId])

    return (
        <>
            <Paper sx={{ width: '100%', height: '100%' }}>
                <DataGrid
                    configName="Documents"
                    data={files}
                    overWriteColumns={overWriteColumns}
                    additionalColumns={additionalColumns}
                    defaultColumnOrderModel={['counter', 'action', 'filename', 'length']}
                    appendHeaderNodes={[
                        createsFile ?
                            <Button
                                component="label"
                                sx={{ width: 'fit-content' }}
                                variant='text'
                                role={undefined}
                                tabIndex={-1}
                                startIcon={adding ? <CircularProgress /> : <AddOutlined />}
                            >
                                {t('DocumentManagement.AddDocuments')}
                                <VisuallyHiddenInput type="file" multiple={true} onChange={async (e: any) => {
                                    const fs: { fileName: string, bytes: Buffer | Uint8Array }[] = []
                                    for (const f of (e.target.files as unknown) as File[])
                                        fs.push({ fileName: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })

                                    await addDocument(fs)
                                    await fetchAndSetDocuments();
                                }} />
                            </Button>
                            : undefined
                    ]}
                    defaultColumnVisibilityModel={{
                        metadata: false,
                        chunkSize: false,
                        _id: false,
                    }}
                />
            </Paper>

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
                    <Button onClick={async () => {
                        if (dialog.action && typeof dialog.action === 'function')
                            await dialog.action()
                        closeDialog()
                    }}>{t('Patients.Yes')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

