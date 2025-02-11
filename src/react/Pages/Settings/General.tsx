import { Fragment, memo, useContext, useEffect, useState } from "react";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { languages } from "../../i18next";
import { t } from "i18next";
import { Calendar, configAPI } from "src/Electron/Configuration/renderer.d";
import { Input } from "../../Components/Base/Input";
import { Select } from "../../Components/Base/Select";
import { Stack } from "../../Components/Base/Stack";
import { Container } from "../../Components/Base/Container";
import { Separator } from "../../shadcn/components/ui/separator";

export const General = memo(function General() {
    const configuration = useContext(ConfigurationContext)!

    const [limit, setLimit] = useState<string>('0')

    const setConfigDownloadsDirectorySize = async (l: number) => {
        await (window as typeof window & { configAPI: configAPI }).configAPI.setDownloadsDirectorySize(l)
    }

    const getConfig = async () => {
        return await (window as typeof window & { configAPI: configAPI }).configAPI.getDownloadsDirectorySize()
    }

    useEffect(() => {
        getConfig().then((n) => {
            setLimit(Math.round(Number(n ?? '0') / 1000_000_000).toFixed(2))
        })
    }, [])

    return (
        <Container className="absolute top-1/4 left-1/2 -translate-x-1/2 mt-2">
            <Stack direction='vertical'>
                <Input
                    value={limit}
                    onChange={async (e) => {
                        setLimit(e.target.value)

                        let l = Number(e.target.value)
                        if (!l || Number.isNaN(l) || l === Infinity || l === -Infinity)
                            return

                        await setConfigDownloadsDirectorySize(l * 1000_000_000)
                    }}
                    label={t('General.TemporaryStorageLimit')}
                    labelId={t('General.TemporaryStorageLimit')}
                    endIcon={<p>GB</p>}
                    labelContainerProps={{ stackProps: { className: 'w-full justify-between' } }}
                />

                <Select
                    label="Calendar"
                    defaultDisplayValue={configuration.local.calendar === 'Persian' ? t('persianCalendarName') : t('gregorianCalendarName')}
                    defaultValue={configuration.local.calendar}
                    onValueChange={(e) => configuration.updateLocal(configuration.local.language, e as Calendar, configuration.local.direction, configuration.local.zone)}
                    inputProps={{ labelContainerProps: { stackProps: { className: 'w-full justify-between' } } }}
                >
                    <Select.Item value='Persian' displayValue={t('persianCalendarName')}>
                        {t('persianCalendarName')}
                    </Select.Item>
                    <Separator />
                    <Select.Item value='Gregorian' displayValue={t('gregorianCalendarName')}>
                        {t('gregorianCalendarName')}
                    </Select.Item>
                </Select>

                <Select
                    label={t('language')}
                    defaultDisplayValue={languages.find(v => v.code === configuration.local.language)!.name}
                    defaultValue={languages.find(v => v.code === configuration.local.language)!.code}
                    onValueChange={(e) => configuration.updateLocal(e, configuration.local.calendar, e === 'en' ? 'ltr' : 'rtl', configuration.local.zone)}
                    inputProps={{ labelContainerProps: { stackProps: { className: 'w-full justify-between' } } }}
                >
                    {languages.map((e, i) =>
                        <Fragment key={i}>
                            <Select.Item value={e.code} displayValue={e.name}>
                                {e.name}
                            </Select.Item>
                            {i !== languages.length - 1 &&
                                <Separator />
                            }
                        </Fragment>
                    )}
                </Select>

                <Select
                    label={t('timezone')}
                    defaultDisplayValue={configuration.local.zone}
                    defaultValue={configuration.local.zone}
                    onValueChange={(e) => configuration.updateLocal(configuration.local.language, e as Calendar, configuration.local.direction, configuration.local.zone)}
                    inputProps={{ labelContainerProps: { stackProps: { className: 'w-full justify-between' } } }}
                >
                    {['UTC', "Asia/Tehran"].map((e, i) =>
                        <Fragment key={i}>
                            <Select.Item value={e} displayValue={e}>
                                {e}
                            </Select.Item>
                            {i !== languages.length - 1 &&
                                <Separator />
                            }
                        </Fragment>
                    )}
                </Select>
            </Stack>
        </Container >
    )
})
