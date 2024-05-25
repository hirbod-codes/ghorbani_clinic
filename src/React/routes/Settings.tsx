import { Box, Button, Stack, TextField } from "@mui/material";
import { useRef, useState } from "react";
import type { dbAPI } from "../../Electron/Database/renderer/dbAPI";
import { MongodbConfig } from "../../Config/config";

export function Settings() {
    const [url, setUrl] = useState('')
    const [dbUsername, setDBUsername] = useState('')
    const [dbPassword, setDBPassword] = useState('')
    const [dbName, setDBName] = useState('')

    const configRef = useRef(null);

    if (configRef.current == null)
        (window as typeof window & { dbAPI: dbAPI }).dbAPI.getConfig().then((config: MongodbConfig) => {
            configRef.current = config
            setUrl(config.url)
            setDBUsername(config.auth.username)
            setDBPassword(config.auth.password)
            setDBName(config.databaseName)
            console.log(config)
        })

    const submit = async () => {
        const result = await (window as typeof window & { dbAPI: dbAPI }).dbAPI.updateConfig({
            url: url,
            databaseName: dbName,
            auth: {
                username: dbUsername,
                password: dbPassword,
            },
        })

        console.log(result);
    }

    if (configRef.current == null)
        return (<>{null}</>)
    else
        return (
            <>
                <Stack spacing={1} sx={{ m: 1, p: 2 }}>
                    <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} id='url' value={url} label='Url' fullWidth required />
                    <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDBUsername(e.target.value)} id='dbUsername' value={dbUsername} label='DBUsername' fullWidth required />
                    <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDBPassword(e.target.value)} id='dbPassword' value={dbPassword} label='DBPassword' fullWidth required type='password' />
                    <TextField variant='standard' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDBName(e.target.value)} id='dbName' value={dbName} label='DBName' fullWidth required />
                    <Box sx={{ height: '2rem' }} />
                    <Button variant='outlined' onClick={submit}>Update</Button>
                </Stack>
            </>
        )
}