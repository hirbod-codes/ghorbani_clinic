import { RendererDbAPI } from "../../../Electron/Database/renderer";
import { Visit } from "../../../Electron/Database/Models/Visit";
import { Date } from "../../Lib/DateTime";
import { toDateTime } from "../../Lib/DateTime/date-time-helpers";
import { Local } from "../../../Electron/Configuration/renderer.d";
import { Patient } from "@/src/Electron/Database/Models/Patient";

export const getVisitsInDate = async (date: Date, local: Local): Promise<Visit[] | undefined> => {
    const toLocal: Local = { calendar: 'Gregorian', language: 'en', direction: 'ltr', zone: 'UTC' }
    const startDate = toDateTime({ date, time: { hour: 0, minute: 0, second: 0, millisecond: 0 } }, toLocal, local).toUnixInteger()
    const endDate = toDateTime({ date, time: { hour: 23, minute: 59, second: 59, millisecond: 999 } }, toLocal, local).toUnixInteger()

    const res = (await (window as typeof window & { dbAPI: RendererDbAPI }).dbAPI.getVisitsByDate(startDate, endDate))
    console.log('getVisitsInDate', { date, res })

    if (res.code >= 200 && res.code < 300 && res.data !== undefined)
        return res.data
}

export const getVisitsPatients = async (visits: Visit[]): Promise<{ visits: Visit[], patients: Patient[] }> => {
    let patients: Patient[] = []
    await Promise.all(visits.map(async visit => {
        let patient = visit.patientId ? patients.find(f => f._id === visit.patientId) : undefined

        if (patient === undefined && visit.patientId !== undefined) {
            let res = (await (window as typeof window & { dbAPI: RendererDbAPI; }).dbAPI.getPatientById(visit.patientId as string))
            console.log({ res })
            if (res.code < 300 && res.code >= 200 && res?.data)
                patients.push(res.data)
        }
    }))

    return { visits, patients }
}
