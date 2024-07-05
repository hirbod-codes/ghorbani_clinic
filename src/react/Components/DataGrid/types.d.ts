import React from 'react';
import { GridColDef } from '@mui/x-data-grid';

type DataGrid = {
    data: any[],
    idField?: string,
    orderedColumnsFields?: string[],
    customToolbar?: React.ReactNode[],
    overWriteColumns?: GridColDef<any>[],
    additionalColumns?: GridColDef<any>[],
    hiddenColumns?: string[],
    autoSizing?: boolean,
    loading?: boolean,
    hideFooter?: boolean,
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
};
