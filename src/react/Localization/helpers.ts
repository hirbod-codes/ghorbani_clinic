import { LanguageCodes } from "@/src/Electron/Configuration/renderer.d";
import { getLuxonLocale } from "../Lib/localization";
import { i18n } from "i18next";

export function localizeNumbers(language: LanguageCodes | i18n, number: number | string, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(getLuxonLocale(language as any), options).format(Number(number))
}
