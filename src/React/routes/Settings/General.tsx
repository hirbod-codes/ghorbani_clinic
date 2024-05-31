import { Stack, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { ConfigurationContext } from "../../../React/ConfigurationContext"
import { useContext } from "react";
import { languages } from "../../../React/i18next";
import { Calendar, TimeZone } from "../../../React/components/Localization/types";

export function General() {
    const configuration = useContext(ConfigurationContext)

    return (
        <>
            <Stack spacing={1} sx={{ m: 1, p: 2 }}>
                <FormControl variant='standard' >
                    <InputLabel id="calendar-label">Calendar</InputLabel>
                    <Select
                        onChange={(e) => configuration.set.updateLocale(e.target.value as Calendar, configuration.get.locale.direction, configuration.get.locale.reactLocale)}
                        labelId="calendar-label"
                        id='calendar'
                        value={configuration.get.locale.calendar}
                        fullWidth
                    >
                        <MenuItem value='Persian'>Persian</MenuItem>
                        <MenuItem value='Gregorian'>Gregorian</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant='standard' >
                    <InputLabel id="language-label">Language</InputLabel>
                    <Select
                        onChange={(e) => configuration.set.updateLocale(configuration.get.locale.calendar, configuration.get.locale.direction, configuration.get.locale.getReactLocale(e.target.value))}
                        labelId="language-label"
                        id='language'
                        value={languages.find(v => v.code === configuration.get.locale.getLocale(configuration.get.locale.reactLocale)).name}
                        fullWidth
                    >
                        {
                            languages.map((elm, i) =>
                                <MenuItem key={i} value={elm.name}>{elm.name}</MenuItem>
                            )
                        }
                    </Select>
                </FormControl>
                <FormControl variant='standard' >
                    <InputLabel id="time-zone-label">Time Zone</InputLabel>
                    <Select
                        onChange={(e) => configuration.set.updateTimeZone(e.target.value as TimeZone)}
                        labelId="time-zone-label"
                        id='time-zone'
                        value={configuration.get.locale.zone}
                        fullWidth
                    >
                        <MenuItem value='Asia/Tehran'>Asia/Tehran</MenuItem>
                        <MenuItem value='UTC'>UTC</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        </>
    )
}