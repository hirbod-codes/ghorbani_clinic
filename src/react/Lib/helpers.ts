import { Localization, enUS, faIR } from "@mui/material/locale"
import { string } from "yup"
import { i18n } from 'i18next';
import { Languages } from "./Localization";

export function getLocale(locale: Localization): Languages {
    switch (locale) {
        case enUS:
            return 'en'
        case faIR:
            return 'fa'
        default:
            throw new Error('Unknown language encountered.')
    }
}

export function getReactLocale(code: Languages): Localization
export function getReactLocale(i18n: i18n): Localization
export function getReactLocale(arg: Languages | i18n): Localization {
    let language
    if (string().required().min(2).isValidSync(arg))
        language = arg
    else
        language = arg.language

    switch (language) {
        case 'en':
            return enUS
        case 'fa':
            return faIR
        default:
            throw new Error('Unknown language encountered: ' + arg.toString())
    }
}

export function getLuxonLocale(code: Languages): string
export function getLuxonLocale(i18n: i18n): string
export function getLuxonLocale(arg: i18n | Languages): string {
    switch (arg) {
        case 'en':
            return 'en-US'
        case 'fa':
            return 'fa-IR'
        default:
            throw new Error('Unknown language encountered: ' + arg.toString())
    }
}
