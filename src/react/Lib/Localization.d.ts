import type { TimeZone, Calendar } from "./DateTime";
import type { TFunction, i18n } from 'i18next';
import type { Localization, enUS, faIR } from "@mui/material/locale";

export type Languages = 'en' | 'fa'

export type Direction = 'ltr' | 'rtl'

export type Local = {
    zone: TimeZone,
    calendar: Calendar,
    code: Languages,
    direction: Direction,
}
