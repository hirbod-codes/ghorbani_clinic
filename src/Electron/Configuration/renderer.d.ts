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
    foregroundCoefficient: number;
    colorCoefficient: number;
    colors: {
        border: {
            'main': string;
            'dark': string;
            'light': string;
        };

        input: {
            'main': string;
            'dark': string;
            'light': string;
        };

        'scrollbar': {
            'main': string;
            'dark': string;
            'light': string;
        };

        'background': {
            'main': string;
            'dark': string;
            'light': string;
        };

        'foreground': {
            'main': string;
            'dark': string;
            'light': string;
        };

        'primary': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'primary-container': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'secondary': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'secondary-container': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'tertiary': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'info': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'success': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'warning': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'error': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };

        'muted': {
            'main': string;
            'dark': string;
            'light': string;
            'dark-foreground': string;
            'light-foreground': string;
        };
    }
}

