import { createContext } from "react";
import { Localization } from "@mui/material/locale";
import { PaletteMode, Theme } from "@mui/material";
import { Calendar, TimeZone } from "../Lib/DateTime";
import { Locale } from "../Lib/Localization";

export type ConfigurationStorableData = {
    locale: Locale,
    themeMode: PaletteMode
}

export type ConfigurationData = ConfigurationStorableData & { theme: Theme }

export type ConfigurationSetter = {
    updateTheme: (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => void,
    updateLocale: (calendar: Calendar, direction: 'rtl' | 'ltr', reactLocale: Localization) => void,
    updateTimeZone: (zone: TimeZone) => void,
}

export type Configuration = {
    get: ConfigurationData,
    set: ConfigurationSetter,
    hasFetchedConfig?: boolean,
    showDbConfigurationModal?: boolean,
}

export const ConfigurationContext = createContext<Configuration | undefined>(undefined);
