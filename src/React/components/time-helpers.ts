import { GregorianDate, gregorian_to_jd, jd_to_gregorian } from "./gregorian-calendar"
import { PersianDate, jd_to_persian, persian_to_jd } from "./persian-calendar"

/**
 * Convert Persian date to Gregorian date
 * @param date one based month and day
 */
export function persionToGregorian(date: PersianDate): GregorianDate {
    return jd_to_gregorian(persian_to_jd(date))
}

/**
 * Convert Gregorian date to Persian date
 * @param date one based month and day
 */
export function gregorianToPersion(date: GregorianDate): PersianDate {
    return jd_to_persian(gregorian_to_jd(date))
}
