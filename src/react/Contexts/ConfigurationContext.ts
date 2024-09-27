import { createContext } from "react";
import { Localization } from "@mui/material/locale";
import { PaletteMode, Theme, ThemeOptions } from "@mui/material";
import { Calendar, TimeZone } from "../Lib/DateTime";
import { Locale } from "../Lib/Localization";

export type ConfigurationStorableData = {
    locale: Locale,
    themeOptions: ThemeOptions,
    canvas?: {
        backgroundColor: string
    },
    showGradientBackground?: boolean,
}

export type ConfigurationData = ConfigurationStorableData & { theme: Theme }

export type ConfigurationSetter = {
    replaceTheme: (theme: ThemeOptions) => void,
    updateTheme: (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => void,
    updateLocale: (calendar: Calendar, direction: 'rtl' | 'ltr', reactLocale: Localization) => void,
    updateTimeZone: (zone: TimeZone) => void,
    setShowGradientBackground: (v: boolean) => void
}

export type Configuration = {
    get: ConfigurationData,
    set: ConfigurationSetter,
    hasFetchedConfig?: boolean,
    showDbConfigurationModal?: boolean,
}

export const ConfigurationContext = createContext<Configuration | undefined>(undefined);
