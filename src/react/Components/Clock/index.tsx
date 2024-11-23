import { Stack, Typography, useTheme } from "@mui/material"
import { DateTime } from "luxon"
import { useContext, useEffect, useState } from "react"
import { ConfigurationContext } from "../../Contexts/ConfigurationContext"
import { fromUnixToFormat } from "../../Lib/DateTime/date-time-helpers"
import { getLuxonLocale } from "../../Lib/helpers"

export function Clock() {
    const theme = useTheme()
    const configuration = useContext(ConfigurationContext)

    const getDate = () => localizeNumbers(fromUnixToFormat(configuration.get.locale, DateTime.utc().toUnixInteger(), 'cccc y/M/d'), getLuxonLocale(configuration.get.locale.code))
    const getTime = () => localizeNumbers(DateTime.utc().setZone(configuration.get.locale.zone).toFormat('HH:mm:ss'), getLuxonLocale(configuration.get.locale.code))
    const localizeNumbers = (str: string, locale: string) => {
        let result = ``
        for (let i = 0; i < str.length; i++)
            if (str[i] === ' ' || Number.isNaN(Number(str[i])))
                result += str[i]
            else
                result += new Intl.NumberFormat(locale, { useGrouping: false })
                    .format(str[i] as Intl.StringNumericLiteral)
        return result
    }

    const [date, setDate] = useState(getDate())
    const [time, setTime] = useState(getTime())

    useEffect(() => {
        setInterval(() => {
            setDate(getDate());
            setTime(getTime());
        }, 1000);
    }, []);

    return (
        <>
            <Stack direction='column' alignItems='center' sx={{ borderWidth: '1px', borderColor: theme.palette.grey[400] }}>
                <Typography variant="body1">
                    {date}
                </Typography>
                <Typography variant="body1">
                    {time}
                </Typography>
            </Stack>
        </>
    )
}

