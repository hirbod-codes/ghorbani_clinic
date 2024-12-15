import { Localization, enUS, faIR } from "@mui/material/locale"
import { mixed, string } from "yup"
import { i18n } from 'i18next';
import type { LanguageCodes } from "../../Electron/Configuration/renderer.d";
import { a } from "react-spring";

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

interface I { n: number; }
class A implements I { n: number; }
class B { }

export function getLuxonLocale(code: LanguageCodes): string
export function getLuxonLocale(i18n: i18n): string
export function getLuxonLocale(arg: i18n | LanguageCodes): string {
    let t = new A(), tt = new B()
    console.log(
        { arg },
        {
            js: {
                At: t instanceof A,
                Att: tt instanceof A,
                // It: t instanceof I,
                // Itt: tt instanceof I,
                Bt: t instanceof B,
                Btt: tt instanceof B,
            },
            yup: {
                At: mixed<A>().required().isValidSync(t),
                Att: mixed<A>().required().isValidSync(tt),
                It: mixed<I>().required().isValidSync(t),
                Itt: mixed<I>().required().isValidSync(tt),
                Bt: mixed<B>().required().isValidSync(t),
                Btt: mixed<B>().required().isValidSync(tt),
            }
        }
    )

    // if (mixed<i18n>().required().isValidSync(arg))
    //     arg = (arg as i18n).language as LanguageCodes;

    console.log({ arg })
    switch (arg) {
        case 'en':
            return 'en-US'
        case 'fa':
            return 'fa-IR'
        default:
            throw new Error('Unknown language encountered')
    }
}
