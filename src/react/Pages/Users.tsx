import { useState, useRef, useEffect, useContext, memo } from "react";
import { t } from "i18next";
import { roles as staticRoles } from "../../Electron/Database/Repositories/Auth/dev-permissions";
import { resources } from "../../Electron/Database/Repositories/Auth/resources";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import { User } from '../../Electron/Database/Models/User';
import { DATE, toFormat } from '../Lib/DateTime/date-time-helpers';
import { ConfigurationContext } from '../Contexts/Configuration/ConfigurationContext';
import { AuthContext } from "../Contexts/AuthContext";
import ManageUser from "../Components/ManageUser";
import { ManageRole } from "../Components/ManageRole";
import { DataGrid } from "../Components/DataGrid";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish } from "../Lib/Events";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../Components/Base/Button";
import { EditIcon, EyeOffIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { CircularLoadingIcon } from "../Components/Base/CircularLoadingIcon";
import { Accordion, AccordionContent, AccordionTrigger } from "../shadcn/components/ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import { Separator } from "../shadcn/components/ui/separator";
import { Modal } from "../Components/Base/Modal";
import { CircularLoadingScreen } from "../Components/Base/CircularLoadingScreen";
import { Stack } from "../Components/Base/Stack";

export const Users = memo(function Users() {
    const configuration = useContext(ConfigurationContext)!
    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    if (!auth!.accessControl?.can(auth!.user?.roleName ?? '').read(resources.USER).granted)
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
        if (response.code !== 200 || !response.data)
            return

        const filteredRoles = response.data.filter(r => r !== staticRoles.ADMIN)
        setRoles(filteredRoles)
        return filteredRoles
    }

    const fetchUsers = async (): Promise<User[] | undefined | null> => {
        setLoading(true)
        const response = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getUsers()
        setLoading(false)
        if (response.code !== 200 || !response.data)
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
            if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.deletedCount !== 1) {
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
            cell: ({ getValue }) => toFormat(Number(getValue() as string), configuration.local, undefined, DATE),
        },
        {
            accessorKey: 'updatedAt',
            id: 'updatedAt',
            cell: ({ getValue }) => toFormat(Number(getValue() as string), configuration.local, undefined, DATE),
        },
    ]

    const createsUser = auth!.accessControl?.can(auth!.user?.roleName ?? '').create(resources.USER).granted ?? false
    const createsRole = auth!.accessControl?.can(auth!.user?.roleName ?? '').create(resources.PRIVILEGE).granted ?? false
    const readsUser = auth!.accessControl?.can(auth!.user?.roleName ?? '').read(resources.USER).granted ?? false
    const readsRole = auth!.accessControl?.can(auth!.user?.roleName ?? '').read(resources.PRIVILEGE).granted ?? false
    const updatesUser = auth!.accessControl?.can(auth!.user?.roleName ?? '').update(resources.USER).granted ?? false
    const updatesRole = auth!.accessControl?.can(auth!.user?.roleName ?? '').update(resources.PRIVILEGE).granted ?? false
    const deletesUser = auth!.accessControl?.can(auth!.user?.roleName ?? '').delete(resources.USER).granted ?? false
    const deletesRole = auth!.accessControl?.can(auth!.user?.roleName ?? '').delete(resources.PRIVILEGE).granted ?? false

    const additionalColumns: ColumnDef<any>[] = (deletesUser || updatesUser) ? [
        {
            id: 'actions',
            accessorKey: 'actions',
            cell: ({ row }) =>
                <Stack stackProps={{ className: "justify-center w-full" }}>
                    {
                        updatesUser &&
                        <Button
                            isIcon
                            variant='text'
                            onClick={() => { setOpenManageUserModal(true); setEditingUser(users.find(u => u._id === row.original._id)) }}
                        >
                            {editingUser === undefined ? <EditIcon /> : <CircularLoadingIcon />}
                        </Button>
                    }
                    {
                        deletesUser &&
                        <Button
                            isIcon
                            variant='text'
                            fgColor='error'
                            onClick={async () => {
                                await deleteUser(row.original._id);
                                await updateRows(role)
                                if (auth!.user?._id === row.original.id)
                                    await auth!.logout()
                            }}
                        >
                            {deletingUser === undefined ? <Trash2Icon /> : <CircularLoadingIcon />}
                        </Button>
                    }
                </Stack>
        }
    ] : []

    const refresh = async () => {
        const r = await fetchRoles()
        await updateRows(r ? r[0] : undefined)
    }

    useEffect(() => {
        if (users.length === 0)
            refresh()
    }, [])

    useEffect(() => {
        // subscribe(PAGE_SLIDER_ANIMATION_END_EVENT_NAME, (e: CustomEvent) => {
        //     if (e?.detail === '/Users')
        setShowGrid(true)
        // })
    }, [])

    return (
        <>
            <div className="grid grid-cols-12 p-2 h-full">
                {/* Roles */}
                {
                    readsRole &&
                    <div className="max-sm:col-span-full sm:col-span-full md:col-span-2" onMouseLeave={() => setRoleActionsCollapse([])}>
                        <Stack direction='vertical' stackProps={{ className: 'border rounded-md' }}>
                            <h4 className="text-center pt-2 pb-4">{t('Users.roles')}</h4>
                            <Separator />
                            <Stack direction='vertical'>
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
                                        <Button variant="outline" disabled={role === r} fgColor={role === r ? 'primary' : 'surface-foreground'} onClick={async () => { await updateRows(r, false) }}>
                                            <p>
                                                {t(`Roles.${r}`)}
                                            </p>
                                        </Button>

                                        <Accordion type="multiple">
                                            <AccordionItem value='roleActionCollapse'>
                                                <AccordionTrigger></AccordionTrigger>
                                                <AccordionContent>
                                                    <Stack direction="vertical">
                                                        <Button variant='outline' onClick={() => { setOpenManageRoleModal(true); setReadingRole(r) }} className="pl-4">
                                                            <EyeOffIcon />
                                                            <p>{t("Users.show")}</p>
                                                        </Button>
                                                        {/* Not recommended for small projects(needs transaction support.) */}
                                                        {/* {
                                                    updatesRole &&
                                                    <Button onClick={() => { setOpenManageRoleModal(true); setEditingRole(r) }} className="pl-4">
                                                        <ListItemIcon>
                                                            {editingRole ? <CircularLoading /> : <EditOutlined />}
                                                        </ListItemIcon>
                                                        <ListItemText primary={t("Users.edit")} />
                                                    </Button>
                                                } */}
                                                        {
                                                            deletesRole &&
                                                            <Button fgColor='error' variant='outline' onClick={async () => { await deleteRole(r); await refresh() }} className="pl-4">
                                                                {deletingRole ? <CircularLoadingIcon /> : <Trash2Icon />}
                                                                <p>{t("Users.delete")}</p>
                                                            </Button>
                                                        }
                                                    </Stack>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                )}
                                {
                                    createsRole &&
                                    <>
                                        <Separator />
                                        <div className="flex flex-row justify-center" onClick={() => setOpenManageRoleModal(true)}>
                                            <Button isIcon bgColor="success" fgColor="surface-dim" size="sm"><PlusIcon /></Button>
                                        </div>
                                    </>
                                }
                            </Stack>
                        </Stack>
                    </div>
                }
                {/* Users */}
                {
                    readsUser &&
                    <div className={`${readsRole ? 'max-sm:col-span-full sm:col-span-full md:col-span-10' : 'col-span-full'}`}>
                        {!showGrid
                            ? <CircularLoadingScreen />
                            : <DataGrid
                                configName='users'
                                data={rows}
                                overWriteColumns={columns}
                                loading={loading}
                                defaultColumnOrderModel={['actions']}
                                additionalColumns={additionalColumns}
                                appendHeaderNodes={[
                                    <Button variant='outline' onClick={async () => await fetchUsers()}><RefreshCwIcon />{t('Users.Refresh')}</Button>,
                                    createsUser && <Button variant='outline' onClick={() => setOpenManageUserModal(true)}><PlusIcon />{t('Users.Create')}</Button>,
                                ]}
                            />
                        }
                    </div>
                }
            </div>

            <Modal
                onClose={() => { setOpenManageUserModal(false); setEditingUser(undefined) }}
                open={openManageUserModal}
            >
                <div className="w-[60%] px-2 py-8">
                    <ManageUser roles={roles ?? []} defaultUser={editingUser} onFinish={async () => {
                        setOpenManageUserModal(false)
                        setEditingUser(undefined)
                        await updateRows(role)
                    }} />
                </div>
            </Modal>

            <Modal
                onClose={() => { setOpenManageRoleModal(false); setEditingRole(undefined) }}
                open={openManageRoleModal}
            >
                <ManageRole defaultRole={editingRole ?? readingRole} onFinish={async () => {
                    setOpenManageRoleModal(false)
                    setEditingRole(undefined)
                    setReadingRole(undefined)
                    await refresh()
                }} />
            </Modal>
        </>
    )
})
