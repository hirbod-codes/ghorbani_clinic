import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';

import { useState, useEffect, useContext, ReactNode } from "react";
import { AlertColor, AlertPropsColorOverrides, Grid, List, ListItemButton, ListItemText, ListItemIcon, Paper, Typography, Button, Divider, Box, Stack, IconButton } from "@mui/material";
import { t } from "i18next";
import { roles } from "../../Electron/Database/Repositories/Auth/dev-permissions";
import { DataGrid, GridActionsCellItem, GridColDef, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarExport } from "@mui/x-data-grid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { User } from '../../Electron/Database/Models/User';
import { OverridableStringUnion } from "@mui/types"
import { DATE, fromUnixToFormat } from '../Lib/DateTime/date-time-helpers';
import { ConfigurationContext } from '../ConfigurationContext';

export function Users() {
    const configuration = useContext(ConfigurationContext)

    const filteredRoles = Object.entries(roles).filter(arr => arr[1] !== roles.ADMIN).map(arr => arr[1])

    const [role, setRole] = useState<string>(filteredRoles[0])

    const [columns, setColumns] = useState<GridColDef<any>[]>([
        {
            field: 'actions',
            headerName: '',
            headerAlign: 'center',
            align: 'center',
            type: 'actions',
            getActions: () => [
                <GridActionsCellItem icon={<DeleteIcon />} onClick={() => { }} label={t('manageRole')} />,
            ]
        },
        {
            field: 'username',
            headerName: t('username'),
            headerAlign: 'center',
            align: 'center',
            type: 'string',
        },
        {
            field: 'createdAt',
            headerName: t('createdAt'),
            headerAlign: 'center',
            align: 'center',
            type: 'number',
            valueFormatter: (createdAt: number) => fromUnixToFormat(configuration.get.locale, createdAt, DATE),
            width: 200,
        },
        {
            field: 'updatedAt',
            headerName: t('updatedAt'),
            headerAlign: 'center',
            align: 'center',
            type: 'number',
            valueFormatter: (updatedAt: number) => fromUnixToFormat(configuration.get.locale, updatedAt, DATE),
            width: 200,
        },
    ])
    const [rows, setRows] = useState([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        setLoading(true)
        const response = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getUsers()
        setLoading(false)
        if (response.code !== 200)
            return

        setUsers(response.data)
    }

    const updateDataGrid = async (role: string) => {
        setRole(role)

        if (!users || users.length === 0)
            await fetchUsers()

        setRows(users.filter(u => u.roleName === role).map((u, i) => ({
            id: i,
            username: u.username,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        })))
    }

    useEffect(() => {
        updateDataGrid(filteredRoles[0])
    }, [])

    const [result, setResult] = useState<{ message: string, severity: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>, action?: ReactNode } | null>(null)

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={4} md={2}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <Typography textAlign='center' variant='h4'>{t('roles')}</Typography>
                        <List>
                            {filteredRoles.map((r, i) =>
                                <ListItemButton key={i} selected={role === r} onClick={() => { updateDataGrid(r) }}>
                                    <ListItemIcon>
                                        <EditIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t(r)} />
                                </ListItemButton>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={8} md={10}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <Stack direction='column' height={'100%'} alignItems='stretch' justifyContent='flex-start'>
                            <Button variant='outlined' fullWidth onClick={() => { }}>{t('edit')}</Button>
                            <Divider sx={{ m: 1 }} />
                            <Box flexGrow={1} height='100%'>
                                <DataGrid
                                    slots={{
                                        toolbar: () => (
                                            <GridToolbarContainer>
                                                <GridToolbarColumnsButton />
                                                <GridToolbarFilterButton />
                                                <GridToolbarDensitySelector />
                                                <GridToolbarExport />
                                                <Button onClick={async () => await fetchUsers()} startIcon={<RefreshIcon />}>{t('Refresh')}</Button>
                                            </GridToolbarContainer>
                                        )
                                    }}
                                    columns={columns}
                                    rows={rows}
                                    loading={loading}
                                    hideFooter
                                />
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}
