import { GridColDef, GridColumnVisibilityModel, GridPaginationModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid, useGridApiRef, DataGridProps as XDataGridProps } from '@mui/x-data-grid';
import { useState, useEffect } from 'react'
import LoadingScreen from '../LoadingScreen'
import { getColumns } from './helpers'
import { configAPI } from 'src/Electron/Configuration/renderer';

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
    serverSidePagination?: boolean;
} & Omit<XDataGridProps, 'columns'>

export function DataGridCore(props: DataGridCoreProps) {
    const {
        data,
        idField = '_id',
        orderedColumnsFields,
        overWriteColumns,
        additionalColumns,
        hiddenColumns,
        customToolbar,
        paginationModel,
        serverSidePagination,
        onPaginationModelChange,
        onColumnVisibilityModelChange,
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

    const [columns, setColumns] = useState<GridColDef<any>[]>([])

    useEffect(() => {
        setColumns(getColumns(data, overWriteColumns, additionalColumns, orderedColumnsFields))
    }, [data, overWriteColumns, additionalColumns, orderedColumnsFields])

    console.log('DataGrid', props)

    if (!columns || columns?.length === 0)
        return (<LoadingScreen />)

    return (
        <div style={{ height: '100%' }}>
            <XDataGrid
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
                onColumnVisibilityModelChange={(model, details) => {
                    console.log({ model, details });

                    if (onColumnVisibilityModelChange)
                        onColumnVisibilityModelChange(model, details)
                }}
                initialState={{
                    columns: {
                        orderedFields: orderedColumnsFields,
                        columnVisibilityModel: Object.fromEntries(hiddenColumns?.map((hc: any) => [hc, false]) ?? [])
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
