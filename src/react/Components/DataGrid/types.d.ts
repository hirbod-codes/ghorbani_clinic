import React from 'react';
import { GridCallbackDetails, GridColDef, GridPaginationMeta, GridPaginationModel } from '@mui/x-data-grid';

export type DataGrid = {
    data: any[];
    idField?: string;
    orderedColumnsFields?: string[];
    customToolbar?: React.ReactNode[];
    overWriteColumns?: GridColDef<any>[];
    additionalColumns?: GridColDef<any>[];
    hiddenColumns?: string[];
    autoSizing?: boolean;
    loading?: boolean;
    hideFooter?: boolean;
    serverSidePagination?: boolean;
    onPaginationMetaChange?: (paginationMeta: GridPaginationMeta) => void;
    onPaginationModelChange?: (model: GridPaginationModel, details: GridCallbackDetails<any>) => void;
}

export type DataGridCore = {
    data: any[];
    columns: GridColDef<any>[];
    dimensions?: { [k: string]: any; };
    idField?: string;
    orderedColumnsFields?: string[];
    customToolbar?: React.ReactNode[];
    hiddenColumns?: string[];
    autoSizing?: boolean;
    loading?: boolean;
    hideFooter?: boolean;
    serverSidePagination?: boolean;
    onPaginationMetaChange?: (paginationMeta: GridPaginationMeta) => void;
    onPaginationModelChange?: (model: GridPaginationModel, details: GridCallbackDetails<any>) => void;
};
