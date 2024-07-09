import { GridColumnVisibilityModel, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid, useGridApiRef } from '@mui/x-data-grid';
import { useState, useEffect } from 'react'
import LoadingScreen from '../LoadingScreen'
import { DataGrid } from './types';
import { getColumns } from './helpers'
import { configAPI } from '../../../Electron/Configuration/renderer/configAPI';

export function DataGrid({ name, data, idField = '_id', orderedColumnsFields, overWriteColumns, additionalColumns, hiddenColumns, storeColumnVisibilityModel = false, autosizeOptions, customToolbar, density = 'compact', hideFooter = true, loading = false, paginationModel, serverSidePagination = false, onPaginationMetaChange, onPaginationModelChange, columnVisibilityModel, onColumnVisibilityModelChange }: DataGrid) {
    if (!autosizeOptions)
        autosizeOptions = {
            includeHeaders: true,
            includeOutliers: true,
            outliersFactor: 1,
            expand: false,
        }

    const apiRef = useGridApiRef()
    const [columnVisibilityModelState, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>()
    const [paginationModelState, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25,
    });

    const columns = getColumns(data, overWriteColumns, additionalColumns, orderedColumnsFields)

    console.log('DataGrid', { data, columns })

    if (!columns || columns?.length === 0)
        return (<LoadingScreen />)

    return (
        <>
            <div style={{ height: '100%' }}>
                <XDataGrid
                    getRowId={(r) => r[idField]}
                    columns={columns}
                    rows={data}
                    hideFooter={hideFooter ?? true}
                    loading={loading ?? false}
                    density={density}
                    rowCount={serverSidePagination ? -1 : undefined}
                    paginationMode={serverSidePagination ? 'server' : 'client'}
                    pagination
                    paginationModel={serverSidePagination ? (paginationModel ?? paginationModelState) : undefined}
                    onPaginationMetaChange={onPaginationMetaChange}
                    onPaginationModelChange={serverSidePagination
                        ? (m, d) => {
                            if (!paginationModel)
                                setPaginationModel(m);

                            if (onPaginationModelChange)
                                onPaginationModelChange(m, d)
                        }
                        : undefined
                    }
                    columnVisibilityModel={columnVisibilityModel ?? columnVisibilityModelState}
                    onColumnVisibilityModelChange={async (m, d) => {
                        await apiRef.current.autosizeColumns(autosizeOptions)

                        if (!columnVisibilityModel)
                            setColumnVisibilityModel(m)

                        if (storeColumnVisibilityModel) {
                            const c = await (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
                            if (!c.columnVisibilityModels)
                                c.columnVisibilityModels = {}
                            c.columnVisibilityModels[name] = m;
                            (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig({ ...c })
                        }

                        if (onColumnVisibilityModelChange)
                            onColumnVisibilityModelChange(m, d)
                    }}
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
                    autosizeOnMount
                    apiRef={apiRef}
                    autosizeOptions={autosizeOptions}
                />
            </div>
        </>
    )
}
