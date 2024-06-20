import { useState, useEffect, useContext } from 'react'
import { User } from "../../Electron/Database/Models/User";
import { FormControl, InputLabel, Select, MenuItem, Stack, Grid, TextField, Button, Typography } from '@mui/material';
import { t } from 'i18next';
import { RendererDbAPI } from '../../Electron/Database/handleDbRendererEvents';
import { ResultContext } from '../ResultContext';

export default function ManageUser({ roles, defaultUser, onClose }: { roles: string[], defaultUser?: User, onClose?: () => Promise<void> | void }) {
    const setResult = useContext(ResultContext).setResult

    const [user, setUser] = useState<User | undefined>(undefined)

    useEffect(() => {
        if (!user && defaultUser)
            setUser(defaultUser)
    }, [])

    return (
        <>
            <Stack justifyContent={'space-around'} sx={{ height: '100%', width: '100%' }}>
                <Typography textAlign='center' variant='h6'>{defaultUser ? t('updateUser') : t('createUser')}</Typography>
                <Grid container spacing={2} >
                    <Grid item>
                        {/* Role Name */}
                        <FormControl variant='standard' >
                            <InputLabel id="role-name-label">{t('roleName')}</InputLabel>
                            <Select onChange={(e) => setUser({ ...user, roleName: e.target.value })} labelId="role-name-label" value={user.roleName ?? ''} sx={{ width: '7rem' }} >
                                {roles.map(r =>
                                    <MenuItem value={r}>{r}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        {/* Username */}
                        <TextField variant='standard' type='text' onChange={(e) => setUser({ ...user, username: e.target.value })} value={user.username ?? ''} label={t('username')} sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item>
                        {/* Password */}
                        <TextField variant='standard' type='password' onChange={(e) => setUser({ ...user, password: e.target.value })} value={user.password ?? ''} label={t('password')} sx={{ width: '7rem' }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button fullWidth disabled={!user.roleName || !user.username || !user.password} onClick={async () => {
                            if (defaultUser) {
                                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updateUser(user)
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
                            }
                            else {
                                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createUser(user)
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

                            if (onClose)
                                onClose()
                        }}>
                            {t('done')}
                        </Button>
                    </Grid>
                </Grid>
            </Stack>
        </>
    )
}
