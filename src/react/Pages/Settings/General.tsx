import { Stack, Select, MenuItem, FormControl, InputLabel, TextField, Typography } from "@mui/material";
import { memo, useContext, useEffect, useState } from "react";
import { ConfigurationContext } from "../../Contexts/ConfigurationContext";
import { languages } from "../../i18next";
import { t } from "i18next";
import { getMuiLocale } from "../../Lib/helpers";
import type { Languages } from "../../Lib/Localization";
import { Button } from "@mui/material";
import { appAPI } from "../../../Electron/appRendererEvents";
import { publish } from "../../Lib/Events";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { Calendar, configAPI, TimeZone } from "src/Electron/Configuration/renderer.d";

export const General = memo(function General() {
    const configuration = useContext(ConfigurationContext)

    const [limit, setLimit] = useState<string>()

    const setConfigDownloadsDirectorySize = async (l: number) => {
        const c = await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig()
        c.downloadsDirectorySize = l
        return (window as typeof window & { configAPI: configAPI }).configAPI.writeConfig(c)
    }

    const getConfig = async () => {
        return await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig()
    }

    useEffect(() => {
        getConfig().then((c) => {
            setLimit(((c?.downloadsDirectorySize ?? 2_000_000_000) / 1_000_000_000).toFixed(1).toString());
        })
    }, [])

    return (
        <>
            <Stack spacing={1} sx={{ m: 1, p: 2 }}>
                <Button onClick={async () => {
                    // const r = await (window as typeof window & { appAPI: appAPI }).appAPI.appAPIAppIcon()
                    // console.log({ r })
                    // if (r)
                    //     publish(RESULT_EVENT_NAME, {
                    //         severity: 'success',
                    //         message: t('General.successfullyChangedIcon')
                    //     })
                    // else
                    //     publish(RESULT_EVENT_NAME, {
                    //         severity: 'error',
                    //         message: t('General.failedToChangeIcon')
                    //     })
                }}>{t('General.changeIcon')}</Button>
                <Stack direction='row' alignItems='center' sx={{ width: '100%' }}>
                    <TextField
                        sx={{ flexGrow: 2 }}
                        variant='standard'
                        type='text'
                        value={Math.round(Number(limit ?? '0') / 1000_000_000).toFixed(2)}
                        onChange={async (e) => {
                            if (e.target.value === '') {
                                setLimit('')
                                return
                            }

                            let l = Number.parseInt(e.target.value)
                            if (!l)
                                return
                            else
                                setLimit((l * 1000_000_000).toString())

                            await setConfigDownloadsDirectorySize(l)
                        }}
                        label={t('General.TemporaryStorageLimit')}
                    />
                    <Typography variant='body1'>GB</Typography>
                </Stack>
                <FormControl variant='standard' >
                    <InputLabel id="calendar-label">{t('calendar')}</InputLabel>
                    <Select
                        onChange={(e) => configuration.updateLocal(e.target.value as Calendar, configuration.local.direction, getMuiLocale(configuration.local.language))}
                        labelId="calendar-label"
                        id='calendar'
                        value={configuration.local.calendar}
                        fullWidth
                    >
                        <MenuItem value='Persian'>{t('persianCalendarName')}</MenuItem>
                        <MenuItem value='Gregorian'>{t('gregorianCalendarName')}</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant='standard'>
                    <InputLabel id="language-label">{t('language')}</InputLabel>
                    <Select
                        onChange={(e) => configuration.updateLocal(configuration.local.calendar, languages.find(v => v.code === e.target.value).direction, getMuiLocale(e.target.value as Languages))}
                        labelId="language-label"
                        id='language'
                        value={languages.find(v => v.code === configuration.local.language).code}
                        fullWidth
                    >
                        {
                            languages.map((elm, i) =>
                                <MenuItem key={i} value={elm.code}>{elm.name}</MenuItem>
                            )
                        }
                    </Select>
                </FormControl>
                <FormControl variant='standard' >
                    <InputLabel id="time-zone-label">{t('timeZone')}</InputLabel>
                    <Select
                        onChange={(e) => configuration.updateLocal(configuration.local.calendar, configuration.local.direction, getMuiLocale(configuration.local.language), e.target.value as TimeZone)}
                        labelId="time-zone-label"
                        id='time-zone'
                        value={configuration.local.zone}
                        fullWidth
                    >
                        <MenuItem value='Asia/Tehran'>{t('Asia/Tehran')}</MenuItem>
                        <MenuItem value='UTC'>UTC</MenuItem>
                    </Select>
                </FormControl>
            </Stack></>
    )
})
