import * as React from 'react';
import { DataGrid, GridPaginationMeta } from '@mui/x-data-grid';
import { createFakeServer } from '@mui/x-data-grid-generator';

const SERVER_OPTIONS = {
    useCursorPagination: false,
};

const rowLength = 98;

const { useQuery, columns, columnsWithDefaultColDef, initialState } = createFakeServer({ rowLength }, SERVER_OPTIONS);

export default function ServerPaginationGridNoRowCount() {
    const [paginationModel, setPaginationModel] = React.useState({
        page: 0,
        pageSize: 5,
    });

    const {
        isLoading,
        rows,
        pageInfo: { hasNextPage },
    } = useQuery(paginationModel);

    console.log('rows', rows)
    console.log('columns', columns)
    console.log('columnsWithDefaultColDef', columnsWithDefaultColDef)
    console.log('initialState', initialState)

    const paginationMetaRef = React.useRef<GridPaginationMeta>();

    // Memoize to avoid flickering when the `hasNextPage` is `undefined` during refetch
    const paginationMeta = React.useMemo(() => {
        if (
            hasNextPage !== undefined &&
            paginationMetaRef.current?.hasNextPage !== hasNextPage
        ) {
            paginationMetaRef.current = { hasNextPage };
        }
        return paginationMetaRef.current;
    }, [hasNextPage]);

    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={rows}
                rowCount={-1}
                columns={columns}
                initialState={{ ...initialState, pagination: { rowCount: -1 } }}
                paginationMeta={paginationMeta}
                loading={isLoading}
                pageSizeOptions={[5, 10, 25, 50]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={setPaginationModel}
            />
        </div>
    );
}
