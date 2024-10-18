import { useState, useEffect } from "react";
import { Typography, Accordion, AccordionSummary, AccordionDetails, Divider, TextField, Button, List, ListItem, ListItemText, Collapse, Checkbox, CircularProgress } from "@mui/material";
import { ExpandMoreOutlined } from "@mui/icons-material";
import { resources as staticResources } from "../../Electron/Database/Repositories/Auth/resources";
import { t } from "i18next";
import { Privilege } from "../../Electron/Database/Models/Privilege";
import { RendererDbAPI } from "../../Electron/Database/renderer";
import LoadingScreen from "./LoadingScreen";
import { getAttributes } from "../../Electron/Database/Repositories/Auth/resources";
import { RESULT_EVENT_NAME } from "../Contexts/ResultWrapper";
import { publish } from "../Lib/Events";

type Resource = { name: string, index: number, create?: boolean, read?: string[] | undefined, update?: string[] | undefined, delete?: boolean }

export function ManageRole({ defaultRole, onFinish }: { defaultRole?: string, onFinish?: () => Promise<void> | void }) {
    const [fetchRoleFailed, setFetchRoleFailed] = useState<boolean>(false)
    const [finishing, setFinishing] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [resources, setResources] = useState<Resource[] | undefined>(undefined)
    const [roleName, setRoleName] = useState<string | undefined>(undefined)

    const fetchRole = async () => {
        setFetchRoleFailed(false)
        if (!roleName && defaultRole) {
            const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getPrivileges(defaultRole)
            console.log('ManageRole', 'fetchRole', 'res', res)
            if (res.code !== 200) {
                setFetchRoleFailed(true)
                return
            }
            setFetchRoleFailed(false)

            setRoleName(defaultRole)

            const newResources: Resource[] = Object.entries(staticResources).map(r => ({ name: r[1], index: 0 }))

            const filteredPrivileges = res.data.filter(f => f.role === defaultRole)

            for (let i = 0; i < filteredPrivileges.length; i++) {
                if (newResources.find(r => r.name === filteredPrivileges[i].resource) === undefined) {
                    let resource: Resource = { name: filteredPrivileges[i].resource, index: 0 }
                    newResources.push(resource)
                }

                const index = newResources.findIndex(r => r.name === filteredPrivileges[i].resource)
                if (index < 0)
                    continue

                let attributes = filteredPrivileges[i].attributes.split(', ')
                if (attributes.includes('*'))
                    attributes = attributes.filter(f => f !== '*').concat(getAttributes(filteredPrivileges[i].resource, filteredPrivileges[i].action))
                const excludedAttributes: string[] = []
                attributes = attributes.filter((v, i, arr) => {
                    if (v.includes('!')) {
                        excludedAttributes.push(v.replace('!', ''))
                        return false
                    }
                    return true
                })
                attributes = attributes.filter((v, i, arr) => {
                    if (excludedAttributes.includes(v))
                        return false
                    return true
                })

                if (filteredPrivileges[i].action.includes('create'))
                    newResources[index].create = true
                else if (filteredPrivileges[i].action.includes('read'))
                    newResources[index].read = attributes
                else if (filteredPrivileges[i].action.includes('update'))
                    newResources[index].update = attributes
                else if (filteredPrivileges[i].action.includes('delete'))
                    newResources[index].delete = true
            }
            setResources(newResources)
            setLoading(false)
        }
        else {
            setResources(Object.entries(staticResources).map(r => ({ name: r[1], index: 0 })))
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRole()
    }, [defaultRole])

    const done = async () => {
        if (!roleName || roleName.trim() === '')
            return

        setFinishing(true)

        const privileges: Privilege[] = []
        for (let i = 0; i < resources.length; i++) {
            const r = resources[i]
            if (r.create)
                privileges.push({ action: 'create:any', role: roleName, resource: r.name, attributes: '*' })
            if (r.read)
                privileges.push({ action: 'read:any', role: roleName, resource: r.name, attributes: r.read.join(', ') })
            if (r.update)
                privileges.push({ action: 'update:any', role: roleName, resource: r.name, attributes: r.update.join(', ') })
            if (r.delete)
                privileges.push({ action: 'delete:any', role: roleName, resource: r.name, attributes: '*' })
        }

        console.log(privileges)

        try {
            if (defaultRole) {
                return
                // Not recommended for small projects(needs transaction support.)

                // const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.updateRole(privileges)
                // if (res.code !== 200 || res.data !== true) {
                //     publish(RESULT_EVENT_NAME, {
                //         severity: 'error',
                //         message: t('ManageRole.roleUpdateFailure')
                //     })
                //     return
                // }

                // publish(RESULT_EVENT_NAME, {
                //     severity: 'success',
                //     message: t('ManageRole.roleUpdateSuccessful')
                // })
            }
            else {
                const res = await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.createRole(privileges)
                if (res.code !== 200 || !res.data.acknowledged || res.data.insertedCount <= 0) {
                    publish(RESULT_EVENT_NAME, {
                        severity: 'error',
                        message: t('ManageRole.roleCreateFailure')
                    })
                    return
                }

                publish(RESULT_EVENT_NAME, {
                    severity: 'success',
                    message: t('ManageRole.roleCreateSuccessful')
                })
            }

            if (onFinish)
                onFinish()
        } finally { setFinishing(false) }
    }

    if (loading || !resources)
        return (
            <LoadingScreen>
                {
                    fetchRoleFailed &&
                    <Button onClick={async () => await fetchRole()}>
                        {t('ManageRole.tryAgain')}
                    </Button>
                }
            </LoadingScreen>
        )

    console.log('ManageRole', { roleName, resources })

    return (
        <>
            <Typography variant='h5' textAlign='center'>{defaultRole ? t('ManageRole.ManageRole') : t('ManageRole.createRole')}</Typography>
            <Divider sx={{ mt: 1, mb: 2 }} />
            {/* Role name */}
            <TextField fullWidth variant='standard' value={roleName ?? ''} label={t('ManageRole.roleName')} onChange={(e) => setRoleName(e.target.value)} />
            {resources.map((r, i) =>
                <Accordion key={i}>
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        {r.name}
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem>
                                <ListItemText primary={t('ManageRole.create')} />
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
                                <ListItemText primary={t('ManageRole.read')} />
                                <Checkbox
                                    edge='end'
                                    checked={r?.read !== undefined}
                                    onChange={() => {
                                        if (r.read !== undefined)
                                            resources[i].read = undefined
                                        else
                                            resources[i].read = getAttributes(r.name, 'read')
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
                                                {
                                                    a === '_id'
                                                        ? <Checkbox
                                                            edge="end"
                                                            disabled
                                                            checked
                                                        />
                                                        : <Checkbox
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
                                                }
                                            </ListItem>
                                        )
                                    }
                                </List>
                            </Collapse>
                            <ListItem>
                                <ListItemText primary={t('ManageRole.update')} />
                                <Checkbox
                                    edge="end"
                                    onChange={() => {
                                        if (r.update !== undefined)
                                            resources[i].update = undefined
                                        else
                                            resources[i].update = getAttributes(r.name, 'update')
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
                                <ListItemText primary={t('ManageRole.delete')} />
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
            )}
            <Divider sx={{ mt: 1, mb: 2 }} />
            <Button fullWidth disabled={finishing || !roleName || roleName.trim() === ''} onClick={done}>{finishing ? <CircularProgress size={20} /> : t('ManageRole.done')}</Button>
        </>
    )
}

