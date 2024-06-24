import { useState, useEffect, useContext } from "react";
import DataGrid from "../Components/DataGrid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { ResultContext } from "../ResultContext";
import { t } from "i18next";

export default function Visits() {
    const setResult = useContext(ResultContext).setResult

    const [visits, setVisits] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchVisits = async () => {
        setLoading(true)
        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisits()
        console.log('fetchVisits', 'res', res)
        setLoading(false)

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

    useEffect(() => { fetchVisits() }, [])

    return (
        <>
            <DataGrid data={visits} hideFooter={false} />
        </>
    )
}

