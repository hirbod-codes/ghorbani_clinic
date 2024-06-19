import EditIcon from '@mui/icons-material/EditOutlined';

import { useState, useEffect } from "react";
import { Grid, List, ListItemButton, ListItemText, Paper } from "@mui/material";
import { t } from "i18next";
import { roles } from "../../Electron/Database/Repositories/Auth/dev-permissions";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { User } from '../../Electron/Database/Models/User';

export function Users() {
    const filteredRoles = Object.entries(roles).filter(arr => arr[1] !== roles.ADMIN).map(arr => arr[1])

    const [role, setRole] = useState<string>(filteredRoles[0])

    const [columns, setColumns] = useState<GridColDef<any>[]>([
        {
            field: 'username',
            headerName: t('username'),
            headerAlign: 'center',
            type: 'string',
        },
        {
            field: 'createdAt',
            headerName: t('createdAt'),
            headerAlign: 'center',
            type: 'number',
        },
        {
            field: 'updatedAt',
            headerName: t('updatedAt'),
            headerAlign: 'center',
            type: 'number',
        },
        {
            field: 'actions',
            headerName: '',
            headerAlign: 'center',
            type: 'actions',
            getActions: () => [
                <GridActionsCellItem icon={<EditIcon />} onClick={() => { }} label={t('manageRole')} />,
            ]
        },
    ])
    const [rows, setRows] = useState([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    const updateDataGrid = async (role: string) => {
        setRole(role)
        setLoading(true)

        const response = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getUsers()
        if (response.code !== 200) {
            setLoading(false)
            return
        }

        const users = response.data
        console.log(users)
        setUsers(users)

        setRows(users.map((u, i) => ({
            id: i,
            username: u.username,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        })))
    }

    useEffect(() => {
        updateDataGrid(filteredRoles[0])
    }, [])

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={2}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <List>
                            {filteredRoles.map((r, i) =>
                                <ListItemButton key={i} selected={role === r} onClick={() => { updateDataGrid(r) }}>
                                    <ListItemText primary={t(r)} />
                                </ListItemButton>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={10}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <DataGrid
                            columns={columns}
                            rows={rows}
                            loading={loading}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}
