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
import { Patient } from "../../Electron/Database/Models/Patient";

export function Patients() {
    const setResult = useContext(ResultContext).setResult
    const configuration = useContext(ConfigurationContext)

    const [loading, setLoading] = useState<boolean>(true)
    const [patients, setPatients] = useState<Patient[]>([])

    const [showingStringArray, setShowingStringArray] = useState<string[] | undefined>(undefined)

    console.log('Patients', { setResult, configuration, patients, showingStringArray })

    const init = async (offset: number, limit: number) => {
        setLoading(true)
        console.log('init', 'start');
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPatients(offset, limit)
        console.log('fetchPatients', 'res', res)
        setLoading(false)

        if (res.code !== 200 || !res.data) {
            setResult({
                severity: 'error',
                message: t('failedToFetchPatients')
            })
            return
        }

        setResult({
            severity: 'success',
            message: t('successfullyFetchedPatients')
        })
        setPatients(res.data)

        console.log('init', 'end');
    }

    useEffect(() => {
        console.log('Patients', 'useEffect', 'start');
        init(0, 25).then(() => console.log('useEffect', 'end'))
    }, [])

    if (!patients || patients.length === 0)
        return (<LoadingScreen />)

    const columns: GridColDef<any>[] = [
        {
            field: 'address',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.address ? <Button onClick={() => { const a = patients.find(p => p._id === params.row._id)?.address; setShowingStringArray(a ? [a] : undefined) }}>{t('Show')}</Button> : null)
        },
        {
            field: 'medicalHistory',
            type: 'actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<any, Date>) => (params.row.medicalHistory && params.row.medicalHistory.length !== 0 ? <Button onClick={() => setShowingStringArray(patients.find(p => p._id === params.row._id)?.medicalHistory)}>{t('Show')}</Button> : null)
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
                            data={patients}
                            hideFooter={false}
                            overWriteColumns={columns}
                            autoSizing
                            loading={loading}
                            serverSidePagination
                            onPaginationModelChange={async (m, d) => await init(m.page, m.pageSize)}
                            orderedColumnsFields={['actions']}
                            hiddenColumns={['_id']} />
                    </Paper>
                </Grid>
            </Grid>

            <Modal
                onClose={() => setShowingStringArray(undefined)}
                open={showingStringArray !== undefined}
                closeAfterTransition
                disableEscapeKeyDown
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={showingStringArray !== undefined ? 'up' : 'down'} in={showingStringArray !== undefined} timeout={250}>
                    <Paper sx={{ width: '60%', overflowY: 'auto', height: '80%', padding: '0.5rem 2rem' }}>
                        {showingStringArray && showingStringArray?.map((str, i) =>
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

