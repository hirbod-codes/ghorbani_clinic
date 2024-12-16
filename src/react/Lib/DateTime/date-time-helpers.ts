import { getGregorianMonths, gregorian_to_jd, isLeapGregorianYear, jd_to_gregorian } from "./gregorian-calendar"
import { getPersianMonths, isLeapPersianYear, jd_to_persian, persian_to_jd } from "./persian-calendar"
import { DateObjectUnits, DateTime } from "luxon"
import type { Date, Time, GregorianDate, PersianDate, DateTimeView } from '../DateTime'
import { mixed, number } from "yup"
import { getLuxonLocale } from "../helpers"
import { Calendar, Local } from "../../../Electron/Configuration/renderer.d"

export const DATE_TIME = 'cccc d/M/y H:m:s'
export const DATE = 'cccc d/M/y'
export const TIME = 'H:m:s'

// export function toLocalDateTime(date: number, locale: Local): DateTime
// export function toLocalDateTime(date: DateTimeView, locale: Local): DateTime
// export function toLocalDateTime(date: DateTimeView | number, locale: Local): DateTime {
//     if (number().required().isValidSync(date))
//         date = fromUnix(locale, date)

//     return DateTime.local(date.date.year, date.date.month, date.date.day, date.time.hour, date.time.minute, date.time.second, 0, { locale: getLuxonLocale(locale.language), zone: locale.zone })
// }
// export function toLocalFormat(date: number, locale: Local, format?: string): string 
// export function toLocalFormat(date: number, locale: Local, format?: string): string
// export function toLocalFormat(date: DateTimeView, locale: Local, format?: string): string
// export function toLocalFormat(date: DateTimeView | number, locale: Local, format = DATE_TIME): string {
//     return toLocalDateTime(date as any, locale).toFormat(format)
// }

// export function fromUnix(toLocale: Local, unixTimestamp: number): DateTimeView {
//     const dateTime = DateTime.fromSeconds(unixTimestamp).setZone(toLocale.zone).setLocale(getLuxonLocale(toLocale.language))

//     return fromDateTimeToParts(toLocale, 'Gregorian', dateTime)
// }

// export function fromUnixToFormat(toLocale: Local, unixTimestamp: number, format = DATE_TIME): string {
//     return toLocalFormat(fromUnix(toLocale, unixTimestamp), toLocale, format)
// }

// export function fromDateTimeParts(toLocale: Local, fromLocale: Local, date: Date, time?: Time): DateTimeView {
//     if (!time)
//         time = { hour: 0, minute: 0, second: 0 }

//     const dateTime = DateTime
//         .local(date.year, date.month, date.day, time.hour, time.minute, time.second, { zone: fromLocale.zone })
//         .setZone(toLocale.zone)
//         .setLocale(getLuxonLocale(toLocale.language))

//     return fromDateTimeToParts(toLocale, fromLocale.calendar, dateTime)
// }

// export function fromDateTimePartsToFormat(toLocale: Local, fromLocale: Local, date: Date, time?: Time, format = DATE_TIME): string {
//     return toLocalFormat(fromDateTimeParts(toLocale, fromLocale, date, time), toLocale, format)
// }

// export function fromDateTimeToParts(toLocale: Local, fromCalendar: Calendar, dateTime: DateTime): DateTimeView {
//     dateTime = dateTime
//         .setZone(toLocale.zone)
//         .setLocale(getLuxonLocale(toLocale.language))

//     let date
//     if (toLocale.calendar === fromCalendar)
//         date = { year: dateTime.year, month: dateTime.month, day: dateTime.day }
//     else
//         switch (toLocale.calendar) {
//             case 'Persian':
//                 date = gregorianToPersian({ year: dateTime.year, month: dateTime.month, day: dateTime.day })
//                 break;

//             case 'Gregorian':
//                 date = persianToGregorian({ year: dateTime.year, month: dateTime.month, day: dateTime.day })
//                 break;

//             default:
//                 throw new Error('invalid value for calendar provided.')
//         }

