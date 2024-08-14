import { useState, useContext, useEffect } from "react";
import { DataGrid } from "../Components/DataGrid/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import { t } from "i18next";
import { Button, CircularProgress, Grid, Paper } from "@mui/material";
import LoadingScreen from "../Components/LoadingScreen";
import { GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Visit } from "../../Electron/Database/Models/Visit";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish } from "../Lib/Events";
import { configAPI } from "../../Electron/Configuration/renderer/configAPI";
import { EditorModal } from "../Components/Editor/EditorModal";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { AuthContext } from "../Contexts/AuthContext";
import { DeleteOutline, RefreshOutlined } from "@mui/icons-material";

export function Visits() {
    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)

    const [page, setPage] = useState({ offset: 0, limit: 25 })
    const [hiddenColumns, setHiddenColumns] = useState<string[]>(['_id'])

    const [loading, setLoading] = useState<boolean>(true)
    const [visits, setVisits] = useState<Visit[]>([])

    // ID of the visit that is taken for its diagnosis representation
    const [showDiagnosis, setShowDiagnosis] = useState<string | undefined>(undefined)
    const [showTreatments, setShowTreatments] = useState<string | undefined>(undefined)

    const [deletingVisitId, setDeletingVisitId] = useState<string>()

    console.log('Visits', { configuration, visits, showingDiagnosis: showDiagnosis })

    const init = async (offset: number, limit: number) => {
        setLoading(true)
        console.log('init', 'start');
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisits(offset, limit)
        console.log('fetchVisits', 'res', res)
        setLoading(false)

        if (res.code !== 200 || !res.data) {
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('failedToFetchVisits')
            })
            return
        }

        publish(RESULT_EVENT_NAME, {
            severity: 'success',
            message: t('successfullyFetchedVisits')
        })
        setVisits(res.data)

        console.log('init', 'end');
    }

    useEffect(() => {
        console.log('Visits', 'useEffect', 'start');
        init(page.offset, page.limit).then(() => console.log('useEffect', 'end'))
    }, [page, auth])

    useEffect(() => {
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (c?.columnVisibilityModels?.visits)
                    setHiddenColumns(Object.entries(c.columnVisibilityModels.visits).filter(f => f[1] === false).map(arr => arr[0]))
            })
    }, [])

    const deletesVisit = auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.VISIT)

    if (!visits || visits.length === 0)
        return (<LoadingScreen />)

    const columns: GridColDef<any>[] = [
        {
            field: 'diagnosis',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row?.diagnosis && params.row?.diagnosis.length !== 0 ? <Button onClick={() => setShowDiagnosis(visits.find(v => v._id === params.row._id)._id as string)}>{t('Show')}</Button> : null)
        },
        {
            field: 'treatments',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row?.diagnosis && params.row?.diagnosis.length !== 0 ? <Button onClick={() => setShowTreatments(visits.find(v => v._id === params.row._id)._id as string)}>{t('Show')}</Button> : null)
        },
        {
            field: 'due',
            type: 'number',
            valueFormatter: (createdAt: number) => fromUnixToFormat(configuration.get.locale, createdAt, DATE),
            width: 200,
        },
        {
            field: 'createdAt',
            type: 'number',
            valueFormatter: (createdAt: number) => fromUnixToFormat(configuration.get.locale, createdAt, DATE),
            width: 200,
        },
        {
            field: 'updatedAt',
            type: 'number',
            valueFormatter: (updatedAt: number) => fromUnixToFormat(configuration.get.locale, updatedAt, DATE),
            width: 200,
        },
    ]

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={12} height={'100%'}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <DataGrid
                            name='visits'
                            data={visits}
                            hideFooter={false}
                            overWriteColumns={columns}
                            loading={loading}
                            serverSidePagination
                            onPaginationModelChange={(m, d) => setPage({ offset: m.page, limit: m.pageSize })}
                            orderedColumnsFields={['actions', 'patientId', 'due']}
                            storeColumnVisibilityModel
                            hiddenColumns={hiddenColumns}
                            customToolbar={[
                                <Button onClick={async () => await init(page.offset, page.limit)} startIcon={<RefreshOutlined />}>{t('Refresh')}</Button>,
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
                                        deletesVisit ? <GridActionsCellItem icon={deletingVisitId === row._id ? <CircularProgress size={20} /> : <DeleteOutline />} onClick={async () => {
                                            try {
                                                console.group('Visits', 'deletesVisit', 'onClick')

                                                setDeletingVisitId(row._id)
                                                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteVisit(row._id)
                                                setDeletingVisitId(undefined)

                                                if (res.code !== 200 || !res.data.acknowledged || res.data.deletedCount !== 1) {
                                                    publish(RESULT_EVENT_NAME, {
                                                        severity: 'error',
                                                        message: t('failedToDeleteVisit')
                                                    })

                                                    return
                                                }

                                                publish(RESULT_EVENT_NAME, {
                                                    severity: 'success',
                                                    message: t('successfullyDeletedVisit')
                                                })

                                                await init(page.offset, page.limit)
                                            }
                                            finally { console.groupEnd() }
                                        }} label={t('delete')} /> : null,
                                    ]
                                },
                            ]}
                        />
                    </Paper>
                </Grid>
            </Grid>

            <EditorModal
                open={showDiagnosis !== undefined}
                onClose={() => {
                    setShowDiagnosis(undefined)
                }}
                text={visits.find(f => f._id === showDiagnosis)?.diagnosis.text}
                canvasId={visits.find(f => f._id === showDiagnosis)?.diagnosis.canvas as string}
                title={t('diagnosis')}
                onSave={async (diagnosis, canvasId) => {
                    console.log('ManageVisits', 'diagnosis', 'onChange', diagnosis, canvasId)

                    if (visits.find(f => f._id === showDiagnosis).diagnosis)
                        visits.find(f => f._id === showDiagnosis).diagnosis = { text: diagnosis, canvas: canvasId }

                    setVisits([...visits])
                }}
            />
            <EditorModal
                open={showTreatments !== undefined}
                onClose={() => {
                    setShowTreatments(undefined)
                }}
                text={visits.find(f => f._id === showTreatments)?.treatments.text}
                canvasId={visits.find(f => f._id === showTreatments)?.treatments.canvas as string}
                title={t('treatments')}
                onSave={async (treatments, canvasId) => {
                    console.log('ManageVisits', 'treatments', 'onChange', treatments, canvasId)

                    if (visits.find(f => f._id === showTreatments).treatments)
                        visits.find(f => f._id === showTreatments).treatments = { text: treatments, canvas: canvasId }

                    setVisits([...visits])
                }}
            />
        </>
    )
}
