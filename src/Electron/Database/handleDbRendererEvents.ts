import { ipcRenderer } from "electron";
import { RendererEvents as AuthRendererEvents, handleRendererEvents as handleAuthRendererEvents } from './Repositories/Auth/AuthRenderer';
import { RendererEvents as UserRendererEvents, handleRendererEvents as handleUserRendererEvents } from './Repositories/Users/UsersRenderer';
import { RendererEvents as PrivilegeRendererEvents, handleRendererEvents as handlePrivilegeRendererEvents } from './Repositories/Privileges/PrivilegesRenderer';
import { RendererEvents as PatientRendererEvents, handleRendererEvents as handlePatientRendererEvents } from './Repositories/Patients/PatientRenderer';
import { RendererEvents as VisitRendererEvents, handleRendererEvents as handleVisitRendererEvents } from './Repositories/Visits/VisitRenderer';
import { RendererEvents as FileRendererEvents, handleRendererEvents as handleFileRendererEvents } from './Repositories/Files/FileRenderer';
import { MongodbConfig } from "../Configuration/types";

export type RendererDbAPI =
    AuthRendererEvents &
    UserRendererEvents &
    PrivilegeRendererEvents &
    PatientRendererEvents &
    VisitRendererEvents &
    FileRendererEvents &
    {
        initializeDb: (config: MongodbConfig) => Promise<boolean>,
        getConfig: () => Promise<MongodbConfig>,
        updateConfig: (config: MongodbConfig) => Promise<boolean>,
    }

export function handleDbRendererEvents(): RendererDbAPI {
    return {
        ...{
            initializeDb: async (config: MongodbConfig): Promise<boolean> => await ipcRenderer.invoke('initialize-db', { config }),
            getConfig: async (): Promise<MongodbConfig> => {
                return await ipcRenderer.invoke('get-config');
            },
            updateConfig: async (config: MongodbConfig): Promise<boolean> => {
                return await ipcRenderer.invoke('update-config', { config });
            },
        },
        ...handleAuthRendererEvents(),
        ...handleUserRendererEvents(),
        ...handlePrivilegeRendererEvents(),
        ...handlePatientRendererEvents(),
        ...handleVisitRendererEvents(),
        ...handleFileRendererEvents(),
    };
}
