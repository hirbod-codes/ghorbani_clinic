import { createContext } from "react";
import { Calendar, Locale, TimeZone } from "./components/Localization/types";
import { Localization } from "@mui/material/locale";
import { PaletteMode, Theme } from "@mui/material";

export type Configuration = {
    get: {
        locale: Locale,
        theme: Theme
    },
    set: {
        updateTheme: (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => void,
        updateLocale: (calendar: Calendar, direction: 'rtl' | 'ltr', reactLocale: Localization) => void,
        updateTimeZone: (zone: TimeZone) => void,
    }
}

export const ConfigurationContext = createContext<Configuration>(undefined);

