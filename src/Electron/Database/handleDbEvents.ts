import { app } from "electron";
import { seed } from "./seed-patients";
import { VisitRepository } from "./VisitRepository";
import { PatientRepository } from "./PatientRepository";
import { MongoDB } from "./mongodb";
import { FileRepository } from "./FileRepository";

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

export function handleDbRendererEvents() {
    return {
        ...MongoDB.handleRendererEvents(),
        ...PatientRepository.handleRendererEvents(),
        ...VisitRepository.handleRendererEvents(),
        ...FileRepository.handleRendererEvents(),
    }
}