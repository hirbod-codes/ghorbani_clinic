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

export type ColorVariants = {
    'main': string;
    'dark': string;
    'light': string;
}

export type ThemeOptions = {
    mode: ThemeMode;
    radius: string;
    'scrollbar-width': string;
    'scrollbar-height': string;
    'scrollbar-border-radius': string;
    foregroundCoefficient: number;
    colorCoefficient: number;
    colors: {
        border: ColorVariants
        input: ColorVariants
        scrollbar: ColorVariants
        background: ColorVariants
        foreground: ColorVariants
        primary: ColorVariants
        'primary-foreground': ColorVariants
        'primary-container': ColorVariants
        'primary-container-foreground': ColorVariants
        secondary: ColorVariants
        'secondary-foreground': ColorVariants
        'secondary-container': ColorVariants
        'secondary-container-foreground': ColorVariants
        tertiary: ColorVariants
        'tertiary-foreground': ColorVariants
        'tertiary-container': ColorVariants
        'tertiary-container-foreground': ColorVariants
        info: ColorVariants
        'info-foreground': ColorVariants
        success: ColorVariants
        'success-foreground': ColorVariants
        warning: ColorVariants
        'warning-foreground': ColorVariants
        error: ColorVariants
        'error-foreground': ColorVariants
        'error-container': ColorVariants
        'error-container-foreground': ColorVariants
        muted: ColorVariants
        'muted-foreground': ColorVariants
    }
}

