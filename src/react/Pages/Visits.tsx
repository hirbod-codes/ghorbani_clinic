import { useState, useContext, useEffect, useMemo, memo } from "react";
import { DataGrid } from "../Components/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import { t } from "i18next";
import { Button, CircularProgress, Grid, IconButton, Paper } from "@mui/material";
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
import { ColumnDef } from "@tanstack/react-table";

export const Visits = memo(function Visits() {
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

    const init = async (offset: number, limit: number): Promise<boolean> => {
        console.log('init', 'start');

        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisits(offset, limit)
        console.log('fetchVisits', 'res', res)

        if (res.code !== 200 || !res.data) {
            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('Visits.failedToFetchVisits')
            })
            return false
        }

        if (res.data.length > 0) {
            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('Patients.successfullyFetchedVisits')
            })

            setVisits(res.data)
            return true
        }

        console.log('init', 'end');
        return false
    }

    const [showGrid, setShowGrid] = useState(false)
    useEffect(() => {
        console.log('Visits', 'useEffect2', 'start');

        if (visits.length === 0)
            init(page.offset, page.limit).then(() => setLoading(false))

        subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
            if (e?.detail === '/Visits')
                setShowGrid(true)
        })
    }, [])

    const deletesVisit = useMemo(() => auth.user && auth.accessControl && auth.accessControl.can(auth.user.roleName).delete(resources.VISIT), [auth])

    const overWriteColumns: ColumnDef<any>[] = [
        {
            id: 'diagnosis',
            accessorKey: 'diagnosis',
            cell: ({ row }) => <Button onClick={() => setShowDiagnosis(visits.find(v => v._id === row.original._id)?._id as string)}>{t('Visits.Show')}</Button>
        },
        {
            id: 'treatments',
            accessorKey: 'treatments',
            cell: ({ row }) => (<Button onClick={() => setShowTreatments(visits.find(v => v._id === row.original._id)?._id as string)}>{t('Visits.Show')}</Button>)
        },
        {
            accessorKey: '_id',
            id: '_id',
        },
        {
            id: 'due',
            accessorKey: 'due',
            cell: ({ getValue }) => fromUnixToFormat(configuration.get.locale, Number(getValue() as string), DATE),
        },
        {
            id: 'createdAt',
            accessorKey: 'createdAt',
            cell: ({ getValue }) => fromUnixToFormat(configuration.get.locale, Number(getValue() as string), DATE),
        },
        {
            id: 'updatedAt',
            accessorKey: 'updatedAt',
            cell: ({ getValue }) => fromUnixToFormat(configuration.get.locale, Number(getValue() as string), DATE),
        },
    ]

    const additionalColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'actions',
            id: 'actions',
            cell: ({ row }) =>
                deletesVisit &&
                <IconButton
                    onClick={async () => {
                        try {
                            console.group('Visits', 'deletesVisit', 'onClick')

                            setDeletingVisitId(row.original._id)
                            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteVisit(row.original._id)
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
                    }}
                >
                    {deletingVisitId === row.original._id ? <CircularProgress size={20} /> : <DeleteOutline />}
                </IconButton>

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
                                configName='visits'
                                data={visits}
                                overWriteColumns={overWriteColumns}
                                defaultColumnOrderModel={['actions', 'patientId', 'due']}
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
                                    <Button onClick={async () => await init(page.offset, page.limit)} startIcon={<RefreshOutlined />}>{t('Visits.Refresh')}</Button>,
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
})
