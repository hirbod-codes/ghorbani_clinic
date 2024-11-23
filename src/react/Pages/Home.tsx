import { Box, Grid, Stack, Typography, useTheme } from "@mui/material";
import { SearchPatientField } from "../Components/Search/SearchPatientField";
import { Analytics } from "../Components/Home/Analytics";
import { Modal } from "../Components/Modal";
import { useContext, useEffect, useState } from "react";
import { Canvas as TestCanvas } from "../Components/Canvas";
import { DATE, fromUnixToFormat } from "../Lib/DateTime/date-time-helpers";
import { DateTime } from "luxon";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { getLuxonLocale } from "../Lib/helpers";



export function Home() {
    console.log('Home')

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
            <Grid container spacing={1} p={1}>
                <Grid item xs={12} sm={3}>
                    <Stack direction='column' alignItems='center' sx={{ borderWidth: '1px', borderColor: theme.palette.grey[400] }}>
                        <Typography variant="body1">
                            {date}
                        </Typography>
                        <Typography variant="body1">
                            {time}
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={0} sm={9}></Grid>

                <Grid item xs={0} sm={3}></Grid>
                <Grid item xs={12} sm={6}>
                    <SearchPatientField />
                </Grid>
                <Grid item xs={0} sm={3}></Grid>

                <Grid item xs={12}>
                    <Box mb={10}></Box>
                </Grid>

                <Grid item xs={12}>
                    <Analytics />
                </Grid>

                <Grid item xs={12}>
                    {/* <Modal open={open} onClose={() => setOpen(false)}>
                        <div style={{ direction: 'ltr', position: 'relative', height: '100%', width: '100%' }}>
                            <TestCanvas />
                        </div>
                    </Modal> */}
                </Grid>
            </Grid>
        </>
    )
}
