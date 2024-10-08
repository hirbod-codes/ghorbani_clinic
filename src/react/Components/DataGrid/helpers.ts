import { GridColDef } from '@mui/x-data-grid';
import { t } from 'i18next';

export const getColumns = (data: any[], overWriteColumns?: GridColDef<any>[], additionalColumns?: GridColDef<any>[], orderedColumnsFields?: string[]): GridColDef<any>[] => {
    if (!data || data.length === 0)
        return [];

    let columns: GridColDef<any>[] = Object.keys(data[0]).map(k => ({
        field: k,
        headerName: t(`Columns.${k}`),
        headerAlign: 'center',
        align: 'center',
        type: 'string',
    }));

    if (overWriteColumns)
        for (let i = 0; i < overWriteColumns.length; i++) {
            const index = columns.findIndex(c => c.field === overWriteColumns[i].field);
            if (index === -1)
                continue;

            let entries = Object.entries(columns[index])
                .map(
                    arr => {
                        if (Object.keys(overWriteColumns[i]).includes(arr[0]))
                            arr[1] = (overWriteColumns[i] as any)[arr[0]];
                        return arr;
                    }
                )

            entries = entries.concat(Object.entries(overWriteColumns[i]).filter(f => entries.find(e => e[0] === f[0]) === undefined));

            columns[index] = Object.fromEntries(entries) as GridColDef<any>;
        }

    if (additionalColumns)
        columns = columns.concat(additionalColumns);

    if (orderedColumnsFields)
        for (let i = orderedColumnsFields.length - 1; i >= 0; i--) {
            let c = columns.find(c => c.field === orderedColumnsFields[i]);
            if (c === undefined)
                continue;

            columns = columns.filter(column => column.field !== c.field);
            columns.unshift(c);
        }

    return columns;
};
