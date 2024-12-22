import { createContext } from "react";
import type { Calendar, Config, LanguageCodes, ThemeMode, ThemeOptions, TimeZone } from "../../../Electron/Configuration/renderer.d";

export type Configuration = Config & {
    updateThemeMode: (mode?: ThemeMode) => void | Promise<void>,
    updateTheme: (themeOptions?: ThemeOptions) => void | Promise<void>,
    updateLocal: (languageCode?: LanguageCodes, calendar?: Calendar, direction?: 'rtl' | 'ltr', zone?: TimeZone) => void | Promise<void>,
    setShowGradientBackground: (v: boolean) => void | Promise<void>,
    isConfigurationContextReady: boolean,
}

export const ConfigurationContext = createContext<Configuration | undefined>(undefined);
