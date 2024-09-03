import { ipcRenderer } from "electron";
import { type RendererEvents as AuthRendererEvents, handleRendererEvents as handleAuthRendererEvents } from './Repositories/Auth/AuthRenderer';
import { type RendererEvents as UserRendererEvents, handleRendererEvents as handleUserRendererEvents } from './Repositories/Users/UsersRenderer';
import { type RendererEvents as PrivilegeRendererEvents, handleRendererEvents as handlePrivilegeRendererEvents } from './Repositories/Privileges/PrivilegesRenderer';
import { type RendererEvents as PatientRendererEvents, handleRendererEvents as handlePatientRendererEvents } from './Repositories/Patients/PatientRenderer';
import { type RendererEvents as MedicalHistoryRendererEvents, handleRendererEvents as handleMedicalHistoryRendererEvents } from './Repositories/MedicalHistories/MedicalHistoryRenderer';
import { type RendererEvents as VisitRendererEvents, handleRendererEvents as handleVisitRendererEvents } from './Repositories/Visits/VisitRenderer';
import { type RendererEvents as FileRendererEvents, handleRendererEvents as handleFileRendererEvents } from './Repositories/PatientsDocuments/PatientsDocumentsRenderer';
import { type RendererEvents as CanvasRendererEvents, handleRendererEvents as handleCanvasRendererEvents } from './Repositories/canvas/CanvasRenderer';
import { MongodbConfig } from "../Configuration/main";

export type RendererDbAPI =
    AuthRendererEvents &
    UserRendererEvents &
    PrivilegeRendererEvents &
    PatientRendererEvents &
    MedicalHistoryRendererEvents &
    VisitRendererEvents &
    FileRendererEvents &
    CanvasRendererEvents &
    {
        truncate: () => Promise<boolean>,
        seed: () => Promise<boolean>,
        initializeDb: () => Promise<boolean>,
        getConfig: () => Promise<MongodbConfig>,
        updateConfig: (config: MongodbConfig) => Promise<boolean>,
        searchForDbService: (databaseName?: string, supportsTransaction?: boolean, auth?: { username: string, password: string }) => Promise<boolean>;
    }

export function handleDbRendererEvents(): RendererDbAPI {
    return {
        ...{
            truncate: async (): Promise<boolean> => await ipcRenderer.invoke('truncate'),
            seed: async (): Promise<boolean> => await ipcRenderer.invoke('seed'),
            initializeDb: async (): Promise<boolean> => await ipcRenderer.invoke('initialize-db'),
            getConfig: async (): Promise<MongodbConfig> => {
                return await ipcRenderer.invoke('get-config');
            },
            updateConfig: async (config: MongodbConfig): Promise<boolean> => {
                return await ipcRenderer.invoke('update-config', { config });
            },
            searchForDbService: async (databaseName?: string, supportsTransaction?: boolean, auth?: { username: string, password: string }): Promise<boolean> => {
                return await ipcRenderer.invoke('search-for-db-service', { databaseName, supportsTransaction, auth });
            },
        },
        ...handleAuthRendererEvents(),
        ...handleUserRendererEvents(),
        ...handlePrivilegeRendererEvents(),
        ...handlePatientRendererEvents(),
        ...handleMedicalHistoryRendererEvents(),
        ...handleVisitRendererEvents(),
        ...handleFileRendererEvents(),
        ...handleCanvasRendererEvents(),
    };
}
