import { GridColDef } from '@mui/x-data-grid'
import { useState, useEffect } from 'react'
import LoadingScreen from '../LoadingScreen'
import { Box } from '@mui/material'
import { DataGridCore } from './DataGridCore'
import { DataGrid } from './types';
import { getColumns } from './helpers'

export function DataGrid({ data, idField = '_id', orderedColumnsFields, overWriteColumns, additionalColumns, hiddenColumns, autoSizing = true, customToolbar, hideFooter = true, loading = false, serverSidePagination = false, onPaginationMetaChange, onPaginationModelChange }: DataGrid) {
    const [columns, setColumns] = useState<GridColDef<any>[] | undefined>(undefined)

    useEffect(() => {
        console.log('DataGrid', 'useEffect', 'start')
        setColumns(getColumns(data, overWriteColumns, additionalColumns, orderedColumnsFields))
        console.log('DataGrid', 'useEffect', 'end')
    }, [overWriteColumns, additionalColumns, orderedColumnsFields])

    const dimensions: { [k: string]: any } = Object.fromEntries(columns?.map(c => ([c.field, null])) ?? [])

    console.log('DataGrid', { data, columns, dimensions })

    if (!columns || columns?.length === 0)
        return (<LoadingScreen />)

    return (
        <>
            {autoSizing && columns?.map((c, i) =>
                <Box key={i} ref={ref => dimensions[c.field] = ref} style={{ display: 'inline', color: '#00000000', position: 'absolute', bottom: '0', left: '0' }}>
                    {data.reduce((pv, cv, ci, arr) => {
                        if (!cv[c.field])
                            return undefined

                        let cvLength

                        if (typeof cv[c.field] === 'number' || typeof cv[c.field] === 'bigint')
                            cvLength = cv[c.field]
                        else if (Array.isArray(cv[c.field]) || typeof cv[c.field] === 'string')
                            cvLength = cv[c.field].length
                        else
                            return undefined

                        let presentableValue = cv[c.field]
                        if (c.valueGetter)
                            presentableValue = c.valueGetter(cv[c.field] as never, cv, c, {} as any)
                        if (c.valueFormatter)
                            presentableValue = c.valueFormatter(cv[c.field] as never, cv, c, {} as any)

                        if (!pv)
                            return { max: cvLength, v: presentableValue }

                        if (cvLength > pv.max)
                            return { max: cvLength, v: presentableValue }
                        else
                            return pv
                    }, null)?.v.toString()}
                </Box>
            )}
            <DataGridCore
                data={data}
                columns={columns ?? []}
                idField={idField}
                orderedColumnsFields={orderedColumnsFields}
                hiddenColumns={hiddenColumns}
                customToolbar={customToolbar}
                hideFooter={hideFooter}
                loading={loading}
                autoSizing={autoSizing}
                dimensions={dimensions}
                serverSidePagination={serverSidePagination}
                onPaginationMetaChange={onPaginationMetaChange}
                onPaginationModelChange={onPaginationModelChange}
            />
        </>
    )
}
