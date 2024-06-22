import { useState, useEffect, useContext } from "react";
import { AddOutlined, DeleteOutlined, EditOutlined, RefreshOutlined } from '@mui/icons-material';
import { Modal, Slide, Grid, List, ListItemButton, ListItemText, ListItemIcon, Paper, Typography, Button, Divider, Box, Stack, IconButton, Collapse, CircularProgress } from "@mui/material";
import { t } from "i18next";
import { roles as staticRoles } from "../../Electron/Database/Repositories/Auth/dev-permissions";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import { User } from '../../Electron/Database/Models/User';
import { DATE, fromUnixToFormat } from '../Lib/DateTime/date-time-helpers';
import { ConfigurationContext } from '../ConfigurationContext';
import { AuthContext } from "../Lib/AuthContext";
import ManageUser from "../Components/ManageUser";
import ManageRole from "../Components/ManageRole";
import LoadingScreen from '../Components/LoadingScreen';
import { ResultContext } from "../ResultContext";
import { NavigationContext } from "../Lib/NavigationContext";
import DataGrid from "../Components/DataGrid";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";

export function Users() {
    const setResult = useContext(ResultContext).setResult
    const configuration = useContext(ConfigurationContext)
    const auth = useContext(AuthContext)
    const nav = useContext(NavigationContext)

    if (!auth.accessControl?.can(auth.user.roleName).read(resources.USER).granted)
        nav.goHome()

    const [roles, setRoles] = useState<string[] | undefined>(undefined)
    const [role, setRole] = useState<string | undefined>(undefined)
    const [roleActionsCollapse, setRoleActionsCollapse] = useState<string | null>()
    const [openCreateRoleModal, setOpenCreateRoleModal] = useState<boolean>(false)
    const [editingRole, setEditingRole] = useState<string | undefined>(undefined)
    const [deletingRole, setDeletingRole] = useState<string | undefined>(undefined)

    const [openCreateUserModal, setOpenCreateUserModal] = useState<boolean>(false)
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
    const [deletingUser, setDeletingUser] = useState<string | undefined>(undefined)
    const [users, setUsers] = useState<User[]>([])

    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchRoles = async (): Promise<string[] | undefined | null> => {
        setLoading(true)
        const response = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getRoles()
        setLoading(false)
        if (response.code !== 200)
            return

        const filteredRoles = response.data.filter(r => r !== staticRoles.ADMIN)
        setRoles(filteredRoles)
        return filteredRoles
    }

    const fetchUsers = async (): Promise<User[] | undefined | null> => {
        setLoading(true)
        const response = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getUsers()
        setLoading(false)
        if (response.code !== 200)
            return

        setUsers(response.data)

        return response.data
    }

    const updateRows = async (role: string, fetchUser = true) => {
        setRole(role)

        let fetchedUsers
        if (fetchUser)
            fetchedUsers = await fetchUsers() ?? []
        else
            fetchedUsers = users

        setRows(fetchedUsers.filter(u => u.roleName === role))
    }

    useEffect(() => {
        fetchRoles()
            .then((r) => {
                if (r)
                    updateRows(r[0])
            })
    }, [])

    const deleteUser = async (id: string) => {
        try {
            setDeletingUser(id)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteUser(id)
            setDeletingUser(undefined)
            if (res.code !== 200) {
                setResult({
                    severity: 'error',
                    message: t('failedToDelete'),
                })
                return
            }

            setResult({
                severity: 'success',
                message: t('successfullyDeleted'),
            })
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToDelete'),
            })
        }
    }

    const deleteRole = async (roleName: string) => {
        try {
            setDeletingRole(roleName)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteRole(roleName)
            setDeletingRole(undefined)
            if (res.code !== 200) {
                setResult({
                    severity: 'error',
                    message: t('failedToDelete'),
                })
                return
            }

            setResult({
                severity: 'success',
                message: t('successfullyDeleted'),
            })
        } catch (error) {
            console.error(error)

            setResult({
                severity: 'error',
                message: t('failedToDelete'),
            })
        }
    }

    const columns: GridColDef<any>[] = [
        {
            field: 'createdAt',
            type: 'number',
            valueFormatter: (createdAt: number) => fromUnixToFormat(configuration.get.locale, createdAt, DATE),
            width: 200,
        },
        {
            field: 'updatedAt',
            type: 'number',
            valueFormatter: (updatedAt: number) => fromUnixToFormat(configuration.get.locale, updatedAt, DATE),
            width: 200,
        },
    ]

    const updatesUser = auth.accessControl?.can(auth.user.roleName).update(resources.USER).granted ?? false
    const deletesUser = auth.accessControl?.can(auth.user.roleName).delete(resources.USER).granted ?? false

    if (!roles || roles.length === 0)
        return (<LoadingScreen />)

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                <Grid item xs={4} sm={2}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <Typography textAlign='center' variant='h4'>{t('roles')}</Typography>
                        <List dense>
                            {roles.map((r, i) =>
                                <div key={i} onMouseEnter={() => setRoleActionsCollapse(r)} onMouseLeave={() => setRoleActionsCollapse(null)}>
                                    <Box sx={{ mt: 1 }}></Box>

                                    <ListItemButton selected={role === r} onClick={() => { updateRows(r) }}>
                                        <ListItemText primary={t(r)} />
                                    </ListItemButton>

                                    <Collapse in={roleActionsCollapse === r} unmountOnExit timeout={500}>
                                        <List component="div" disablePadding>
                                            {
                                                auth.accessControl?.can(auth.user.roleName).update(resources.PRIVILEGE).granted &&
                                                <ListItemButton sx={{ pl: 4 }}>
                                                    <ListItemIcon onClick={() => setEditingRole(r)}>
                                                        {editingRole ? <CircularProgress size={20} /> : <EditOutlined />}
                                                    </ListItemIcon>
                                                    <ListItemText primary={t("edit")} />
                                                </ListItemButton>
                                            }
                                            {
                                                auth.accessControl?.can(auth.user.roleName).delete(resources.PRIVILEGE).granted &&
                                                <ListItemButton sx={{ pl: 4 }}>
                                                    <ListItemIcon onClick={async () => await deleteRole(r)}>
                                                        {deletingRole ? <CircularProgress size={20} /> : <DeleteOutlined />}
                                                    </ListItemIcon>
                                                    <ListItemText primary={t("delete")} />
                                                </ListItemButton>
                                            }
                                        </List>
                                    </Collapse>
                                </div>
                            )}
                            <Box sx={{ mt: 1 }}></Box>
                            <Divider />
                            <Stack direction='row' justifyContent='center' mt={1} onClick={() => setOpenCreateRoleModal(true)}>
                                <IconButton><AddOutlined /></IconButton>
                            </Stack>
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={8} sm={10}>
                    <Paper sx={{ p: 1, height: '100%' }}>
                        <DataGrid
                            data={rows}
                            overWriteColumns={columns}
                            orderedColumnsFields={['actions']}
                            loading={loading}
                            hiddenColumns={['_id']}
                            additionalColumns={(deletesUser || updatesUser) ? [{
                                field: 'actions',
                                headerName: '',
                                headerAlign: 'center',
                                align: 'center',
                                type: 'actions',
                                getActions: (params) => [
                                    updatesUser
                                        ? <GridActionsCellItem
                                            label={t('editUser')}
                                            icon={editingUser === undefined ? <EditOutlined /> : <CircularProgress size={20} />}
                                            onClick={() => setEditingUser(users.find(u => u._id === params.row.id))}
                                        />
                                        : null,
                                    deletesUser
                                        ? <GridActionsCellItem
                                            label={t('deleteUser')}
                                            icon={deletingUser === undefined ? <DeleteOutlined /> : <CircularProgress size={20} />}
                                            onClick={async () => {
                                                await deleteUser(params.row.id);
                                                await updateRows(role)
                                                if (auth.user._id === params.row.id)
                                                    await auth.logout()
                                            }}
                                        />
                                        : null,
                                ].filter(a => a != null)
                            }] : undefined}
                            customToolbar={[
                                <Button onClick={async () => await fetchUsers()} startIcon={<RefreshOutlined />}>{t('Refresh')}</Button>,
                                <Button onClick={() => setOpenCreateUserModal(true)} startIcon={<AddOutlined />}>{t('Create')}</Button>,
                            ]}
                        />
                    </Paper>
                </Grid>
            </Grid>

            <Modal
                onClose={() => {
                    if (openCreateUserModal) setOpenCreateUserModal(false);
                    else if (Boolean(editingUser))
                        setEditingUser(undefined)
                }}
                open={Boolean(editingUser) || openCreateUserModal}
                closeAfterTransition
                disableEscapeKeyDown
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={Boolean(editingUser) || openCreateUserModal ? 'up' : 'down'} in={Boolean(editingUser) || openCreateUserModal} timeout={250}>
                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                        <ManageUser roles={roles} defaultUser={editingUser} onFinish={async () => {
                            if (openCreateUserModal)
                                setOpenCreateUserModal(false);
                            else if (Boolean(editingUser))
                                setEditingUser(undefined)
                            await updateRows(role)
                        }} />
                    </Paper>
                </Slide>
            </Modal>

            <Modal
                onClose={() => {
                    if (openCreateRoleModal)
                        setOpenCreateRoleModal(false);
                    else if (Boolean(editingRole))
                        setEditingRole(undefined)
                }}
                open={Boolean(editingRole) || openCreateRoleModal}
                closeAfterTransition
                disableEscapeKeyDown
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={Boolean(editingRole) || openCreateRoleModal ? 'up' : 'down'} in={Boolean(editingRole) || openCreateRoleModal} timeout={250}>
                    <Paper sx={{ width: '60%', overflowY: 'auto', maxHeight: '80%', padding: '0.5rem 2rem' }}>
                        <ManageRole defaultRole={editingRole} onFinish={async () => {
                            if (openCreateRoleModal) setOpenCreateRoleModal(false);
                            else if (Boolean(editingRole))
                                setEditingRole(undefined)
                        }} />
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
}
