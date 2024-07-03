import { app } from "electron";
import { PatientRepository } from "./Repositories/Patients/PatientRepository";
import { VisitRepository } from "./Repositories/Visits/VisitRepository";
import { FileRepository } from "./Repositories/Files/FileRepository";
import { MongoDB } from "./mongodb";
import { seedPatientsVisits, seedUsersRoles } from "./seed";
import { UsersRepository } from "./Repositories/Users/UsersRepository";
import { PrivilegesRepository } from "./Repositories/Privileges/PrivilegesRepository";
import { readConfig, writeConfigSync } from "../Configuration/configuration";
import { AuthRepository } from "./Repositories/Auth/AuthRepository";

export const db = new MongoDB();
export const authRepository = new AuthRepository();
export const usersRepository = new UsersRepository();
export const privilegesRepository = new PrivilegesRepository();
export const patientRepository = new PatientRepository();
export const visitRepository = new VisitRepository();
export const fileRepository = new FileRepository()

export async function handleDbEvents() {
    if (!app.isPackaged) {
        const c = readConfig()
        writeConfigSync({
            ...c,
            mongodb: {
                supportsTransaction: false,
                url: "mongodb://localhost:8082",
                databaseName: "primaryDB",
                auth: {
                    username: "admin",
                    password: "password"
                }
            }
        })
    }

    try { await db.initializeDb() }
    catch (err) { console.error(err) }

    await db.handleEvents()
    await authRepository.handleEvents()
    await usersRepository.handleEvents()
    await privilegesRepository.handleEvents()
    await patientRepository.handleEvents()
    await visitRepository.handleEvents()
    await fileRepository.handleEvents()

    if (app.isPackaged)
        return

    await seedUsersRoles(await db.getUsersCollection(), await db.getPrivilegesCollection())
    await seedPatientsVisits(50, await db.getPatientsCollection(), await db.getVisitsCollection());
}