//     return {
//         date,
//         time: {
//             hour: dateTime.hour,
//             minute: dateTime.minute,
//             second: dateTime.second,
//         }
//     }
// }

// export function fromDateTimeToFormat(toLocale: Local, fromCalendar: Calendar, dateTime: DateTime, format = DATE_TIME): string {
//     return toLocalFormat(fromDateTimeToParts(toLocale, fromCalendar, dateTime), toLocale, format)
// }

export function getLocaleMonths(locale: Local, year: number): { name: string, days: number }[] {
    if (locale.calendar === 'Persian')
        return getPersianMonths(isLeapPersianYear(year), locale.language)
    if (locale.calendar === 'Gregorian')
        return getGregorianMonths(isLeapGregorianYear(year), locale.language)

    throw new Error('An unknown calendar requested.')
}

/**
 * Convert Persian date to Gregorian date
 * @param date one based month and day
 */
export function persianToGregorian(date: PersianDate): GregorianDate {
    return jd_to_gregorian(persian_to_jd(date) + 0.5)
}

/**
 * Convert Gregorian date to Persian date
 * @param date one based month and day
 */
export function gregorianToPersian(date: GregorianDate): PersianDate {
    return jd_to_persian(gregorian_to_jd(date))
}

export function toDateTime(timestamp: number, toLocal: Local, fromLocal?: Local): DateTime
export function toDateTime(dateTime: DateTime, toLocal: Local, fromLocal?: Local): DateTime
export function toDateTime(dateTime: DateTimeView, toLocal: Local, fromLocal: Local): DateTime
export function toDateTime(dateTime: number | DateTime | DateTimeView, toLocal: Local, fromLocal?: Local): DateTime {
    console.log({ dateTime, toLocal, fromLocal })

    if (!mixed<Local>().required().isValidSync(toLocal) || !mixed<Local>().optional().isValidSync(toLocal))
        throw new Error('Invalid arguments provided to toDateTime function.')

    if (typeof dateTime === 'number' || typeof dateTime === 'bigint')
        return toDateTime(DateTime.fromSeconds(dateTime, { zone: 'UTC' }), toLocal, { zone: 'UTC', calendar: 'Gregorian', direction: 'ltr', language: 'en' })
    else if (dateTime instanceof DateTime)
        return dateTime.setLocale(getLuxonLocale(toLocal.language)).setZone(toLocal.zone)

    let convertedDateTimeView: DateTimeView
    if (fromLocal!.calendar === 'Persian')
        convertedDateTimeView = { time: dateTime.time, date: persianToGregorian(dateTime.date) }
    else
        convertedDateTimeView = dateTime

    return DateTime
        .local(convertedDateTimeView.date.year,
            convertedDateTimeView.date.month,
            convertedDateTimeView.date.day,
            dateTime.time.hour,
            dateTime.time.minute,
            dateTime.time.second,
            dateTime.time?.millisecond ?? 0,
            { locale: getLuxonLocale(fromLocal!.language), zone: fromLocal!.zone, outputCalendar: toLocal.calendar === 'Gregorian' ? undefined : toLocal.calendar })
        .setLocale(getLuxonLocale(toLocal.language))
        .setZone(toLocal.zone)

}

