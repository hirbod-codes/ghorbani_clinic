import { Localization, enUS, faIR } from "@mui/material/locale"
import { string } from "yup"
import { i18n } from 'i18next';
import { LanguageCodes } from "../../Electron/Configuration/renderer.d";

export function getLanguageCode(muiLocal: Localization): LanguageCodes {
    switch (muiLocal) {
        case enUS:
            return 'en'
        case faIR:
            return 'fa'
        default:
            throw new Error('Unknown language encountered.')
    }
}

export function getMuiLocale(languageCode: LanguageCodes): Localization
export function getMuiLocale(i18n: i18n): Localization
export function getMuiLocale(arg: LanguageCodes | i18n): Localization {
    let language
    if (string().required().min(1).isValidSync(arg))
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

export function getLuxonLocale(code: LanguageCodes): string
export function getLuxonLocale(i18n: i18n): string
export function getLuxonLocale(arg: i18n | LanguageCodes): string {
    if (!string().required().isValidSync(arg))
        arg = (arg as i18n).language as LanguageCodes;

    switch (arg) {
        case 'en':
            return 'en-US'
        case 'fa':
            return 'fa-IR'
        default:
            throw new Error('Unknown language encountered')
    }
}
