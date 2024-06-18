import { ipcRenderer } from "electron";
import { handleRendererEvents as handlePatientRendererEvents } from './Repositories/Patients/PatientRenderer';
import { handleRendererEvents as handleVisitRendererEvents } from './Repositories/Visits/VisitRenderer';
import { handleRendererEvents as handleFileRendererEvents } from './Repositories/Files/FileRenderer';
import { MongodbConfig } from "../Configuration/types";

export type RendererDbAPI = handlePatientRendererEvents &
    handleVisitRendererEvents &
    handleFileRendererEvents &
{
    getConfig: () => Promise<MongodbConfig>,
    updateConfig: (config: MongodbConfig) => Promise<boolean>,
}

export function handleDbRendererEvents(): RendererDbAPI {
    return {
        ...{
            getConfig: async (): Promise<MongodbConfig> => {
                return await ipcRenderer.invoke('get-config');
            },
            updateConfig: async (config: MongodbConfig): Promise<boolean> => {
                return await ipcRenderer.invoke('update-config', { config });
            },
        },
        ...handlePatientRendererEvents(),
        ...handleVisitRendererEvents(),
        ...handleFileRendererEvents(),
    };
}
