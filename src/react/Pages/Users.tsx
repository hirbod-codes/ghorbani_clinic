import { useState, useRef, useEffect, useContext, memo } from "react";
import { AddOutlined, DeleteOutlined, EditOutlined, RefreshOutlined, RemoveRedEyeOutlined } from '@mui/icons-material';
import { Modal, Slide, Grid, List, ListItemButton, ListItemText, ListItemIcon, Paper, Typography, Button, Divider, Box, Stack, IconButton, Collapse, CircularProgress } from "@mui/material";
import { t } from "i18next";
import { roles as staticRoles } from "../../Electron/Database/Repositories/Auth/dev-permissions";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import { User } from '../../Electron/Database/Models/User';
import { DATE, fromUnixToFormat } from '../Lib/DateTime/date-time-helpers';
import { ConfigurationContext } from '../Contexts/ConfigurationContext';
import { AuthContext } from "../Contexts/AuthContext";
import ManageUser from "../Components/ManageUser";
import { ManageRole } from "../Components/ManageRole";
import { DataGrid } from "../Components/DataGrid";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish, subscribe } from "../Lib/Events";
import { PAGE_SLIDER_ANIMATION_END_EVENT_NAME } from "./AnimatedLayout";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../Components/LoadingScreen";
import { ColumnDef } from "@tanstack/react-table";

