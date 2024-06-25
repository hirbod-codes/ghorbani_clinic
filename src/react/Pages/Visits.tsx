import { useState, useContext, useRef } from "react";
import { DataGrid } from "../Components/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { ResultContext } from "../ResultContext";
import { t } from "i18next";
import { Grid, Paper } from "@mui/material";
import LoadingScreen from "../Components/LoadingScreen";

export default function Visits() {
    const setResult = useContext(ResultContext).setResult

    const [visits, setVisits] = useState([])
    const [loading, setLoading] = useState(true)

    const init = async () => {
        setLoading(true)
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisits()
        console.log('fetchVisits', 'res', res)
        setLoading(false)

        if (res.code !== 200 || !res.data) {
            // setResult({
            //     severity: 'error',
            //     message: t('failedToFetchVisits')
            // })
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

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={12} height={'100%'}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <DataGrid
                            data={visits}
                            hideFooter={false}
                            orderedColumnsFields={['actions']}
                            hiddenColumns={['_id']} />
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

