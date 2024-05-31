import { TFunction, i18n } from 'i18next';
import { Localization, enUS, faIR } from "@mui/material/locale";
import { Direction } from '@mui/material';

export type TimeZone = 'UTC' | 'Asia/Tehran'
export type Calendar = 'Persian' | 'Gregorian'

export function getLocale(locale: Localization): string {
    switch (locale) {
        case enUS:
            return 'en'
        case faIR:
            return 'fa'
        default:
            throw new Error('unknown language encountered.')
    }
}

export function getReactLocale(i18n: i18n): Localization {
    switch (i18n.language) {
        case 'en':
            return enUS
        case 'fa':
            return faIR
        default:
            throw new Error('unknown language encountered.')
    }
}

export type Locale = {
    zone: TimeZone,
    calendar: Calendar,
    reactLocale: Localization,
    direction: Direction,
    i18n: i18n,
    t: TFunction<"translation", undefined>,
    getLocale: (locale: Localization) => string,
    getReactLocale: (i18n: i18n) => Localization,
}