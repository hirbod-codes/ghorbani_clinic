export type Time = {
    hour: number,
    minute: number,
    second: number,
}

export type Duration = Time

export type Date = {
    year: number,
    month: number,
    day: number,
}

export type GregorianDate = Date

export type PersianDate = Date

export type TimeZone = 'UTC' | 'Asia/Tehran'

export type Calendar = 'Persian' | 'Gregorian'
