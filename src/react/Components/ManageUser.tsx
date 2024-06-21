import { useState, useEffect, useContext } from 'react'
import { User } from "../../Electron/Database/Models/User";
import { FormControl, InputLabel, Select, MenuItem, Stack, Grid, TextField, Button, Typography, Divider } from '@mui/material';
import { t } from 'i18next';
import { RendererDbAPI } from '../../Electron/Database/handleDbRendererEvents';
import { ResultContext } from '../ResultContext';
import { CheckOutlined } from '@mui/icons-material';
import { AuthContext } from '../Lib/AuthContext';

export default function ManageUser({ roles, defaultUser, onFinish }: { roles: string[], defaultUser?: User, onFinish?: () => Promise<void> | void }) {
    const auth = useContext(AuthContext)
    const setResult = useContext(ResultContext).setResult

    const [user, setUser] = useState<User | undefined>(undefined)

    useEffect(() => {
        if (!user && defaultUser)
            setUser(defaultUser)
    }, [])

    return (
        <>
            <Stack justifyContent={'space-around'} sx={{ height: '100%', width: '100%' }} direction='column'>
                <Typography textAlign='center' variant='h6'>{defaultUser ? t('updateUser') : t('createUser')}</Typography>
                <Divider sx={{ mt: 1, mb: 2 }} />
                {/* Role Name */}
                <FormControl variant='standard' >
                    <InputLabel id="role-name-label">{t('roleName')}</InputLabel>
                    <Select onChange={(e) => setUser({ ...user, roleName: e.target.value })} labelId="role-name-label" value={user?.roleName ?? ''} fullWidth >
                        {roles.map((r, i) =>
                            <MenuItem key={i} value={r}>{r}</MenuItem>
                        )}
                    </Select>
                </FormControl>
                {/* Username */}
                <TextField variant='standard' type='text' onChange={(e) => setUser({ ...user, username: e.target.value })} value={user?.username ?? ''} label={t('username')} fullWidth />
                {/* Password */}
                <TextField variant='standard' type='password' onChange={(e) => setUser({ ...user, password: e.target.value })} value={user?.password ?? ''} label={t('updatePassword')} fullWidth />
                <Divider sx={{ mt: 2, mb: 2 }} />
                <Button fullWidth disabled={!user?.roleName || !user?.username} startIcon={<CheckOutlined />} onClick={async () => {
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
