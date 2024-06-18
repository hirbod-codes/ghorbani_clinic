import { app } from "electron";
import { PatientRepository } from "./Repositories/Patients/PatientRepository";
import { VisitRepository } from "./Repositories/Visits/VisitRepository";
import { FileRepository } from "./Repositories/Files/FileRepository";
import { MongoDB } from "./mongodb";
import { seedPatientsVisits, seedUsersRoles } from "./seed";
import { UsersRepository } from "./Repositories/Users/UsersRepository";
import { PrivilegesRepository } from "./Repositories/Privileges/PrivilegesRepository";

export const db = new MongoDB();
export const usersRepository = new UsersRepository();
export const privilegesRepository = new PrivilegesRepository();
export const patientRepository = new PatientRepository();
export const visitRepository = new VisitRepository();
export const fileRepository = new FileRepository()

export async function handleDbEvents() {
    await db.initializeDb();

    await db.handleEvents()
    await patientRepository.handleEvents()
    await visitRepository.handleEvents()
    await fileRepository.handleEvents()

    if (!app.isPackaged) {
        await seedUsersRoles(await db.getUsersCollection(), await db.getPatientsCollection())
        await seedPatientsVisits(50, await db.getPatientsCollection(), await db.getVisitsCollection());
    }
}
