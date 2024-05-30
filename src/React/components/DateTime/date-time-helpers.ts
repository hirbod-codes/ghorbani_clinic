import { gregorian_to_jd, jd_to_gregorian } from "./gregorian-calendar"
import { jd_to_persian, persian_to_jd } from "./persian-calendar"
import { DateTime } from "luxon"
import type { Date, Time, GregorianDate, PersianDate } from './date-time'
import { useContext } from "react"
import { LocaleContext } from "./LocaleContext"

export function getDateTime(date: DateTime): DateTime
export function getDateTime(date: Date, time: Time, fromZone: string): DateTime
export function getDateTime(date: DateTime | Date, time?: Time, fromZone?: string): DateTime {
    const toLocale = useContext(LocaleContext)

    let formattedDate
    if (time === undefined)
        formattedDate = (date as DateTime).setLocale(toLocale.language).setZone(toLocale.zone)
    else {
        formattedDate = DateTime.fromFormat(`${date.year}/${date.month}/${date.day} ${time.hour}:${time.minute}:${time.second} `, 'y/M/d H:m:s', { zone: fromZone })
        formattedDate = formattedDate.setLocale(toLocale.language).setZone(toLocale.zone)
    }

    return formattedDate
}

export function getRawDateTime(date: DateTime): { date: Date, time: Time }
export function getRawDateTime(date: Date, time: Time, fromZone: string): { date: Date, time: Time }
export function getRawDateTime(date: DateTime | Date, time?: Time, fromZone?: string): { date: Date, time: Time } {
    const toLocale = useContext(LocaleContext)

    let formattedDate: DateTime
    if (time === undefined)
        formattedDate = (date as DateTime).setLocale(toLocale.language).setZone(toLocale.zone)
    else {
        formattedDate = DateTime.fromFormat(`${date.year}/${date.month}/${date.day} ${time.hour}:${time.minute}:${time.second} `, 'y/M/d H:m:s', { zone: fromZone })
        formattedDate = formattedDate.setLocale(toLocale.language).setZone(toLocale.zone)
    }

    switch (toLocale.calendar) {
        case 'Persian':
            break
        case 'Gregorian':
            break
        default:
            throw new Error(`unsupported calendar: ${toLocale.calendar} `)
    }

    return {
        date: {
            year: formattedDate.year,
            month: formattedDate.month,
            day: formattedDate.day,
        },
        time: {
            hour: formattedDate.hour,
            minute: formattedDate.minute,
            second: formattedDate.second,
        }
    }
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
