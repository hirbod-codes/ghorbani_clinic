import { app } from "electron";
import { seed } from "./seed-patients";
import { PatientRepository } from "./Repositories/PatientRepository";
import { VisitRepository } from "./Repositories/VisitRepository";
import { FileRepository } from "./Repositories/FileRepository";
import { MongoDB } from "./mongodb";

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
