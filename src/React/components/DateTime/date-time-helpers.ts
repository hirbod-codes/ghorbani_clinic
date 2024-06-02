import { getGregorianMonths, gregorian_to_jd, isLeapGregorianYear, jd_to_gregorian } from "./gregorian-calendar"
import { getPersianMonths, isLeapPersianYear, jd_to_persian, persian_to_jd } from "./persian-calendar"
import { DateTime } from "luxon"
import type { Date, Time, GregorianDate, PersianDate } from './date-time'
import { Calendar, Locale } from "../Localization/types"
import { number } from "yup"

export function toFormat(date: number, locale: Locale, format: string): string
export function toFormat(date: { date: Date, time: Time }, locale: Locale, format: string): string
export function toFormat(date: { date: Date, time: Time } | number, locale: Locale, format = 'cccc d/M/y H:m:s'): string {
    if (number().required().isValidSync(date))
        date = fromUnix(locale, date)

    return DateTime
        .local(date.date.year, date.date.month, date.date.day, date.time.hour, date.time.minute, date.time.second)
        .setLocale(locale.getLocale(locale.reactLocale))
        .toFormat(format)
}

export function fromUnix(toLocale: Locale, unixTimestamp: number): { date: Date, time: Time } {
    const dateTime = DateTime.fromSeconds(unixTimestamp).setZone(toLocale.zone).setLocale(toLocale.getLocale(toLocale.reactLocale))

    return fromDateTime(toLocale, 'Gregorian', dateTime)
}

export function fromUnixToFormat(toLocale: Locale, unixTimestamp: number, format = 'cccc d/M/y H:m:s'): string {
    return toFormat(fromUnix(toLocale, unixTimestamp), toLocale, format)
}

export function fromDateTimeParts(toLocale: Locale, fromLocale: Locale, date: Date, time?: Time): { date: Date, time: Time } {
    if (!time)
        time = { hour: 0, minute: 0, second: 0 }

    const dateTime = DateTime
        .local(date.year, date.month, date.day, time.hour, time.minute, time.second, { zone: fromLocale.zone })
        .setZone(toLocale.zone)
        .setLocale(toLocale.getLocale(toLocale.reactLocale))

    return fromDateTime(toLocale, fromLocale.calendar, dateTime)
}

export function fromDateTimePartsToFormat(toLocale: Locale, fromLocale: Locale, date: Date, time?: Time, format = 'cccc d/M/y H:m:s'): string {
    return toFormat(fromDateTimeParts(toLocale, fromLocale, date, time), toLocale, format)
}

export function fromDateTime(toLocale: Locale, fromCalendar: Calendar, dateTime: DateTime): { date: Date, time: Time } {
    dateTime = dateTime
        .setZone(toLocale.zone)
        .setLocale(toLocale.getLocale(toLocale.reactLocale))

    let date
    if (toLocale.calendar === fromCalendar)
        date = { year: dateTime.year, month: dateTime.month, day: dateTime.day }
    else
        switch (toLocale.calendar) {
            case 'Persian':
                date = gregorianToPersian({ year: dateTime.year, month: dateTime.month, day: dateTime.day })
                break;

            case 'Gregorian':
                date = persianToGregorian({ year: dateTime.year, month: dateTime.month, day: dateTime.day })
                break;

            default:
                throw new Error('invalid value for calendar provided.')
        }

    return {
        date,
        time: {
            hour: dateTime.hour,
            minute: dateTime.minute,
            second: dateTime.second,
        }
    }
}

export function fromDateTimeToFormat(toLocale: Locale, fromCalendar: Calendar, dateTime: DateTime, format = 'cccc d/M/y H:m:s'): string {
    return toFormat(fromDateTime(toLocale, fromCalendar, dateTime), toLocale, format)
}

export function getLocaleMonths(locale: Locale, year: number): { name: string, days: number }[] {
    const language = locale.getLocale(locale.reactLocale)
    if (locale.calendar === 'Persian')
        return getPersianMonths(isLeapPersianYear(year), language)
    if (locale.calendar === 'Gregorian')
        return getGregorianMonths(isLeapGregorianYear(year), language)
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
