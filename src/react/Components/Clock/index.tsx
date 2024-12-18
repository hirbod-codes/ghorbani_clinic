import { Paper, Stack, Typography, useTheme } from "@mui/material"
import { DateTime } from "luxon"
import { memo, useContext, useEffect, useState } from "react"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { toFormat } from "../../Lib/DateTime/date-time-helpers"
import { getLuxonLocale } from "../../Lib/localization"

export const Clock = memo(function Clock() {
    const theme = useTheme()
    const configuration = useContext(ConfigurationContext)!

    const getDate = () => localizeNumbers(toFormat(DateTime.utc().toUnixInteger(), configuration.local, undefined, 'cccc y/M/d'), getLuxonLocale(configuration.local.language))
    const getTime = () => localizeNumbers(toFormat(DateTime.utc().toUnixInteger(), configuration.local, undefined, 'HH:mm:ss'), getLuxonLocale(configuration.local.language))
    const localizeNumbers = (str: string, languageCode: string) => {
        let result = ``
        for (let i = 0; i < str.length; i++)
            if (str[i] === ' ' || Number.isNaN(Number(str[i])))
                result += str[i]
            else
                result += new Intl.NumberFormat(languageCode, { useGrouping: false })
                    .format(str[i] as Intl.StringNumericLiteral)
        return result
    }

    const [date, setDate] = useState('getDate()')
    const [time, setTime] = useState(getTime())

    useEffect(() => {
        setInterval(() => {
            setDate(getDate());
            setTime(getTime());
        }, 1000);
    }, []);

    return (
        <>
            <Paper sx={{ p: 2 }}>
                <Stack direction='column' alignItems='center' sx={{ borderWidth: '1px', borderColor: theme.palette.grey[400] }}>
                    <Typography variant="body1">
                        {date}
                    </Typography>
                    <Typography variant="body1">
                        {time}
                    </Typography>
                </Stack>
            </Paper>
        </>
    )
})

