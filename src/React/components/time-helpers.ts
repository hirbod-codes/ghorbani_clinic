import { mod } from './astro'

export const GREGORIAN_MONTHS_FA = [
    'جَنیوئری',
    'فِبریوئری',
    'مارچ',
    'اِیپریل',
    'مِی',
    'جون',
    'جولای',
    'آگِست',
    'سِپتِمبِر',
    'آکتوبِر',
    'نُوِمبِر',
    'دیسِمبِر',
]

export const GREGORIAN_MONTHS_EN = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

export const GREGORIAN_EPOCH = 1721425.5;

/**
 * Is a given year a leap year in the Gregorian calendar ?
 * 
 * @param year 
 */
export function leap_gregorian(year: number): boolean {
    return ((year % 4) == 0) &&
        (!(((year % 100) == 0) && ((year % 400) != 0)));
}

export function getGregorianMonths(isLeapYear: boolean, locale: 'en' | 'fa' = 'en'): { name: string, days: number }[] {
    let keys
    if (locale == 'en')
        keys = GREGORIAN_MONTHS_EN
    else if (locale == 'fa')
        keys = GREGORIAN_MONTHS_FA
    else
        throw new Error('Invalid value provided for locale parameter')

    const values: number[] = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    return keys.map((k, i) => ({ name: k, days: values[i] }))
}

/**
 * Determine Julian day from Gregorian date
 * 
 * @param year 
 * @param month Zero based month index
 * @param day Zero based day index
 * @returns Number of Julian days
 */
export function gregorian_to_jd(year: number, month: number, day: number): number {
    // Zero based
    month++
    day++

    validateGregorianDate(year, month, day)

    return (GREGORIAN_EPOCH - 1) +
        (365 * (year - 1)) +
        Math.floor((year - 1) / 4) +
        (-Math.floor((year - 1) / 100)) +
        Math.floor((year - 1) / 400) +
        Math.floor((((367 * month) - 362) / 12) +
            ((month <= 2) ? 0 :
                (leap_gregorian(year) ? -1 : -2)
            ) +
            day);
}

/**
 * Calculate Gregorian date from Julian day
 * 
 * @param jd Julian days
 * @returns An array of three members, [year, month(zero based), day(zero based)]
 */
export function jd_to_gregorian(jd: number): { year: number, month: number, day: number } {
    let year

    const wjd = Math.floor(jd - 0.5) + 0.5;
    const depoch = wjd - GREGORIAN_EPOCH;
    const quadricent = Math.floor(depoch / 146097);
    const dqc = mod(depoch, 146097);
    const cent = Math.floor(dqc / 36524);
    const dcent = mod(dqc, 36524);
    const quad = Math.floor(dcent / 1461);
    const dquad = mod(dcent, 1461);
    const yindex = Math.floor(dquad / 365);
    year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
    if (!((cent == 4) || (yindex == 4))) {
        year++;
    }
    const yearday = wjd - gregorian_to_jd(year, 1, 1);
    const leapadj = (
        (wjd < gregorian_to_jd(year, 3, 1))
            ? 0
            : (leap_gregorian(year) ? 1 : 2)
    );
    const month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
    const day = (wjd - gregorian_to_jd(year, month, 1)) + 1;

    return { year, month: month, day: day - 1 }
}

export function validateGregorianDate(year: number, month: number, day: number): void {
    if (year < 0 || month < 0 || month > 11 || day < 0 || day >= getGregorianMonths(leap_gregorian(year), 'en')[month].days)
        throw new Error('Invalid Gregorian date provided')
}

export const PERSIAN_MONTHS_FA = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
]

export const PERSIAN_MONTHS_EN = [
    'Farvardin',
    'Ordibehesht',
    'Khordad',
    'Tir',
    'Mordad',
    'Shahrivar',
    'Mehr',
    'Aban',
    'Azar',
    'Dey',
    'Bahman',
    'Esfand',
]

export const PERSIAN_EPOCH = 1948320.5;

/**
 * Is a given year a leap year in the Persian calendar ?
 * 
 * @param year 
 */
export function leap_persian(year: number): boolean {
    return ((((((year - ((year > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
}

export function getPersianMonths(isLeapYear: boolean, locale: 'en' | 'fa' = 'en'): { name: string, days: number }[] {
    let keys
    if (locale == 'en')
        keys = PERSIAN_MONTHS_EN
    else if (locale == 'fa')
        keys = PERSIAN_MONTHS_FA
    else
        throw new Error('Invalid value provided for locale parameter')

    const values: number[] = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isLeapYear ? 30 : 29]

    return keys.map((k, i) => ({ name: k, days: values[i] }))
}

/**
 * Determine Julian day from Persian date
 * 
 * @param year 
 * @param month Zero based month index
 * @param day Zero based day index
 * @returns Number of Julian days
 */
export function persian_to_jd(year: number, month: number, day: number): number {
    // Zero based
    month++
    day++

    validatePersianDate(year, month, day)

    const epbase = year - ((year >= 0) ? 474 : 473);
    const epyear = 474 + mod(epbase, 2820);

    return day +
        ((month <= 7) ?
            ((month - 1) * 31) :
            (((month - 1) * 30) + 6)
        ) +
        Math.floor(((epyear * 682) - 110) / 2816) +
        (epyear - 1) * 365 +
        Math.floor(epbase / 2820) * 1029983 +
        (PERSIAN_EPOCH - 1);
}

/**
 * Calculate Persian date from Julian day
 * 
 * @param jd Julian days
 * @returns Calculated Persian date (with zero base indexed month and day)
 */
export function jd_to_persian(jd: number): { year: number, month: number, day: number } {
    let year, ycycle, aux1, aux2

    jd = Math.floor(jd) + 0.5;

    const depoch = jd - persian_to_jd(475, 1, 1);
    const cycle = Math.floor(depoch / 1029983);
    const cyear = mod(depoch, 1029983);
    if (cyear == 1029982) {
        ycycle = 2820;
    } else {
        aux1 = Math.floor(cyear / 366);
        aux2 = mod(cyear, 366);
        ycycle = Math.floor(((2134 * aux1) + (2816 * aux2) + 2815) / 1028522) +
            aux1 + 1;
    }
    year = ycycle + (2820 * cycle) + 474;
    if (year <= 0) {
        year--;
    }

    const yday = (jd - persian_to_jd(year, 1, 1)) + 1;
    const month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
    const day = (jd - persian_to_jd(year, month, 1)) + 1;

    return { year, month: month, day: day - 1 }
}

export function validatePersianDate(year: number, month: number, day: number): void {
    if (year < 0 || month < 0 || month > 11 || day < 0 || day >= getPersianMonths(leap_persian(year), 'en')[month].days)
        throw new Error('Invalid Persian date provided')
}
