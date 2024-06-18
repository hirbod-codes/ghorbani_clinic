import { Stack, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useContext } from "react";
import { ConfigurationContext } from "../../ConfigurationContext";
import { Calendar, TimeZone } from "../../Lib/DateTime";
import { languages } from "../../i18next";
import { t } from "i18next";
import { getReactLocale } from "../../Lib/helpers";
import type { Languages } from "../../Lib/Localization";

export function General() {
    const configuration = useContext(ConfigurationContext)

    return (
        <>
            <Stack spacing={1} sx={{ m: 1, p: 2 }}>
                <FormControl variant='standard' >
                    <InputLabel id="calendar-label">{t('calendar')}</InputLabel>
                    <Select
                        onChange={(e) => configuration.set.updateLocale(e.target.value as Calendar, configuration.get.locale.direction, getReactLocale(configuration.get.locale.code))}
                        labelId="calendar-label"
                        id='calendar'
                        value={configuration.get.locale.calendar}
                        fullWidth
                    >
                        <MenuItem value='Persian'>{t('persianCalendarName')}</MenuItem>
                        <MenuItem value='Gregorian'>{t('gregorianCalendarName')}</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant='standard'>
                    <InputLabel id="language-label">{t('language')}</InputLabel>
                    <Select
                        onChange={(e) => configuration.set.updateLocale(configuration.get.locale.calendar, languages.find(v => v.code === e.target.value).direction, getReactLocale(e.target.value as Languages))}
                        labelId="language-label"
                        id='language'
                        value={languages.find(v => v.code === configuration.get.locale.code).code}
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
                        onChange={(e) => configuration.set.updateTimeZone(e.target.value as TimeZone)}
                        labelId="time-zone-label"
                        id='time-zone'
                        value={configuration.get.locale.zone}
                        fullWidth
                    >
                        <MenuItem value='Asia/Tehran'>{t('Asia/Tehran')}</MenuItem>
                        <MenuItem value='UTC'>UTC</MenuItem>
                    </Select>
                </FormControl>
            </Stack></>
    )
}
