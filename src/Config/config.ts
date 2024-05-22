import { PaletteMode } from '@mui/material'
import { app, nativeTheme } from 'electron'
import fs from 'fs'
import path from 'path'

export function readConfig() {
    const configFile = path.join(app.getAppPath(), 'src', 'Config', 'config.json')
    let configJson
    fs.readFile(configFile, (err, data) => {
        if (err)
            throw new Error('No config provided.')

        configJson = data
    })

    return JSON.parse(configJson)
}

export async function readThemeMode(): Promise<PaletteMode> {
    const themeModeFile = path.join(app.getAppPath(), 'src', 'Config', 'theme-mode.json')
    const themeModeJson = fs.readFileSync(themeModeFile).toString()

    return JSON.parse(themeModeJson).themeMode ?? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
}