export function toDateTimeView(timestamp: number, toLocal: Local, fromLocal?: Local): DateTimeView
export function toDateTimeView(dateTime: DateTime, toLocal: Local, fromLocal: Local): DateTimeView
export function toDateTimeView(dateTime: DateTimeView, toLocal: Local, fromLocal: Local): DateTimeView
export function toDateTimeView(dateTime: number | DateTime | DateTimeView, toLocal: Local, fromLocal?: Local): DateTimeView {
    console.log({ dateTime, toLocal, fromLocal })

    if (typeof dateTime === 'number' || typeof dateTime === 'bigint')
        return toDateTimeView(DateTime.fromSeconds(dateTime, { zone: 'UTC' }), toLocal, { zone: 'UTC', calendar: 'Gregorian', direction: 'ltr', language: 'en' })
    else if (dateTime instanceof DateTime)
        return toDateTimeView(getDateTimeView(dateTime), toLocal, { ...fromLocal!, calendar: 'Gregorian' })

    let convertedDateTimeView
    switch (toLocal.calendar) {
        case 'Persian':
            if (fromLocal!.calendar === 'Persian') {
                const gregorianView = persianToGregorian(dateTime.date)
                const dt = DateTime
                    .local(gregorianView.year, gregorianView.month, gregorianView.day, dateTime.time.hour, dateTime.time.minute, dateTime.time.second, dateTime.time?.millisecond ?? 0, { locale: getLuxonLocale(fromLocal!.language), zone: fromLocal!.zone })
                    .setLocale(getLuxonLocale(toLocal.language))
                    .setZone(toLocal.zone)
                // Converting again because when updating time zone, date might change too.
                convertedDateTimeView = { date: gregorianToPersian(gregorianView), time: getTimeView(dt) }
            }
            else {
                const dt = DateTime
                    .local(dateTime.date.year, dateTime.date.month, dateTime.date.day, dateTime.time.hour, dateTime.time.minute, dateTime.time.second, dateTime.time?.millisecond ?? 0, { locale: getLuxonLocale(fromLocal!.language), zone: fromLocal!.zone })
                    .setLocale(getLuxonLocale(toLocal.language))
                    .setZone(toLocal.zone)
                // When updating time zone, date might change too.
                convertedDateTimeView = { date: gregorianToPersian(dateTime.date), time: getTimeView(dt) }
            }
            break;

        case 'Gregorian':
            if (fromLocal!.calendar === 'Persian') {
                const gregorianView = persianToGregorian(dateTime.date)
                const dt = DateTime
                    .local(gregorianView.year, gregorianView.month, gregorianView.day, dateTime.time.hour, dateTime.time.minute, dateTime.time.second, dateTime.time?.millisecond ?? 0, { locale: getLuxonLocale(fromLocal!.language), zone: fromLocal!.zone })
                    .setLocale(getLuxonLocale(toLocal.language))
                    .setZone(toLocal.zone)
                // Converting again because when updating time zone, date might change too.
                convertedDateTimeView = { date: gregorianView, time: getTimeView(dt) }
            } else {
                const dt = DateTime
                    .local(dateTime.date.year, dateTime.date.month, dateTime.date.day, dateTime.time.hour, dateTime.time.minute, dateTime.time.second, dateTime.time?.millisecond ?? 0, { locale: getLuxonLocale(fromLocal!.language), zone: fromLocal!.zone })
                    .setLocale(getLuxonLocale(toLocal.language))
                    .setZone(toLocal.zone)
                // Converting again because when updating time zone, date might change too.
                convertedDateTimeView = { date: dateTime, time: getTimeView(dt) }
            }
            break;

        default:
            throw new Error('invalid value for calendar provided.')
    }

    return convertedDateTimeView
}

export function getDateView(dateTime: DateTime): Date {
    return {
        year: dateTime.year,
        month: dateTime.month,
        day: dateTime.day,
    }
}

export function getTimeView(dateTime: DateTime): Time {
    return {
        hour: dateTime.hour,
        minute: dateTime.minute,
        second: dateTime.second,
        millisecond: dateTime.millisecond,
    }
}

export function getDateTimeView(dateTime: DateTime): DateTimeView {
    return {
        date: getDateView(dateTime),
        time: getTimeView(dateTime)
    }
}

export function toFormat(timestamp: number, toLocal: Local, fromLocal?: Local, format?: string): string
export function toFormat(dateTime: DateTime, toLocal: Local, fromLocal: Local, format?: string): string
export function toFormat(dateTime: DateTimeView, toLocal: Local, fromLocal: Local, format?: string): string
export function toFormat(dateTime: number | DateTime | DateTimeView, toLocal: Local, fromLocal?: Local, format = DATE_TIME): string {
    return toDateTime(dateTime as any, toLocal, fromLocal).toFormat(format)
}
