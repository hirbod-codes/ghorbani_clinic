import { memo, useContext, useEffect, useState } from "react";
import { ConfigurationContext } from "../../Contexts/Configuration/ConfigurationContext";
import { languages } from "../../i18next";
import { t } from "i18next";
import { Calendar, configAPI, LanguageCodes, TimeZone } from "src/Electron/Configuration/renderer.d";
import { Button } from "../../shadcn/components/ui/button";
import { Input } from "../../Components/Base/Input";
import { Select } from "../../Components/Base/Select";

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
        <div className="flex flex-row space-x-1 space-y-1 m-1 p-2">
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
            }}>
                {t('General.changeIcon')}
            </Button>
            <div className="flex flex-row items-center w-full">
                <Input
                    className="flex-grow"
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
                />
                <p>GB</p>
            </div>

            <Select
                selectOptions={{ type: 'items', items: [{ value: 'Persian', displayValue: t('persianCalendarName') }, { value: 'Gregorian', displayValue: t('gregorianCalendarName') }] }}
                value={configuration.local.calendar}
                onValueChange={(e) => configuration.updateLocal(configuration.local.language, e as Calendar, configuration.local.direction, configuration.local.zone)}
            />

            <Select
                selectOptions={{ type: 'items', items: languages.map(e => ({ value: e.code, displayValue: e.name })) }}// [{ value: 'Persian', displayValue: t('persianCalendarName') }, { value: 'Gregorian', displayValue: t('gregorianCalendarName') }] }}
                value={languages.find(v => v.code === configuration.local.language)!.code}
                onValueChange={(e) => configuration.updateLocal(e as LanguageCodes, configuration.local.calendar, languages.find(v => v.code === e)!.direction, configuration.local.zone)}
            />

            <Select
                selectOptions={{ type: 'items', items: languages.map(e => ({ value: e.code, displayValue: e.name })) }}// [{ value: 'Persian', displayValue: t('persianCalendarName') }, { value: 'Gregorian', displayValue: t('gregorianCalendarName') }] }}
                value={configuration.local.zone}
                onValueChange={(e) => configuration.updateLocal(configuration.local.language, configuration.local.calendar, languages.find(v => v.code === e)!.direction, e as TimeZone)}
            />
        </div>
    )
})
