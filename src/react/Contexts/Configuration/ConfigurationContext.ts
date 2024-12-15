import { createContext } from "react";
import { Localization } from "@mui/material/locale";
import { PaletteMode, Theme, ThemeOptions } from "@mui/material";
import type { Calendar, Config, TimeZone } from "../../../Electron/Configuration/renderer.d";

export type ConfigurationSetter = {
    replaceTheme: (theme: ThemeOptions) => void,
    updateTheme: (mode: PaletteMode, direction: 'rtl' | 'ltr', locale: Localization) => void,
    updateLocale: (calendar: Calendar, direction: 'rtl' | 'ltr', reactLocale: Localization) => void,
    updateTimeZone: (zone: TimeZone) => void,
    setShowGradientBackground: (v: boolean) => void
}

export type Configuration = Config & {
    theme: Theme;
} & {
    updateTheme: (mode?: PaletteMode, direction?: 'rtl' | 'ltr', muiLocal?: Localization, themeOptions?: ThemeOptions) => void | Promise<void>,
    updateLocal: (calendar?: Calendar, direction?: 'rtl' | 'ltr', muiLocal?: Localization, zone?: TimeZone) => void | Promise<void>,
    setShowGradientBackground: (v: boolean) => void | Promise<void>,
    isConfigurationContextReady: boolean,
}

export const ConfigurationContext = createContext<Configuration | undefined>(undefined);
