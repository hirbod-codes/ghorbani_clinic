import { ipcRenderer } from "electron";
import { handleRendererEvents as handleUserRendererEvents } from './Repositories/Users/UsersRenderer';
import { handleRendererEvents as handlePrivilegeRendererEvents } from './Repositories/Privileges/PrivilegesRenderer';
import { handleRendererEvents as handlePatientRendererEvents } from './Repositories/Patients/PatientRenderer';
import { handleRendererEvents as handleVisitRendererEvents } from './Repositories/Visits/VisitRenderer';
import { handleRendererEvents as handleFileRendererEvents } from './Repositories/Files/FileRenderer';
import { MongodbConfig } from "../Configuration/types";

export type RendererDbAPI = handlePatientRendererEvents &
    handleVisitRendererEvents &
    handleFileRendererEvents &
{
    initializeDb: (config: MongodbConfig) => Promise<boolean>,
    getConfig: () => Promise<MongodbConfig>,
    updateConfig: (config: MongodbConfig) => Promise<boolean>,
}

export function handleDbRendererEvents(): RendererDbAPI {
    return {
        initializeDb: async (config: MongodbConfig): Promise<boolean> => await ipcRenderer.invoke('initialize-db', { config }),
        ...{
            getConfig: async (): Promise<MongodbConfig> => {
                return await ipcRenderer.invoke('get-config');
            },
            updateConfig: async (config: MongodbConfig): Promise<boolean> => {
                return await ipcRenderer.invoke('update-config', { config });
            },
        },
        ...handleUserRendererEvents(),
        ...handlePrivilegeRendererEvents(),
        ...handlePatientRendererEvents(),
        ...handleVisitRendererEvents(),
        ...handleFileRendererEvents(),
    };
}
