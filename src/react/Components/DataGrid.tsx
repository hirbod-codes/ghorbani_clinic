import { GridColDef, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid } from '@mui/x-data-grid'
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
    autoSizing?: boolean,
    loading?: boolean,
    hideFooter?: boolean,
}

export function DataGrid({ data, idField = '_id', orderedColumnsFields, overWriteColumns, additionalColumns, hiddenColumns, autoSizing = true, customToolbar, hideFooter = true, loading = false }: DataGrid) {
    let columns = getColumns(data, overWriteColumns, additionalColumns, orderedColumnsFields)

    const dimensions: { [k: string]: any } = Object.fromEntries(columns.map(c => ([c.field, null])))

    console.log('DataGrid', { data, columns, dimensions })

    if (!columns || columns.length === 0)
        return (<LoadingScreen />)

    return (
        <>
            {columns.map((c, i) =>
                <Box key={i} ref={ref => dimensions[c.field] = ref} style={{ display: 'inline', color: '#00000000', position: 'absolute', bottom: '0', left: '0', border: '1px solid red' }}>
                    {data.reduce((pv, cv, ci, arr) => {
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
                    }, null)?.v[c.field].toString()}
                </Box>
            )}
            < DataGridCore
                data={data}
                columns={columns}
                idField={idField}
                orderedColumnsFields={orderedColumnsFields}
                hiddenColumns={hiddenColumns}
                customToolbar={customToolbar}
                hideFooter={hideFooter}
                loading={loading}
                autoSizing={autoSizing}
                dimensions={dimensions}
            />
        </>
    )
}

type DataGridCore = {
    data: any[],
    columns: GridColDef<any>[],
    dimensions?: { [k: string]: any }
    idField?: string,
    orderedColumnsFields?: string[],
    customToolbar?: React.ReactNode[],
    hiddenColumns?: string[],
    autoSizing?: boolean,
    loading?: boolean,
    hideFooter?: boolean,
}

export function DataGridCore({ data, columns, idField = '_id', orderedColumnsFields, hiddenColumns, customToolbar, hideFooter, loading, dimensions, autoSizing = true }: DataGridCore) {
    const [preparedColumns, setPreparedColumns] = React.useState(columns)

    console.log('DataGridCore', { data, columns, dimensions })

    React.useEffect(() => {
        if (autoSizing === true && Object.entries(dimensions).find(f => f[1] !== null && f[1] !== undefined) !== undefined)
            setPreparedColumns(columns.map(c => dimensions[c.field] ? ({ ...c, width: (dimensions[c.field]?.offsetWidth + 25) ?? undefined }) : c))
    }, [dimensions])

    return (
        <div style={{ height: '100%' }}>
            <XDataGrid
                getRowId={(r) => r[idField]}
                columns={preparedColumns}
                rows={data}
                hideFooter={hideFooter ?? true}
                loading={loading ?? false}
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
        </div>
    )
}
