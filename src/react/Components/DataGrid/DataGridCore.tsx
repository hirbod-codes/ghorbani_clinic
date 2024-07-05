import { useState, useEffect } from 'react'
import { GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, DataGrid as XDataGrid } from '@mui/x-data-grid';
import { DataGridCore } from './types';

export function DataGridCore({ data, columns, idField = '_id', orderedColumnsFields, hiddenColumns, customToolbar, hideFooter, loading, dimensions, autoSizing = true }: DataGridCore) {
    useEffect(() => {
        if (autoSizing === true && dimensions && Object.entries(dimensions).find(f => f[1] !== null && f[1] !== undefined) !== undefined) {
            console.log('DataGridCore', 'preparing columns', 'start');
            columns = columns.map(c => c.width ? c : (dimensions[c.field] ? ({ ...c, width: (dimensions[c.field]?.offsetWidth + 25) ?? undefined }) : c))
            console.log('DataGridCore', 'preparing columns', 'end');
        }
    }, [dimensions]);

    console.log('DataGridCore', { data, columns, dimensions });

    return (
        <div style={{ height: '100%' }}>
            <XDataGrid
                getRowId={(r) => r[idField]}
                columns={columns}
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
                }} />
        </div>
    );
}
