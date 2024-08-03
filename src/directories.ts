import { app } from "electron"
import path from "path"

export const APP_DIRECTORY = path.join(app.getPath('appData'), app.getName())

export const CONFIGURATION_DIRECTORY = path.join(APP_DIRECTORY, 'Configuration')

export const TMP_DIRECTORY = path.join(APP_DIRECTORY, 'tmp')
export const DOWNLOADS_DIRECTORY = path.join(TMP_DIRECTORY, 'downloads')
