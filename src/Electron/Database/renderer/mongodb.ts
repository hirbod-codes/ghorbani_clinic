import { ipcRenderer } from "electron";
import { MongodbConfig } from "../../../Config/config";

export async function getConfig(): Promise<MongodbConfig> {
    return await ipcRenderer.invoke('get-config')
}

export async function updateConfig(config: MongodbConfig): Promise<boolean> {
    return await ipcRenderer.invoke('update-config', { config })
}
