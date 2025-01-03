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
    main: string
    light: {
        main: string
        foreground: string
        container: string
        'container-foreground': string
        fixed: string
        'fixed-dim': string
        'fixed-foreground': string
        'fixed-foreground-variant': string
    }
    'light-shades': {
        main: number
        foreground: number
        container: number
        'container-foreground': number
        fixed: number
        'fixed-dim': number
        'fixed-foreground': number
        'fixed-foreground-variant': number
    }
    dark: {
        main: string
        foreground: string
        container: string
        'container-foreground': string
        fixed: string
        'fixed-dim': string
        'fixed-foreground': string
        'fixed-foreground-variant': string
    }
    'dark-shades': {
        main: number
        foreground: number
        container: number
        'container-foreground': number
        fixed: number
        'fixed-dim': number
        'fixed-foreground': number
        'fixed-foreground-variant': number
    }
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
        scrollbar: string
        palette: {
            primary: ColorVariants
            secondary: ColorVariants
            tertiary: ColorVariants
            info: ColorVariants
            success: ColorVariants
            warning: ColorVariants
            error: ColorVariants
        }
        surface: {
            light: {
                main: string
                dim: string
                bright: string
                'container-highest': string
                'container-high': string
                'container': string
                'container-low': string
                'container-lowest': string
                foreground: string
                'foreground-variant': string
                inverse: string
                'inverse-foreground': string
                'inverse-primary-foreground': string
            }
            'light-shades': {
                main: number
                dim: number
                bright: number
                'container-highest': number
                'container-high': number
                'container': number
                'container-low': number
                'container-lowest': number
                foreground: number
                'foreground-variant': number
                inverse: number
                'inverse-foreground': number
                'inverse-primary-foreground': number
            }
            dark: {
                main: string
                dim: string
                bright: string
                'container-highest': string
                'container-high': string
                'container': string
                'container-low': string
                'container-lowest': string
                foreground: string
                'foreground-variant': string
                inverse: string
                'inverse-foreground': string
                'inverse-primary-foreground': string
            }
            'dark-shades': {
                main: number
                dim: number
                bright: number
                'container-highest': number
                'container-high': number
                'container': number
                'container-low': number
                'container-lowest': number
                foreground: number
                'foreground-variant': number
                inverse: number
                'inverse-foreground': number
                'inverse-primary-foreground': number
            }
        }
        outline: {
            light: {
                main: string
                variant: string
            }
            'light-shades': {
                main: number
                variant: number
            }
            dark: {
                main: string
                variant: string
            }
            'dark-shades': {
                main: number
                variant: number
            }
        }
    }
}

