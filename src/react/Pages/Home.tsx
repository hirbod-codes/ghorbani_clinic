import { useContext } from "react";
import { ConfigurationContext } from "../Contexts/ConfigurationContext";
import { fromDateTimeToFormat } from "../Lib/DateTime/date-time-helpers";
import { DateTime } from "luxon";
import { t } from "i18next";

export function Home() {
    const conf = useContext(ConfigurationContext)

    return (
        <>
            <h1>{t('home')}</h1>
            <h3>{fromDateTimeToFormat(conf.get.locale, 'Gregorian', DateTime.utc())}</h3>
        </>
    )
}
