import { app, ipcRenderer } from "electron";
import { seed } from "./seed-patients";
import { PatientRepository, handleRendererEvents as handlePatientRendererEvents } from "./PatientRepository";
import { VisitRepository, handleRendererEvents as handleVisitRendererEvents } from "./VisitRepository";
import { FileRepository, handleRendererEvents as handleFileRendererEvents } from "./FileRepository";
import { MongoDB } from "./mongodb";
import { MongodbConfig } from "../../Config/config";

export async function handleDbEvents() {
    const db = new MongoDB();
    const patientRepository = new PatientRepository();
    const visitRepository = new VisitRepository();
    const fileRepository = new FileRepository()

    await db.initializeDb();

    await db.handleEvents()
    await patientRepository.handleEvents()
    await visitRepository.handleEvents()
    await fileRepository.handleEvents()

    if (!app.isPackaged)
        await seed(50, await db.getPatientsCollection(), await db.getVisitsCollection());
}

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
                return await ipcRenderer.invoke('get-config')
            },
            updateConfig: async (config: MongodbConfig): Promise<boolean> => {
                return await ipcRenderer.invoke('update-config', { config })
            },
        },
        ...PatientRepository.handleRendererEvents(),
        ...VisitRepository.handleRendererEvents(),
        ...FileRepository.handleRendererEvents(),
    }
}