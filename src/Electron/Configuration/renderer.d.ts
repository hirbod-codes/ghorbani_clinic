import { ColumnPinningState, VisibilityState } from '@tanstack/react-table'
import { Density } from '../../react/Components/DataGrid/Context'
import { MongodbConfig } from './main.d'

export type configAPI = {
    readDbConfig: () => Promise<MongodbConfig | undefined>,
    readConfig: () => Promise<Config | undefined>,
    writeConfig: (config: Config) => void
}

export type TimeZone = 'UTC' | 'Asia/Tehran'

export type Calendar = 'Persian' | 'Gregorian'

export type LanguageCodes = 'en' | 'fa'

export type Direction = 'ltr' | 'rtl'

export type Local = {
    zone: TimeZone,
    calendar: Calendar,
    language: LanguageCodes,
    direction: Direction,
}

export type Config = {
    local: Local,
    themeOptions: ThemeOptions,
    downloadsDirectorySize?: number,
    canvas?: {
        backgroundColor: string
    },
    showGradientBackground?: boolean,
    columnPinningModels?: { [k: string]: ColumnPinningState },
    columnVisibilityModels?: { [k: string]: VisibilityState },
    columnOrderModels?: { [k: string]: string[] },
    tableDensity?: { [k: string]: Density }
}

export type ThemeMode = 'light' | 'dark'

export type ThemeOptions = {
    mode: ThemeMode;
    radius: string;
    'scrollbar-width': string;
    'scrollbar-height': string;
    'scrollbar-border-radius': string;
    colors: {
        black: string;
        white: string;
        border: string;
        input: string;
        ring: string;
        background: string;
        foreground: string;
        darkBackground: string;
        darkForeground: string;
        lightBackground: string;
        lightForeground: string;
        primary: string;
        "primary-foreground": string;
        secondary: string;
        "secondary-foreground": string;
        destructive: string;
        "destructive-foreground": string;
        muted: string;
        "muted-foreground": string;
        accent: string;
        "accent-foreground": string;
        popover: string;
        "popover-foreground": string;
        card: string;
        "card-foreground": string;
        'scrollbar-background': string;
    }
}

