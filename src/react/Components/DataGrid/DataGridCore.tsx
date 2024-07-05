import { useState, useEffect } from 'react'
import { GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid } from '@mui/x-data-grid';
import { DataGridCore } from './types';

export function DataGridCore({ data, columns, idField = '_id', orderedColumnsFields, hiddenColumns, customToolbar, hideFooter, loading, dimensions, autoSizing = true, serverSidePagination = false, onPaginationMetaChange, onPaginationModelChange }: DataGridCore) {
    const [preparedColumns, setColumns] = useState(columns)
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });

    useEffect(() => {
        if (autoSizing === true && dimensions && Object.entries(dimensions).find(f => f[1] !== null && f[1] !== undefined) !== undefined) {
            console.log('DataGridCore', 'preparing columns', 'start');
            setColumns(columns.map(c => c.width ? c : (dimensions[c.field] ? ({ ...c, width: (dimensions[c.field]?.offsetWidth + 25) ?? undefined }) : c)))
            console.log('DataGridCore', 'preparing columns', 'end');
        }
    }, [dimensions]);

    console.log('DataGridCore', { data, columns, dimensions });

    return (
        <div style={{ height: '100%' }}>
            <XDataGrid
                getRowId={(r) => r[idField]}
                columns={preparedColumns}
                rows={data}
                hideFooter={hideFooter ?? true}
                loading={loading ?? false}
                density='compact'
                rowCount={serverSidePagination ? -1 : undefined}
                paginationMode={serverSidePagination ? 'server' : 'client'}
                pagination
                paginationModel={serverSidePagination ? paginationModel : undefined}
                onPaginationMetaChange={onPaginationMetaChange}
                onPaginationModelChange={(m, d) => { setPaginationModel(m); onPaginationModelChange(m, d) }}
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
    );
}
