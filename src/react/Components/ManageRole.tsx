import { useState, useEffect } from "react";
import { Typography, Accordion, AccordionSummary, AccordionDetails, Divider, TextField, Button, List, ListItem, ListItemText, Collapse, Checkbox } from "@mui/material";
import { ExpandMoreOutlined } from "@mui/icons-material";
import { resources as staticResources } from "../../Electron/Database/Repositories/Auth/resources";
import { t } from "i18next";
import { Privilege } from "../../Electron/Database/Models/Privilege";
import { RendererDbAPI } from "../../Electron/Database/handleDbRendererEvents";
import LoadingScreen from "./LoadingScreen";
import { getAttributes } from "../../Electron/Database/Repositories/Auth/resources";

export default function ManageRole({ defaultRole, onFinish }: { defaultRole?: string, onFinish?: () => Promise<void> | void }) {
    const [fetchRoleFailed, setFetchRoleFailed] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [resources, setResources] = useState<{ name: string, index: number, create?: boolean, read?: string[] | undefined, update?: string[] | undefined, delete?: boolean }[] | undefined>(undefined)
    const [role, setRole] = useState<{ name: string, privileges: Privilege[] } | undefined>(undefined)

    const fetchRole = async () => {
        setFetchRoleFailed(false)
        if (!role && defaultRole) {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPrivileges(defaultRole)
            if (res.code !== 200) {
                setFetchRoleFailed(true)
                return
            }
            setFetchRoleFailed(false)

            setRole({
                name: defaultRole,
                privileges: res.data
            })
            setLoading(false)
        }
        else {
            setRole({
                name: '',
                privileges: []
            })

            setLoading(false)
        }
    }

    useEffect(() => {
        setResources(Object.entries(staticResources).map(r => ({ name: r[1], index: 0 })))
        fetchRole()
    }, [])

    if (loading)
        return (
            <LoadingScreen>
                {
                    fetchRoleFailed &&
                    <Button onClick={async () => await fetchRole()}>
                        {t('tryAgain')}
                    </Button>
                }
            </LoadingScreen>
        )

    return (
        <>
            <Typography variant='h5' textAlign='center'>{defaultRole ? t('ManageRole') : t('createRole')}</Typography>
            {defaultRole && <Typography variant='h6' textAlign='center'>{defaultRole}</Typography>}
            <Divider sx={{ mt: 1, mb: 2 }} />
            {/* Role name */}
            <TextField fullWidth variant='standard' value={role?.name ?? ''} label={t('roleName')} onChange={(e) => setRole({ ...role, name: e.target.value })} />
            {resources.map((r, i) =>
                <Accordion key={i}>
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        {r.name}
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem>
                                <ListItemText primary={t('create')} />
                                <Checkbox
                                    edge="end"
                                    onChange={() => {
                                        resources[i].create = !(r.create ?? false)
                                        setResources([...resources])
                                    }}
                                    checked={r.create ?? false}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={t('read')} />
                                <Checkbox
                                    edge='end'
                                    checked={r?.read !== undefined}
                                    onChange={() => {
                                        if (r.read !== undefined)
                                            resources[i].read = undefined
                                        else
                                            resources[i].read = []
                                        setResources([...resources])
                                        console.log(resources)
                                        console.log(r?.read !== undefined)
                                    }}
                                />
                            </ListItem>
                            <Collapse in={r?.read !== undefined} timeout="auto" unmountOnExit >
                                <List component="div" disablePadding>
                                    {
                                        getAttributes(r.name, 'read').map((a, ai) =>
                                            <ListItem key={ai} sx={{ pl: 5, pr: 5 }}>
                                                <ListItemText primary={a} />
                                                <Checkbox
                                                    edge="end"
                                                    disabled={a === '_id'}
                                                    onChange={() => {
                                                        if (r.read?.includes(a))
                                                            resources[i].read = resources[i].read?.filter(elm => elm !== a) ?? undefined
                                                        else
                                                            resources[i].read.push(a)
                                                        setResources([...resources])
                                                    }}
                                                    checked={r.read?.includes(a) ?? false}
                                                />
                                            </ListItem>
                                        )
                                    }
                                </List>
                            </Collapse>
                            <ListItem>
                                <ListItemText primary={t('update')} />
                                <Checkbox
                                    edge="end"
                                    onChange={() => {
                                        if (r.update !== undefined)
                                            resources[i].update = undefined
                                        else
                                            resources[i].update = []
                                        setResources([...resources])
                                        console.log(resources)
                                        console.log(r?.update !== undefined)
                                    }}
                                    checked={r?.update !== undefined}
                                />
                            </ListItem>
                            <Collapse in={r?.update !== undefined} timeout="auto" unmountOnExit >
                                <List component="div" disablePadding>
                                    {
                                        getAttributes(r.name, 'update').map((a, ai) =>
                                            <ListItem key={ai} sx={{ pl: 5, pr: 5 }}>
                                                <ListItemText primary={a} />
                                                <Checkbox
                                                    edge="end"
                                                    onChange={() => {
                                                        if (r.update?.includes(a))
                                                            resources[i].update = resources[i].update?.filter(elm => elm !== a) ?? undefined
                                                        else
                                                            resources[i].update.push(a)
                                                        setResources([...resources])
                                                    }}
                                                    checked={r.update?.includes(a) ?? false}
                                                />
                                            </ListItem>
                                        )
                                    }
                                </List>
                            </Collapse>
                            <ListItem>
                                <ListItemText primary={t('delete')} />
                                <Checkbox
                                    edge="end"
                                    onChange={() => {
                                        resources[i].delete = !(r.delete ?? false)
                                        setResources([...resources])
                                    }}
                                    checked={r.delete ?? false}
                                />
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion >
            )
            }
        </>
    )
}

