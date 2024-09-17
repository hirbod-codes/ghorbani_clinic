import { Collection, ObjectId } from "mongodb";
import { Patient, patientSchema } from "../Models/Patient";
import { Visit, visitSchema } from "../Models/Visit";
import { faker } from '@faker-js/faker'
import { DateTime } from "luxon";
import { User } from "../Models/User";
import { Privilege } from "../Models/Privilege";
import { privileges } from "../Repositories/Auth/dev-permissions";
import { users } from "../Repositories/Auth/dev-users";
import { MedicalHistory, medicalHistorySchema } from "../Models/MedicalHistory";
import { readConfig } from "../../../Electron/Configuration/main";
import { ipcMain } from "electron";
import { db } from "../main";

export async function seedMedicalHistories(medicalHistoriesCollection: Collection<MedicalHistory>): Promise<void> {
    try {
        await medicalHistoriesCollection.deleteMany()

        const medicalHistoriesCount = faker.number.int({ min: 20, max: 60 })

        for (let i = 0; i < medicalHistoriesCount; i++) {
            let tryCount = 0
            while (tryCount < 3)
                try {
                    const medicalHistoryCreatedAt = DateTime.fromISO(faker.date.between({ from: '2019-01-01T00:00:00.000Z', to: '2024-01-01T00:00:00.000Z' }).toISOString())

                    let medicalHistory: MedicalHistory = {
                        schemaVersion: 'v0.0.1',
                        name: faker.string.alpha({ length: { min: 10, max: 50 } }),
                        updatedAt: medicalHistoryCreatedAt.toUnixInteger(),
                        createdAt: medicalHistoryCreatedAt.toUnixInteger(),
                    }

                    if (!medicalHistorySchema.isValidSync(medicalHistory))
                        throw new Error('seeder failed to create a medicalHistory document.')

                    medicalHistory = medicalHistorySchema.cast(medicalHistory);

                    (await medicalHistoriesCollection.insertOne(medicalHistory)).insertedId.toString()

                    break
                } catch (error) {
                    tryCount++
                    console.error('error', error)
                    console.log('i', i)
                    if (tryCount >= 3) {
                        console.log('The retry limit exceeded, terminating...')
                        return
                    }
                }
        }
    }
    catch (err) {
        console.error(err)
        console.error(new Error('Failure while trying to seed Medical histories'))
    }
}

export async function seedUsersRoles(usersCollection: Collection<User>, privilegesCollection: Collection<Privilege>): Promise<void> {
    try {
        await usersCollection.deleteMany()
        await privilegesCollection.deleteMany()

        let result = await privilegesCollection.insertMany(privileges)

        if (!result.acknowledged || result.insertedCount !== privileges.length)
            throw new Error('Failure while trying to seed privileges')

        result = await usersCollection.insertMany(users)

        if (!result.acknowledged || result.insertedCount !== users.length)
            throw new Error('Failure while trying to seed users')
    }
    catch (err) {
        console.error(err)
        console.error(new Error('Failure while trying to seed users and privileges'))
    }
}

export async function seedPatientsVisits(patientCount: number, patientsCollection: Collection<Patient>, visitsCollection: Collection<Visit>): Promise<void> {
    try {
        await patientsCollection.deleteMany()
        await visitsCollection.deleteMany()

        for (let i = 0; i < patientCount; i++) {
            let tryCount = 0
            while (tryCount < 3)
                try {
                    const patientCreatedAt = DateTime.fromISO(faker.date.between({ from: '2019-01-01T00:00:00.000Z', to: '2024-01-01T00:00:00.000Z' }).toISOString())
                    const gender = faker.datatype.boolean(0.5) ? 'male' : 'female'
                    const age = faker.number.int({ min: 0, max: 60 })
                    let patient = {
                        schemaVersion: 'v0.0.1',
                        firstName: faker.person.firstName(gender),
                        lastName: faker.person.lastName(gender),
                        socialId: faker.string.numeric(10),
                        phoneNumber: '0' + faker.string.numeric({ length: 10, allowLeadingZeros: false }),
                        address: {
                            text: `${faker.location.country()}-${faker.location.city()}-${faker.location.streetAddress()}`
                        },
                        age: age,
                        gender: gender,
                        medicalHistory: faker.datatype.boolean(0.3) ? undefined : {
                            description: {
                                text: faker.lorem.lines(5),
                            },
                            histories: Array.from({ length: faker.number.int({ min: 0, max: 7 }) }, () => faker.string.alpha(10))
                        },
                        birthDate: DateTime.utc().minus({ years: age }).toUnixInteger(),
                        updatedAt: patientCreatedAt.toUnixInteger(),
                        createdAt: patientCreatedAt.toUnixInteger(),
                    } as Patient

                    if (!patientSchema.isValidSync(patient))
                        throw new Error('seeder failed to create a patient document.')

                    patient = patientSchema.cast(patient)

                    const id = (await patientsCollection.insertOne(patient)).insertedId.toString()

                    for (let i = 0; i < faker.number.int({ min: 0, max: 10 }); i++) {
                        const visitCreatedAt = patientCreatedAt.plus({ days: faker.number.int({ min: 0, max: 30 }) })
                        let visit = {
                            schemaVersion: 'v0.0.1',
                            patientId: ObjectId.createFromHexString(id),
                            due: visitCreatedAt.plus({ days: faker.number.int({ min: 0, max: 30 }) }).toUnixInteger(),
                            diagnosis: {
                                text: faker.lorem.lines(faker.number.int({ min: 1, max: 10 })),
                            },
                            treatments: {
                                text: faker.lorem.lines(faker.number.int({ min: 1, max: 10 })),
                            },
                            updatedAt: visitCreatedAt.toUnixInteger(),
                            createdAt: visitCreatedAt.toUnixInteger(),
                        } as Visit

                        if (!visitSchema.isValidSync(visit))
                            throw new Error('seeder failed to create a visit document.')

                        visit = visitSchema.cast(visit)

                        await visitsCollection.insertOne(visit)
                    }
                    break
                } catch (error) {
                    tryCount++
                    console.error('error', error)
                    console.log('i', i)
                    if (tryCount >= 3) {
                        console.log('The retry limit exceeded, terminating...')
                        return
                    }
                }
        }
    }
    catch (err) {
        console.error(err)
        console.error(new Error('Failure while trying to seed users and privileges'))
    }
}

export async function seed(): Promise<boolean> {
    try {
        console.group('seed')

        if (readConfig()?.mongodb === undefined)
            return false

        console.log('Seeding medical histories...')
        await seedMedicalHistories(await db.getMedicalHistoriesCollection())

        console.log('Seeding users roles...')
        await seedUsersRoles(await db.getUsersCollection(), await db.getPrivilegesCollection())

        console.log('Seeding patients visits...')
        await seedPatientsVisits(50, await db.getPatientsCollection(), await db.getVisitsCollection());

        return true
    } catch (error) {
        console.error(error);
        return false
    } finally {
        console.groupEnd()
    }
}

export function handleSeedEvents() {
    ipcMain.handle('seed', async () => await seed())

    ipcMain.handle('truncate-db', async () => await db.truncate())
}
