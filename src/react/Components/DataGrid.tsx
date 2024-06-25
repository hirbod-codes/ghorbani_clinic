import { GridActionsCellItemProps, GridColDef, GridRowParams, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid } from '@mui/x-data-grid'
import { t } from 'i18next'
import React from 'react'
import LoadingScreen from './LoadingScreen'
import { number } from 'yup'
import { Box } from '@mui/material'

const getColumns = (data: any[], overWriteColumns?: GridColDef<any>[], additionalColumns?: GridColDef<any>[], orderedColumnsFields?: string[]): GridColDef<any>[] => {
    if (!data || data.length === 0)
        return []

    let columns: GridColDef<any>[] = Object.keys(data[0]).map(k => ({
        field: k,
        headerName: t(k),
        headerAlign: 'center',
        align: 'center',
        type: 'string',
    }))

    if (overWriteColumns)
        for (let i = 0; i < overWriteColumns.length; i++) {
            const index = columns.findIndex(c => c.field === overWriteColumns[i].field)
            if (index === -1)
                continue

            let entries = Object.entries(columns[index]).map(arr => {
                if (Object.keys(overWriteColumns[i]).includes(arr[0]))
                    arr[1] = (overWriteColumns[i] as any)[arr[0]]
                return arr
            })

            entries = entries.concat(Object.entries(overWriteColumns[i]).filter(f => entries.find(e => e[0] === f[0]) === undefined))

            columns[index] = Object.fromEntries(entries) as GridColDef<any>
        }

    if (additionalColumns)
        columns = columns.concat(additionalColumns)

    if (orderedColumnsFields)
        for (let i = orderedColumnsFields.length - 1; i >= 0; i--) {
            let c = columns.find(c => c.field === orderedColumnsFields[i])
            if (c === undefined)
                continue

            columns = columns.filter(column => column.field !== c.field)
            columns.unshift(c)
        }

    return columns
}

type DataGrid = {
    data: any[],
    idField?: string,
    orderedColumnsFields?: string[],
    customToolbar?: React.ReactNode[],
    overWriteColumns?: GridColDef<any>[],
    additionalColumns?: GridColDef<any>[],
    hiddenColumns?: string[],
    loading?: boolean,
    hideFooter?: boolean,
}

export default function DataGrid({ data, idField = '_id', orderedColumnsFields = undefined, overWriteColumns, additionalColumns, hiddenColumns, customToolbar, hideFooter = true, loading = false }: DataGrid) {
    let columns = getColumns(data, overWriteColumns, additionalColumns, orderedColumnsFields)
    const dimensionsRef = React.useRef<{ [k: string]: any }>(Object.fromEntries(columns.map(c => ([c.field, null]))))
    const hasMeasured = React.useRef<boolean>(false)

    console.log('DataGrid', 'data', data)
    console.log('DataGrid', 'columns', columns)
    console.log('DataGrid', 'dimensionsRef.current', dimensionsRef.current)

    React.useEffect(() => {
        console.log('DataGrid', 'useEffect')
        dimensionsRef.current = Object.fromEntries(columns.map(c => ([c.field, null])))
        hasMeasured.current = false
    }, [])

    if (!columns || columns.length === 0)
        return (<LoadingScreen />)

    if (!hasMeasured.current && Object.entries(dimensionsRef.current).length > 0 && Object.entries(dimensionsRef.current).find(d => d[1] === null) === undefined) {
        console.log('DataGrid', 'final dimensionsRef.current', dimensionsRef.current)
        columns = columns.map(c => {
            console.log('DataGrid', 'dimensionsRef.current[c.field].offsetWidth', dimensionsRef.current[c.field]?.offsetWidth ?? undefined)
            return ({ ...c, width: (dimensionsRef.current[c.field]?.offsetWidth + 25) ?? undefined })
        })
        console.log('DataGrid', 'casted columns', columns)
        hasMeasured.current = true
    }

    if (!hasMeasured.current)
        return (
            <>
                {columns.map((c, i) => {
                    console.log('DataGrid', 'columns', 'map', 'column', i, c)
                    return <Box key={i} ref={ref => dimensionsRef.current[c.field] = ref} style={{ display: 'inline', position: 'absolute', bottom: '0', left: '0', border: '1px solid red' }}>
                        {
                            data.reduce((pv, cv, ci, arr) => {
                                if (!cv[c.field])
                                    return undefined

                                let cvLength

                                if (number().required().isValidSync(cv[c.field]))
                                    cvLength = cv[c.field]
                                else
                                    cvLength = cv[c.field].length

                                if (!pv)
                                    return { max: cvLength, v: cv }

                                if (cvLength > pv.max)
                                    return { max: cvLength, v: cv }

                                else
                                    return pv
                            }, null)?.v[c.field].toString()
                        }
                    </Box>
                }
                )}
                <LoadingScreen />
            </>
        )

    return (
        <XDataGrid
            getRowId={(r) => r[idField]}
            columns={columns}
            rows={data}
            hideFooter={hideFooter}
            loading={loading}
            density='compact'
            initialState={{
                columns: {
                    orderedFields: orderedColumnsFields,
                    columnVisibilityModel: Object.fromEntries(hiddenColumns?.map(hc => [hc, false]) ?? [])
                }
            }}
            slots={{
                toolbar: () => (
                    <GridToolbarContainer>
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                        <GridToolbarExport />
                        {...(customToolbar ?? [])}
                    </GridToolbarContainer>
                )
            }}
        />
    )
}
