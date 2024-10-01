import { GridColDef, GridColumnVisibilityModel, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid, useGridApiRef, DataGridProps as XDataGridProps, GridCallbackDetails } from '@mui/x-data-grid';
import { useState, useEffect, useMemo } from 'react'
import { getColumns } from './helpers'
import { configAPI } from 'src/Electron/Configuration/renderer';
import { CircularProgress } from '@mui/material';

export type DataGridProps = {
    name?: string;
    data: any[];
    storeColumnVisibilityModel?: boolean;
    idField?: string;
    orderedColumnsFields?: string[];
    customToolbar?: React.ReactNode[];
    overWriteColumns?: GridColDef<any>[];
    additionalColumns?: GridColDef<any>[];
    serverSidePagination?: boolean;
} & Omit<XDataGridProps, 'columns'>

export function DataGrid(props: DataGridProps) {
    const {
        name,
        data,
        idField = '_id',
        orderedColumnsFields,
        overWriteColumns,
        additionalColumns,
        customToolbar,
        paginationModel,
        serverSidePagination,
        onPaginationModelChange,
        storeColumnVisibilityModel
    } = props

    let autosizeOptions = props.autosizeOptions

    if (!props.autosizeOptions)
        autosizeOptions = {
            includeHeaders: true,
            includeOutliers: true,
            outliersFactor: 1,
            expand: false,
        }

    const apiRef = useGridApiRef()
    const [paginationModelState, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25,
    });

    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(undefined)

    console.log('DataGrid')

    const columns = useMemo(() => {
        console.log('DataGrid', 'calculating columns...')
        return getColumns(data, overWriteColumns, additionalColumns, orderedColumnsFields)
    }, [])

    useEffect(() => {
        console.log('DataGrid', 'fetching Column visibility model...')
        if (storeColumnVisibilityModel && !columnVisibilityModel)
            (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
                .then((c) => {
                    if (c?.columnVisibilityModels)
                        setColumnVisibilityModel(c.columnVisibilityModels[name])
                })
    }, [])

    return (
        <div style={{ height: '100%' }}>
            {!columns || columns?.length === 0
                ? <CircularProgress />
                : <XDataGrid
                    {...props}
                    getRowId={(r) => r[idField]}
                    columns={columns}
                    rows={data}
                    rowCount={serverSidePagination ? -1 : undefined}
                    paginationMode={serverSidePagination ? 'server' : 'client'}
                    pagination
                    rowSelection={false}
                    paginationModel={serverSidePagination ? (paginationModel ?? paginationModelState) : undefined}
                    onPaginationModelChange={serverSidePagination
                        ? (m, d) => {
                            console.log({ m, d });

                            if (!paginationModel)
                                setPaginationModel(m);

                            if (onPaginationModelChange)
                                onPaginationModelChange(m, d)
                        }
                        : undefined
                    }
                    onColumnVisibilityModelChange={(model: GridColumnVisibilityModel, details: GridCallbackDetails<any>) => {
                        console.log({ model, details });

                        setColumnVisibilityModel(model)

                        if (!storeColumnVisibilityModel)
                            return

                        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
                            .then((c) => {
                                if (!c.columnVisibilityModels)
                                    c.columnVisibilityModels = {}

                                c.columnVisibilityModels[name] = model;

                                (window as typeof window & { configAPI: configAPI; }).configAPI.writeConfig({ ...c })
                            })
                    }}
                    initialState={{
                        columns: {
                            orderedFields: orderedColumnsFields,
                            columnVisibilityModel: columnVisibilityModel
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
                />}
        </div>
    )
}
