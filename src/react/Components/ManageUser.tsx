import { useState, useEffect, useContext } from 'react'
import { User } from "../../Electron/Database/Models/User";
import { t } from 'i18next';
import { RendererDbAPI } from '../../Electron/Database/renderer';
import { AuthContext } from '../Contexts/AuthContext';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';
import { RESULT_EVENT_NAME } from '../Contexts/ResultWrapper';
import { publish } from '../Lib/Events';
import { Separator } from '../shadcn/components/ui/separator';
import { Select } from './Base/Select';
import { Input } from './Base/Input';
import { Button } from '../Components/Base/Button';
import { CheckIcon } from 'lucide-react';

export default function ManageUser({ roles, defaultUser, onFinish }: { roles: string[], defaultUser?: User, onFinish?: () => Promise<void> | void }) {
    const auth = useContext(AuthContext)!

    const [user, setUser] = useState<User | undefined>(undefined)

    useEffect(() => {
        if (!user && defaultUser)
            setUser(defaultUser)
    }, [])

    const userReadPermission = auth?.accessControl?.can(auth?.user?.roleName ?? '').read(resources.USER)
    const userUpdatePermission = auth?.accessControl?.can(auth?.user?.roleName ?? '').update(resources.USER)

    const readsUser = userReadPermission?.granted ?? false
    const readsUserRoleName = readsUser && (userReadPermission?.attributes.includes('*') || userReadPermission?.attributes.includes('roleName')) && !userReadPermission?.attributes.includes('!roleName')
    const readsUserUsername = readsUser && (userReadPermission?.attributes.includes('*') || userReadPermission?.attributes.includes('username')) && !userReadPermission?.attributes.includes('!username')
    const readsUserPassword = readsUser && (userReadPermission?.attributes.includes('*') || userReadPermission?.attributes.includes('password')) && !userReadPermission.attributes.includes('!password')

    const updatesUser = userUpdatePermission?.granted ?? false
    const updatesUserRoleName = updatesUser && (userUpdatePermission?.attributes.includes('*') || userUpdatePermission?.attributes.includes('roleName')) && !userUpdatePermission?.attributes.includes('!roleName')
    const updatesUserUsername = updatesUser && (userUpdatePermission?.attributes.includes('*') || userUpdatePermission?.attributes.includes('username')) && !userUpdatePermission?.attributes.includes('!username')
    const updatesUserPassword = updatesUser && (userUpdatePermission?.attributes.includes('*') || userUpdatePermission?.attributes.includes('password')) && !userUpdatePermission?.attributes.includes('!password')

    return (
        <>
            <div className='flex flex-col justify-around size-full'>
                <h6 className='text-center'>{defaultUser ? t('ManageUser.updateUser') : t('ManageUser.createUser')}</h6>
                <Separator className='my-1' />
                {/* Role Name */}
                {
                    readsUserRoleName &&
                    <Select
                        selectOptions={{ type: 'items', items: roles.map((r, i) => ({ value: r, displayValue: r })) }}
                        triggerProps={{ disabled: !updatesUserRoleName }}
                        onValueChange={(v) => setUser({ ...user!, roleName: v })}
                        value={user?.roleName ?? ''}
                    // error={(user?.roleName ?? '') === ''}
                    />
                }
                {/* Username */}
                {
                    readsUserUsername &&
                    <Input
                        disabled={!updatesUserUsername}
                        onChange={(e) => setUser({ ...user!, username: e.target.value })}
                        value={user?.username ?? ''}
                        label={t('ManageUser.username')}
                        labelId={t('ManageUser.username')}
                    // error={(user?.username ?? '') === ''}
                    />
                }
                {/* Password */}
                {
                    readsUserPassword &&
                    <Input type='password'
                        disabled={!updatesUserPassword}
                        onChange={(e) => setUser({ ...user!, password: e.target.value })}
                        value={user?.password ?? ''}
                        label={t('ManageUser.password')}
                        labelId={t('ManageUser.password')}
                    />
                }

                <Separator />

                <Button onClick={async () => {
                    if ((updatesUserRoleName && !user?.roleName) || (updatesUserUsername && !user?.username))
                        return

                    if (defaultUser) {
                        console.log(Object.fromEntries(Object.entries(user!).filter(arr => arr[1] !== '')))
                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updateUser(Object.fromEntries(Object.entries(user!).filter(arr => arr[1] !== '')) as User)
                        console.log('updateUser', 'res', res)
                        if (res.code !== 200 || !res.data || !res.data.acknowledged || res.data.matchedCount !== 1 || res.data.modifiedCount !== 1) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('ManageUser.failedToUpdateUser'),
                            })
                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('ManageUser.successfullyUpdatedUser'),
                        })

                        if (auth!.user!._id === user!._id)
                            await auth.fetchUser()
                    }
                    else {
                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createUser(user!)
                        console.log('createUser', 'res', res)
                        if (res.code !== 200 || !res.data || !res.data.acknowledged) {
                            publish(RESULT_EVENT_NAME, {
                                severity: 'error',
                                message: t('ManageUser.failedToRegisterUser'),
                            })
                            return
                        }

                        publish(RESULT_EVENT_NAME, {
                            severity: 'success',
                            message: t('ManageUser.successfullyRegisteredUser'),
                        })
                    }

                    if (onFinish)
                        onFinish()
                }}>
                    <CheckIcon />{t('ManageUser.done')}
                </Button>
            </div>
        </>
    )
}
