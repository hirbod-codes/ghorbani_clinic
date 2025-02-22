import { createContext } from "react";
import type { Calendar, Config, LanguageCodes, ThemeMode, ThemeOptions, TimeZone } from "../../../Electron/Configuration/renderer.d";

export type Configuration = Config & {
    updateTheme: (mode?: ThemeMode, themeOptions?: ThemeOptions) => void | Promise<void>,
    updateLocal: (languageCode?: LanguageCodes, calendar?: Calendar, direction?: 'rtl' | 'ltr', zone?: TimeZone) => void | Promise<void>,
    setShowGradientBackground: (v: boolean) => void | Promise<void>,
    isConfigurationContextReady: boolean,
}

export const ConfigurationContext = createContext<Configuration | undefined>(undefined);
