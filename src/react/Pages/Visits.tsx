import { useState, useContext, useEffect, useRef } from "react";
import { DataGrid } from "../Components/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { ResultContext } from "../Contexts/ResultContext";
import { t } from "i18next";
import { Button, Grid, Paper } from "@mui/material";
import LoadingScreen from "../Components/LoadingScreen";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";

export default function Visits() {
    const setResult = useContext(ResultContext).setResult
    const configuration = useContext(ConfigurationContext)

    const [visits, setVisits] = useState([])
    const [openShowDiagnosisModal, setOpenShowDiagnosisModal] = useState<boolean>(false)
    const [showingDiagnosis, setShowingDiagnosis] = useState<string | undefined>(undefined)

    const init = async () => {
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisits()
        console.log('fetchVisits', 'res', res)

        if (res.code !== 200 || !res.data) {
            setResult({
                severity: 'error',
                message: t('failedToFetchVisits')
            })
            return
        }

        setResult({
            severity: 'success',
            message: t('successfullyFetchedVisits')
        })
        setVisits(res.data)
    }

    const hasInit = useRef<boolean>(false)

    if (!hasInit.current) {
        hasInit.current = true
        init()
    }

    if (!visits || visits.length === 0)
        return (<LoadingScreen />)

    console.log('Visits', 'visits', visits)

    const columns: GridColDef<any>[] = [
        {
            field: 'diagnosis',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (<Button onClick={() => { setOpenShowDiagnosisModal(true); setShowingDiagnosis(visits.find(v => v._id === params.row._id)._id) }}>{t('Show')}</Button>)
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
                            data={visits}
                            hideFooter={false}
                            overWriteColumns={columns}
                            orderedColumnsFields={['actions']}
                            hiddenColumns={['_id']} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

