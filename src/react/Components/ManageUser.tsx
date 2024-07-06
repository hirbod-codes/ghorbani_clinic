import { useState, useEffect, useContext } from 'react'
import { User } from "../../Electron/Database/Models/User";
import { FormControl, InputLabel, Select, MenuItem, Stack, Grid, TextField, Button, Typography, Divider } from '@mui/material';
import { t } from 'i18next';
import { RendererDbAPI } from '../../Electron/Database/handleDbRendererEvents';
import { ResultContext } from '../Contexts/ResultContext';
import { CheckOutlined } from '@mui/icons-material';
import { AuthContext } from '../Contexts/AuthContext';
import { resources } from '../../Electron/Database/Repositories/Auth/resources';

export default function ManageUser({ roles, defaultUser, onFinish }: { roles: string[], defaultUser?: User, onFinish?: () => Promise<void> | void }) {
    const auth = useContext(AuthContext)
    const setResult = useContext(ResultContext).setResult

    const [user, setUser] = useState<User | undefined>(undefined)

    useEffect(() => {
        if (!user && defaultUser)
            setUser(defaultUser)
    }, [])

    const userReadPermission = auth.accessControl?.can(auth.user.roleName).read(resources.USER)
    const userUpdatePermission = auth.accessControl?.can(auth.user.roleName).update(resources.USER)

    const readsUser = userReadPermission.granted
    const readsUserRoleName = readsUser && (userReadPermission.attributes.includes('*') || userReadPermission.attributes.includes('roleName')) && !userReadPermission.attributes.includes('!roleName')
    const readsUserUsername = readsUser && (userReadPermission.attributes.includes('*') || userReadPermission.attributes.includes('username')) && !userReadPermission.attributes.includes('!username')
    const readsUserPassword = readsUser && (userReadPermission.attributes.includes('*') || userReadPermission.attributes.includes('password')) && !userReadPermission.attributes.includes('!password')

    const updatesUser = userUpdatePermission.granted
    const updatesUserRoleName = updatesUser && (userUpdatePermission.attributes.includes('*') || userUpdatePermission.attributes.includes('roleName')) && !userUpdatePermission.attributes.includes('!roleName')
    const updatesUserUsername = updatesUser && (userUpdatePermission.attributes.includes('*') || userUpdatePermission.attributes.includes('username')) && !userUpdatePermission.attributes.includes('!username')
    const updatesUserPassword = updatesUser && (userUpdatePermission.attributes.includes('*') || userUpdatePermission.attributes.includes('password')) && !userUpdatePermission.attributes.includes('!password')

    return (
        <>
            <Stack justifyContent={'space-around'} sx={{ height: '100%', width: '100%' }} direction='column'>
                <Typography textAlign='center' variant='h6'>{defaultUser ? t('updateUser') : t('createUser')}</Typography>
                <Divider sx={{ mt: 1, mb: 2 }} />
                {/* Role Name */}
                {
                    readsUserRoleName &&
                    <FormControl variant='standard' >
                        <InputLabel id="role-name-label">{t('roleName')}</InputLabel>
                        <Select disabled={!updatesUserRoleName} onChange={(e) => setUser({ ...user, roleName: e.target.value })} labelId="role-name-label" value={user?.roleName ?? ''} error={(user?.roleName ?? '') === ''} fullWidth >
                            {roles.map((r, i) =>
                                <MenuItem key={i} value={r}>{r}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                }
                {/* Username */}
                {
                    readsUserUsername &&
                    <TextField variant='standard' type='text' disabled={!updatesUserUsername} onChange={(e) => setUser({ ...user, username: e.target.value })} value={user?.username ?? ''} label={t('username')} error={(user?.username ?? '') === ''} fullWidth />
                }
                {/* Password */}
                {
                    readsUserPassword &&
                    <TextField variant='standard' type='password' disabled={!updatesUserPassword} onChange={(e) => setUser({ ...user, password: e.target.value })} value={user?.password ?? ''} label={t('password')} fullWidth />
                }
                <Divider sx={{ mt: 2, mb: 2 }} />
                <Button fullWidth startIcon={<CheckOutlined />} onClick={async () => {
                    if ((updatesUserRoleName && !user?.roleName) || (updatesUserUsername && !user?.username))
                        return

                    if (defaultUser) {
                        console.log(Object.fromEntries(Object.entries(user).filter(arr => arr[1] !== '')))
                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updateUser(Object.fromEntries(Object.entries(user).filter(arr => arr[1] !== '')))
                        console.log('updateUser', 'res', res)
                        if (res.code !== 200 || !res.data.acknowledged || res.data.matchedCount !== 1 || res.data.modifiedCount !== 1) {
                            setResult({
                                severity: 'error',
                                message: t('failedToUpdateUser'),
                            })
                            return
                        }

                        setResult({
                            severity: 'success',
                            message: t('successfullyUpdatedUser'),
                        })

                        if (auth.user._id === user._id)
                            await auth.fetchUser()
                    }
                    else {
                        const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createUser(user)
                        console.log('createUser', 'res', res)
                        if (res.code !== 200 || !res.data.acknowledged) {
                            setResult({
                                severity: 'error',
                                message: t('failedToRegisterUser'),
                            })
                            return
                        }

                        setResult({
                            severity: 'success',
                            message: t('successfullyRegisteredUser'),
                        })
                    }

                    if (onFinish)
                        onFinish()
                }}>
                    {t('done')}
                </Button>
            </Stack>
        </>
    )
}