export const Users = memo(function Users() {
    const configuration = useContext(ConfigurationContext)
    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    if (!auth.accessControl?.can(auth.user.roleName).read(resources.USER).granted)
        navigate('/')

    const [roles, setRoles] = useState<string[] | undefined>(undefined)
    const [role, setRole] = useState<string | undefined>(undefined)
    const [roleActionsCollapse, setRoleActionsCollapse] = useState<string[]>([])
    const timeout = useRef<{ [k: string]: NodeJS.Timeout | undefined }>({})
    const [openManageRoleModal, setOpenManageRoleModal] = useState<boolean>(false)
    const [editingRole, setEditingRole] = useState<string | undefined>(undefined)
    const [readingRole, setReadingRole] = useState<string | undefined>(undefined)
    const [deletingRole, setDeletingRole] = useState<string | undefined>(undefined)

    const [openManageUserModal, setOpenManageUserModal] = useState<boolean>(false)
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
    const [deletingUser, setDeletingUser] = useState<string | undefined>(undefined)
    const [users, setUsers] = useState<User[]>([])

    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [showGrid, setShowGrid] = useState(false)

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

    const updateRows = async (role?: string, fetchUser = true) => {
        setRole(role)

        let fetchedUsers
        if (fetchUser)
            fetchedUsers = await fetchUsers() ?? []
        else
            fetchedUsers = users

        if (role)
            setRows(fetchedUsers.filter(u => u.roleName === role))
        else
            setRows(fetchedUsers)
    }

    const deleteUser = async (id: string) => {
        try {
            setDeletingUser(id)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteUser(id)
            setDeletingUser(undefined)
            if (res.code !== 200 || !res.data.acknowledged || res.data.deletedCount !== 1) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Users.failedToDelete'),
                })
                return
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('Users.successfullyDeleted'),
            })
        } catch (error) {
            console.error(error)

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('Users.failedToDelete'),
            })
        }
    }

    const deleteRole = async (roleName: string) => {
        try {
            setDeletingRole(roleName)
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.deleteRole(roleName)
            setDeletingRole(undefined)
            if (res.code !== 200) {
                publish(RESULT_EVENT_NAME, {
                    severity: 'error',
                    message: t('Users.failedToDelete'),
                })
                return
            }

            publish(RESULT_EVENT_NAME, {
                severity: 'success',
                message: t('Users.successfullyDeleted'),
            })
        } catch (error) {
            console.error(error)

            publish(RESULT_EVENT_NAME, {
                severity: 'error',
                message: t('Users.failedToDelete'),
            })
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'roleName',
            id: 'roleName',
        },
        {
            accessorKey: 'createdAt',
            id: 'createdAt',
            cell: ({ getValue }) => fromUnixToFormat(configuration.get.locale, Number(getValue() as string), DATE),
        },
        {
            accessorKey: 'updatedAt',
            id: 'updatedAt',
            cell: ({ getValue }) => fromUnixToFormat(configuration.get.locale, Number(getValue() as string), DATE),
        },
    ]

    const createsUser = auth.accessControl?.can(auth.user.roleName).create(resources.USER).granted ?? false
    const createsRole = auth.accessControl?.can(auth.user.roleName).create(resources.PRIVILEGE).granted ?? false
    const readsUser = auth.accessControl?.can(auth.user.roleName).read(resources.USER).granted ?? false
    const readsRole = auth.accessControl?.can(auth.user.roleName).read(resources.PRIVILEGE).granted ?? false
    const updatesUser = auth.accessControl?.can(auth.user.roleName).update(resources.USER).granted ?? false
    const updatesRole = auth.accessControl?.can(auth.user.roleName).update(resources.PRIVILEGE).granted ?? false
    const deletesUser = auth.accessControl?.can(auth.user.roleName).delete(resources.USER).granted ?? false
    const deletesRole = auth.accessControl?.can(auth.user.roleName).delete(resources.PRIVILEGE).granted ?? false

    const overWriteColumns: ColumnDef<any>[] = [
        {
            accessorKey: '_id',
            id: '_id',
        }
    ]

    const additionalColumns: ColumnDef<any>[] = (deletesUser || updatesUser) && [
        {
            id: 'actions',
            accessorKey: 'actions',
            cell: ({ row }) =>
                <Stack direction='row' alignItems='center'>
                    {
                        updatesUser &&
                        <IconButton
                            onClick={() => { setOpenManageUserModal(true); setEditingUser(users.find(u => u._id === row.original._id)) }}
                        >
                            {editingUser === undefined ? <EditOutlined /> : <CircularProgress size={20} />}
                        </IconButton>
                    }
                    {
                        deletesUser &&
                        <IconButton
                            onClick={async () => {
                                await deleteUser(row.original._id);
                                await updateRows(role)
                                if (auth.user._id === row.original.id)
                                    await auth.logout()
                            }}
                        >
                            {deletingUser === undefined ? <DeleteOutlined /> : <CircularProgress size={20} />}
                        </IconButton>
                    }
                </Stack>
        }
    ]

    const refresh = async () => {
        const r = await fetchRoles()
        await updateRows(r ? r[0] : undefined)
    }

    useEffect(() => {
        if (users.length === 0)
            refresh()
    }, [])

    useEffect(() => {
        subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
            if (e?.detail === '/Users')
                setShowGrid(true)
        })
    }, [])

    return (
        <>
            <Grid container spacing={1} sx={{ p: 2 }} height={'100%'}>
                {/* Roles */}
                {
                    readsRole &&
                    <Grid item xs={4} sm={2} onMouseLeave={() => setRoleActionsCollapse([])}>
                        <Paper sx={{ p: 1, height: '100%' }}>
                            <Typography textAlign='center' variant='h4'>{t('Users.roles')}</Typography>
                            <List dense>
                                {roles?.map((r, i) =>
                                    <div
                                        key={i}
                                        onDoubleClick={() => setRoleActionsCollapse([...roleActionsCollapse, r])}
                                        onMouseEnter={() => {
                                            timeout.current.r = setTimeout(() => {
                                                setRoleActionsCollapse([...roleActionsCollapse, r]);
                                            }, 500);
                                        }}
                                        onMouseLeave={() => { if (timeout.current.r) clearTimeout(timeout.current.r) }}
                                    >
                                        <Box sx={{ mt: 1 }}></Box>

                                        <ListItemButton selected={role === r} onClick={async () => { await updateRows(r, false) }}>
                                            <ListItemText primary={t(`Roles.${r}`)} />
                                        </ListItemButton>

                                        <Collapse in={roleActionsCollapse.includes(r)} unmountOnExit timeout={500}>
                                            <List component="div" disablePadding>
                                                <ListItemButton onClick={() => { setOpenManageRoleModal(true); setReadingRole(r) }} sx={{ pl: 4 }}>
                                                    <ListItemIcon>
                                                        <RemoveRedEyeOutlined />
                                                    </ListItemIcon>
                                                    <ListItemText primary={t("Users.show")} />
                                                </ListItemButton>
                                                {/* Not recommended for small projects(needs transaction support.) */}
                                                {/* {
                                                    updatesRole &&
                                                    <ListItemButton onClick={() => { setOpenManageRoleModal(true); setEditingRole(r) }} sx={{ pl: 4 }}>
                                                        <ListItemIcon>
                                                            {editingRole ? <CircularProgress size={20} /> : <EditOutlined />}
                                                        </ListItemIcon>
                                                        <ListItemText primary={t("Users.edit")} />
                                                    </ListItemButton>
                                                } */}
                                                {
                                                    deletesRole &&
                                                    <ListItemButton onClick={async () => { await deleteRole(r); await refresh() }} sx={{ pl: 4 }}>
                                                        <ListItemIcon>
                                                            {deletingRole ? <CircularProgress size={20} /> : <DeleteOutlined />}
                                                        </ListItemIcon>
                                                        <ListItemText primary={t("Users.delete")} />
                                                    </ListItemButton>
                                                }
                                            </List>
                                        </Collapse>
                                    </div>
                                )}
                                {
                                    createsRole &&
                                    <>
                                        <Box sx={{ mt: 1 }}></Box>
                                        <Divider />
                                        <Stack direction='row' justifyContent='center' mt={1} onClick={() => setOpenManageRoleModal(true)}>
                                            <IconButton><AddOutlined /></IconButton>
                                        </Stack>
                                    </>
                                }
                            </List>
                        </Paper>
                    </Grid>
                }
                {/* Users */}
                {
                    readsUser &&
                    <Grid item xs={readsRole ? 8 : 12} sm={readsRole ? 10 : 12}>
                        <Paper sx={{ p: 1, height: '100%' }} elevation={3}>
                            {!showGrid
                                ? <LoadingScreen />
                                : <DataGrid
                                    configName='users'
                                    data={rows}
                                    overWriteColumns={columns}
                                    loading={loading}
                                    defaultColumnOrderModel={['actions']}
                                    additionalColumns={additionalColumns}
                                    appendHeaderNodes={[
                                        <Button onClick={async () => await fetchUsers()} startIcon={<RefreshOutlined />}>{t('Users.Refresh')}</Button>,
                                        createsUser && <Button onClick={() => setOpenManageUserModal(true)} startIcon={<AddOutlined />}>{t('Users.Create')}</Button>,
                                    ]}
                                />
                            }
                        </Paper>
                    </Grid>
                }
            </Grid>

            <Modal
                onClose={() => { setOpenManageUserModal(false); setEditingUser(undefined) }}
                open={openManageUserModal}
                closeAfterTransition
                disableEscapeKeyDown
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={openManageUserModal ? 'up' : 'down'} in={openManageUserModal} timeout={250}>
                    <Paper sx={{ width: '60%', padding: '0.5rem 2rem' }}>
                        <ManageUser roles={roles ?? []} defaultUser={editingUser} onFinish={async () => {
                            setOpenManageUserModal(false)
                            setEditingUser(undefined)
                            await updateRows(role)
                        }} />
                    </Paper>
                </Slide>
            </Modal>

            <Modal
                onClose={() => { setOpenManageRoleModal(false); setEditingRole(undefined) }}
                open={openManageRoleModal}
                closeAfterTransition
                disableEscapeKeyDown
                disableAutoFocus
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '2rem' }}
                slotProps={{ backdrop: { sx: { top: '2rem' } } }}
            >
                <Slide direction={openManageRoleModal ? 'up' : 'down'} in={openManageRoleModal} timeout={250}>
                    <Paper sx={{ width: '60%', overflowY: 'auto', height: '80%', padding: '0.5rem 2rem' }}>
                        <ManageRole defaultRole={editingRole ?? readingRole} onFinish={async () => {
                            setOpenManageRoleModal(false)
                            setEditingRole(undefined)
                            setReadingRole(undefined)
                            await refresh()
                        }} />
                    </Paper>
                </Slide>
            </Modal>
        </>
    )
})
