import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { Visit } from "../../../Electron/Database/Models/Visit";
import { Date } from "../../Lib/DateTime";
import { publish } from "../../Lib/Events";
import { RESULT_EVENT_NAME } from "../../Contexts/ResultWrapper";
import { t } from "i18next";
import { toDateTime} from "../../Lib/DateTime/date-time-helpers";
import { Local } from "../../Lib/Localization";

export const getVisitsInDate = async (date: Date, local: Local): Promise<Visit[] | undefined> => {
    const toLocal: Local = { calendar: 'Gregorian', code: 'en', direction: 'ltr', zone: 'UTC' }
    const startDate = toDateTime({ date, time: { hour: 0, minute: 0, second: 0, millisecond: 0 } }, toLocal, local).toUnixInteger()
    const endDate = toDateTime({ date, time: { hour: 23, minute: 59, second: 59, millisecond: 999 } }, toLocal, local).toUnixInteger()

    const res = (await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisitsByDate(startDate, endDate))
    console.log('getVisitsInDate', { date, res })

    if (res.code < 200 || res.data === undefined)
        publish(RESULT_EVENT_NAME, {
            severity: 'success',
            message: t('VisitHelpers.getVisitsInDate.failedToFetchVisits')
        })
    else
        return res.data
}
