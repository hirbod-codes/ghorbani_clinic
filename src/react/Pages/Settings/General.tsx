import { Fragment, memo, useContext, useEffect, useState } from "react";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { languages } from "../../i18next";
import { t } from "i18next";
import { Calendar, configAPI, LanguageCodes, TimeZone } from "src/Electron/Configuration/renderer.d";
import { Button } from "../../Components/Base/Button";
import { Input } from "../../Components/Base/Input";
import { Select } from "../../Components/Base/Select";
import { Stack } from "../../Components/Base/Stack";
import { Container } from "../../Components/Base/Container";
import { Separator } from "../../shadcn/components/ui/separator";

export const General = memo(function General() {
    const configuration = useContext(ConfigurationContext)!

    const [limit, setLimit] = useState<string>()

    const setConfigDownloadsDirectorySize = async (l: number) => {
        const c = (await (window as typeof window & { configAPI: configAPI }).configAPI.readConfig())!
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
        <Container className="absolute top-0 left-1/2 -translate-x-1/2 mt-2">
            <Stack direction='vertical'>
                <Input
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
                    labelId={t('General.TemporaryStorageLimit')}
                    endIcon={<p>GB</p>}
                />

                <Select
                    label="Calendar"
                    defaultDisplayValue={configuration.local.calendar === 'Persian' ? t('persianCalendarName') : t('gregorianCalendarName')}
                    defaultValue={configuration.local.calendar}
                    onValueChange={(e) => configuration.updateLocal(configuration.local.language, e as Calendar, configuration.local.direction, configuration.local.zone)}
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
                    onValueChange={(e) => configuration.updateLocal(configuration.local.language, e as Calendar, configuration.local.direction, configuration.local.zone)}
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
        </Container>
    )
})
