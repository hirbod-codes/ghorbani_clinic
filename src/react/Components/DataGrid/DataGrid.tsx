import { GridAutosizeOptions, GridPaginationMeta, GridCallbackDetails, GridColDef, GridColumnVisibilityModel, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid, useGridApiRef, GridDensity } from '@mui/x-data-grid';
import { useState, useEffect, ReactNode } from 'react'
import LoadingScreen from '../LoadingScreen'
import { getColumns } from './helpers'
import { configAPI } from '../../../Electron/Configuration/renderer/configAPI';

export type DataGridProps = DataGridCoreProps & {
    name?: string;
    storeColumnVisibilityModel?: boolean;
}

export function DataGrid({ name, storeColumnVisibilityModel, onColumnVisibilityModelChange, ...props }: DataGridProps) {
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({})

    useEffect(() => {
        (window as typeof window & { configAPI: configAPI; }).configAPI.readConfig()
            .then((c) => {
                if (c?.columnVisibilityModels)
                    setColumnVisibilityModel(c.columnVisibilityModels[name])
            })
    }, [])

    return (
        <DataGridCore
            {...props}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(model, details) => {
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
        />
    )
}

export type DataGridCoreProps = {
    data: any[];
    idField?: string;
    orderedColumnsFields?: string[];
    customToolbar?: React.ReactNode[];
    overWriteColumns?: GridColDef<any>[];
    additionalColumns?: GridColDef<any>[];
    hiddenColumns?: string[];
    autosizeOptions?: GridAutosizeOptions;
    loading?: boolean;
    hideFooter?: boolean;
    density?: GridDensity;
    paginationModel?: GridPaginationModel;
    serverSidePagination?: boolean;
    onPaginationMetaChange?: (paginationMeta: GridPaginationMeta) => void;
    onPaginationModelChange?: (model: GridPaginationModel, details: GridCallbackDetails<any>) => void;
    columnVisibilityModel?: GridColumnVisibilityModel;
    onColumnVisibilityModelChange?: (model: GridColumnVisibilityModel, details: GridCallbackDetails<any>) => void;
}

export function DataGridCore({
    data,
    idField = '_id',
    orderedColumnsFields,
    overWriteColumns,
    additionalColumns,
    hiddenColumns,
    autosizeOptions,
    customToolbar,
    density = 'compact',
    hideFooter = true,
    loading = false,
    paginationModel,
    serverSidePagination = false,
    onPaginationMetaChange,
    onPaginationModelChange,
    columnVisibilityModel,
    onColumnVisibilityModelChange
}: DataGridCoreProps) {
    if (!autosizeOptions)
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

    const [columns, setColumns] = useState<GridColDef<any>[]>([])

    useEffect(() => {
        setColumns(getColumns(data, overWriteColumns, additionalColumns, orderedColumnsFields))
    }, [data, overWriteColumns, additionalColumns, orderedColumnsFields])

    console.log('DataGrid', {
        columns,
        data,
        idField,
        orderedColumnsFields,
        overWriteColumns,
        additionalColumns,
        hiddenColumns,
        autosizeOptions,
        customToolbar,
        density,
        hideFooter,
        loading,
        paginationModel,
        serverSidePagination,
        onPaginationMetaChange,
        onPaginationModelChange,
        columnVisibilityModel,
        onColumnVisibilityModelChange,
    })

    if (!columns || columns?.length === 0)
        return (<LoadingScreen />)

    return (
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
                pageSizeOptions={[1, 25, 50, 100]}
                pagination
                rowSelection={false}
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
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(model, details) => {
                    console.log({ model, details });

                    if (onColumnVisibilityModelChange)
                        onColumnVisibilityModelChange(model, details)
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
    )
}
