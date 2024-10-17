import { useState, useContext, useEffect, useMemo } from "react";
import { DataGrid } from "../Components/DataGrid/DataGrid_old";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import { t } from "i18next";
import { Button, CircularProgress, Grid, Paper } from "@mui/material";
import { GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Visit } from "../../Electron/Database/Models/Visit";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish, subscribe } from "../Lib/Events";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { AuthContext } from "../Contexts/AuthContext";
import { DeleteOutline, RefreshOutlined } from "@mui/icons-material";
import { EditorModal } from "../Components/Editor/EditorModal";
import { PAGE_SLIDER_ANIMATION_END_EVENT_NAME } from "./AnimatedLayout";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../Components/LoadingScreen";

export function Visits() {
    const auth = useContext(AuthContext)
    const configuration = useContext(ConfigurationContext)
    const navigate = useNavigate()

    if (!auth.accessControl?.can(auth.user.roleName).read(resources.VISIT).granted)
        navigate('/')

    const [page, setPage] = useState({ offset: 0, limit: 10 })

    const [loading, setLoading] = useState<boolean>(true)
    const [visits, setVisits] = useState<Visit[]>([])

    // ID of the visit that is taken for its diagnosis representation
    const [showDiagnosis, setShowDiagnosis] = useState<string | undefined>(undefined)
    const [showTreatments, setShowTreatments] = useState<string | undefined>(undefined)

    const [deletingVisitId, setDeletingVisitId] = useState<string>()

    console.log('Visits', { configuration, visits, showingDiagnosis: showDiagnosis })

    const updateVisit = async (visit: Visit) => {
        try {
            console.groupCollapsed('updateVisit')

            if (!visit)
                throw new Error('no visit provided to update.')

            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updateVisit(visit)
            console.log({ res })

            if (res.code !== 200 || !res.data) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Visits.failedToUpdateVisit')
                })
                return
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('Visits.successfullyUpdatedVisit')
            })
        } catch (error) {
            console.error(error)
        } finally {
            console.groupEnd()
        }
    }

    const init = async (offset: number, limit: number) => {
        console.log('init', 'start');

        setLoading(true)
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisits(offset, limit)
        console.log('fetchVisits', 'res', res)
        setLoading(false)

        if (res.code !== 200 || !res.data) {
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('Visits.failedToFetchVisits')
            })
            return
        }

        setVisits(res.data)

        console.log('init', 'end');
    }

    const [showGrid, setShowGrid] = useState(false)
    useEffect(() => {
        console.log('Visits', 'useEffect2', 'start');

        if (visits.length === 0)
            init(page.offset, page.limit)

        subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
            if (e?.detail === '/Visits')
                setShowGrid(true)
        })
    }, [])

    const deletesVisit = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.VISIT), [auth])

    const columns: GridColDef<any>[] = [
        {
            field: 'diagnosis',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => {
                return (
                    <Button
                        onClick={() => {
                            console.log({ params, visits })
                            setShowDiagnosis(visits.find(v => v._id === params.row._id)?._id as string);
                        }}
                    >
                        {t('Visits.Show')}
                    </Button>
                );
            }
        },
        {
            field: 'treatments',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (<Button onClick={() => setShowTreatments(visits.find(v => v._id === params.row._id)?._id as string)}>{t('Visits.Show')}</Button>)
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
                    <Paper sx={{ p: 1, height: '100%', overflow: 'auto' }} elevation={3}>
                        {!visits || visits.length === 0 || !showGrid
                            ? <LoadingScreen />
                            : <DataGrid
                                name='visits'
                                data={visits}
                                hideFooter={false}
                                overWriteColumns={columns}
                                loading={loading}
                                serverSidePagination
                                onPaginationModelChange={async (m, d) => {
                                    setPage({ offset: m.page, limit: m.pageSize });
                                    await init(page.offset, page.limit)
                                }}
                                orderedColumnsFields={['actions', 'patientId', 'due']}
                                storeColumnVisibilityModel
                                customToolbar={[
                                    <Button onClick={async () => await init(page.offset, page.limit)} startIcon={<RefreshOutlined />}>{t('Visits.Refresh')}</Button>,
                                ]}
                                additionalColumns={[
                                    {
                                        field: 'actions',
                                        type: 'actions',
                                        headerName: t('Visits.actions'),
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
                                                            message: t('Visits.failedToDeleteVisit')
                                                        })

                                                        return
                                                    }

                                                    publish(RESULT_EVENT_NAME, {
                                                        severity: 'success',
                                                        message: t('Visits.successfullyDeletedVisit')
                                                    })

                                                    await init(page.offset, page.limit)
                                                }
                                                finally { console.groupEnd() }
                                            }} label={t('Visits.delete')} /> : null,
                                        ]
                                    },
                                ]}
                            />
                        }
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
                title={t('Visits.diagnosis')}
                onSave={async (diagnosis, canvasId) => {
                    console.log('ManageVisits', 'diagnosis', 'onChange', diagnosis, canvasId)

                    if (visits.find(f => f._id === showDiagnosis).diagnosis) {
                        visits.find(f => f._id === showDiagnosis).diagnosis = { text: diagnosis, canvas: canvasId }
                        updateVisit(visits.find(f => f._id === showDiagnosis))
                    }
                }}
            />
            <EditorModal
                open={showTreatments !== undefined}
                onClose={() => {
                    setShowTreatments(undefined)
                }}
                text={visits.find(f => f._id === showTreatments)?.treatments.text}
                canvasId={visits.find(f => f._id === showTreatments)?.treatments.canvas as string}
                title={t('Visits.treatments')}
                onSave={async (treatments, canvasId) => {
                    console.log('ManageVisits', 'treatments', 'onChange', treatments, canvasId)

                    if (visits.find(f => f._id === showTreatments).treatments) {
                        visits.find(f => f._id === showTreatments).treatments = { text: treatments, canvas: canvasId }
                        updateVisit(visits.find(f => f._id === showTreatments))
                    }
                }}
            />
        </>
    )
}
