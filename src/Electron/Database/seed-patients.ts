import { Collection, ObjectId } from "mongodb";
import { Patient } from "./Models/Patient";
import { Visit } from "./Models/Visit";
import { faker } from '@faker-js/faker'
import { DateTime } from "luxon";

export async function seed(patientCount: number, patientsCollection: Collection<Patient>, visitsCollection: Collection<Visit>): Promise<void> {
    await patientsCollection.deleteMany()
    await visitsCollection.deleteMany()

    for (let i = 0; i < patientCount; i++) {
        let tryCount = 0
        while (tryCount < 3)
            try {
                const patientCreatedAt = DateTime.fromISO(faker.date.between({ from: '2019-01-01T00:00:00.000Z', to: '2024-01-01T00:00:00.000Z' }).toISOString())
                const gender = faker.datatype.boolean(0.5) ? 'male' : 'female'
                const age = faker.number.int({ min: 0, max: 85 })
                const id = (await patientsCollection.insertOne({
                    schemaVersion: 'v0.0.1',
                    firstName: faker.person.firstName(gender),
                    lastName: faker.person.lastName(gender),
                    socialId: faker.string.numeric(10),
                    address: `${faker.location.country()}-${faker.location.city()}-${faker.location.streetAddress()}`,
                    age: age,
                    gender: gender,
                    medicalHistory: Array.from({ length: faker.number.int({ min: 0, max: 7 }) }, () => faker.lorem.lines(3)),
                    birthDate: DateTime.now().minus({ years: age }).toUnixInteger(),
                    updatedAt: patientCreatedAt.toUnixInteger(),
                    createdAt: patientCreatedAt.toUnixInteger(),
                } as Patient)).insertedId.toString()

                for (let i = 0; i < faker.number.int({ min: 0, max: 10 }); i++) {
                    const visitCreatedAt = patientCreatedAt.plus({ days: faker.number.int({ min: 0, max: 30 }) })
                    await visitsCollection.insertOne({
                        schemaVersion: 'v0.0.1',
                        patientId: new ObjectId(id),
                        due: visitCreatedAt.plus({ days: faker.number.int({ min: 0, max: 30 }) }).toUnixInteger(),
                        diagnosis: faker.helpers.maybe(() => Array.from({ length: faker.number.int({ min: 0, max: 4 }) }, () => faker.lorem.lines(4)), { probability: 0.5 }),
                        updatedAt: visitCreatedAt.toUnixInteger(),
                        createdAt: visitCreatedAt.toUnixInteger(),
                    })
                }
                break
            } catch (error) {
                tryCount++
                console.error('error', error)
                console.log('i', i)
                if (tryCount >= 3) {
                    console.log('The retry limit exceeded, terminating...')
                    break;
                }
            }
    }
}