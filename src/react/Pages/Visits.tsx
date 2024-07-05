import { useState, useContext, useEffect, useRef } from "react";
import { DataGrid } from "../Components/DataGrid/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { ResultContext } from "../Contexts/ResultContext";
import { t } from "i18next";
import { Button, Grid, Modal, Paper, Slide, Typography } from "@mui/material";
import LoadingScreen from "../Components/LoadingScreen";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { Visit } from "../../Electron/Database/Models/Visit";

export function Visits() {
    const setResult = useContext(ResultContext).setResult
    const configuration = useContext(ConfigurationContext)

    const [visits, setVisits] = useState<Visit[]>([])

    // ID of the visit that is taken for its diagnosis representation
    const [showingDiagnosis, setShowingDiagnosis] = useState<string | undefined>(undefined)

    console.log('Visits', { setResult, configuration, visits, showingDiagnosis })

    const init = async () => {
        console.log('init', 'start');
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

        console.log('init', 'end');
    }

    useEffect(() => {
        console.log('Visits', 'useEffect', 'start');
        init().then(() => console.log('useEffect', 'end'))
    }, [])

    if (!visits || visits.length === 0)
        return (<LoadingScreen />)

    const columns: GridColDef<any>[] = [
        {
            field: 'diagnosis',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.diagnosis && params.row.diagnosis.length !== 0 ? <Button onClick={() => setShowingDiagnosis(visits.find(v => v._id === params.row._id)._id as string)}>{t('Show')}</Button> : null)
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
                            autoSizing={false}
                            orderedColumnsFields={['actions']}
                            hiddenColumns={['_id', 'patientId']} />
                    </Paper>
                </Grid>
            </Grid>

            <Modal
                onClose={() => setShowingDiagnosis(undefined)}
                open={showingDiagnosis !== undefined}
                closeAfterTransition
                disableEscapeKeyDown
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={showingDiagnosis !== undefined ? 'up' : 'down'} in={showingDiagnosis !== undefined} timeout={250}>
                    <Paper sx={{ width: '60%', overflowY: 'auto', height: '80%', padding: '0.5rem 2rem' }}>
                        {showingDiagnosis && visits.find(f => f._id === showingDiagnosis).diagnosis?.map((str, i) =>
                            <Typography key={i} variant='body1'>
                                {str}
                            </Typography>
                        )}
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}
