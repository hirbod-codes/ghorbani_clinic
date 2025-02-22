import { DateTime } from "luxon"
import { ComponentProps, memo, useContext, useEffect, useState } from "react"
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext"
import { toFormat } from "../../Lib/DateTime/date-time-helpers"
import { getLuxonLocale } from "../../Lib/localization"
import { Stack } from "../Base/Stack"
import { cn } from "../../shadcn/lib/utils"

export const Clock = memo(function Clock({ containerProps }: { containerProps?: ComponentProps<typeof Stack> }) {
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

    const [date, setDate] = useState(getDate())
    const [time, setTime] = useState(getTime())

    useEffect(() => {
        setInterval(() => {
            setDate(getDate());
            setTime(getTime());
        }, 1000);
    }, []);

    return (
        <Stack direction="vertical" {...containerProps} stackProps={{ ...containerProps?.stackProps, className: cn("items-center", containerProps?.stackProps?.className), }}>
            <p>{date}</p>
            <p>{time}</p>
        </Stack>
    )
})

