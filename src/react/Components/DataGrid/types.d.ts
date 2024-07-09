import React from 'react';
import { GridAutosizeOptions, GridCallbackDetails, GridColDef, GridColumnVisibilityModel, GridPaginationMeta, GridPaginationModel } from '@mui/x-data-grid';

export type DataGrid = {
    name: string;
    data: any[];
    idField?: string;
    orderedColumnsFields?: string[];
    customToolbar?: React.ReactNode[];
    overWriteColumns?: GridColDef<any>[];
    additionalColumns?: GridColDef<any>[];
    hiddenColumns?: string[];
    storeColumnVisibilityModel?: boolean;
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
