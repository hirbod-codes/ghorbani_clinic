import { PatientRepository } from "./Repositories/Patients/PatientRepository";
import { MedicalHistoryRepository } from "./Repositories/MedicalHistories/MedicalHistoryRepository";
import { VisitRepository } from "./Repositories/Visits/VisitRepository";
import { PatientsDocumentsRepository } from "./Repositories/PatientsDocuments/PatientsDocumentsRepository";
import { MongoDB } from "./mongodb";
import { UsersRepository } from "./Repositories/Users/UsersRepository";
import { PrivilegesRepository } from "./Repositories/Privileges/PrivilegesRepository";
import { AuthRepository } from "./Repositories/Auth/AuthRepository";
import { CanvasRepository } from "./Repositories/canvas/CanvasRepository";

export const db = new MongoDB();
export const authRepository = new AuthRepository();
export const usersRepository = new UsersRepository();
export const privilegesRepository = new PrivilegesRepository();
export const patientRepository = new PatientRepository();
export const medicalHistoryRepository = new MedicalHistoryRepository();
export const visitRepository = new VisitRepository();
export const fileRepository = new PatientsDocumentsRepository()
export const canvasRepository = new CanvasRepository()

export async function handleDbEvents() {
    await db.handleEvents()
    await authRepository.handleEvents()
    await usersRepository.handleEvents()
    await privilegesRepository.handleEvents()
    await patientRepository.handleEvents()
    await medicalHistoryRepository.handleEvents()
    await visitRepository.handleEvents()
    await fileRepository.handleEvents()
    await canvasRepository.handleEvents()
}
