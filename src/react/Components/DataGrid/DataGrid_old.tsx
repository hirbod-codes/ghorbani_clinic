import { GridColDef, GridColumnVisibilityModel, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid, useGridApiRef, DataGridProps as XDataGridProps, GridCallbackDetails } from '@mui/x-data-grid';
import { useState, useEffect, useMemo } from 'react'
import { configAPI } from 'src/Electron/Configuration/renderer';
import { Button, CircularProgress } from '@mui/material';

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
            expand: false,
        }

    const apiRef = useGridApiRef()
    const [paginationModelState, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25,
    });

    const [hasInitialized, setHasInitialized] = useState<boolean>(false)
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(undefined)

    console.log('DataGrid')

    const columns = useMemo(() => {
        console.log('DataGrid', 'calculating columns...')
        // return getColumnsOld(data, overWriteColumns, additionalColumns, orderedColumnsFields)
        return [{field: 'aa'}]
    }, [])

    useEffect(() => {
        console.log('DataGrid', 'fetching Column visibility model...')
        if (storeColumnVisibilityModel)
            (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
                .then((c) => {
                    if (c?.columnVisibilityModels) {
                        setColumnVisibilityModel(c.columnVisibilityModels[name])
                    }
                })
    }, [storeColumnVisibilityModel])

    useEffect(() => {
        if (!hasInitialized && apiRef.current && apiRef.current.autosizeColumns) {
            setHasInitialized(true)
            apiRef.current.autosizeColumns()
        }
    }, [])

    return (
        <div style={{ height: '100%' }}>
            {!columns || columns?.length === 0
                ? <CircularProgress />
                : <XDataGrid
                    {...props}
                    getRowId={(r) => r[idField]}
                    pageSizeOptions={[10, 25, 50, 100]}
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
                    columnVisibilityModel={columnVisibilityModel}
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
                                <Button onClick={() => apiRef.current.autosizeColumns()} >Resize</Button>
                                {...(customToolbar ?? [])}
                            </GridToolbarContainer>
                        )
                    }}
                    apiRef={apiRef}
                    autosizeOptions={autosizeOptions}
                />}
        </div>
    )
}
