import { readableFields as privilegeReadableFields, updatableFields as privilegeUpdatableFields } from "../../Models/Privilege"
import { readableFields as userReadableFields, updatableFields as userUpdatableFields } from "../../Models/User"
import { readableFields as patientReadableFields, updatableFields as patientUpdatableFields } from "../../Models/Patient"
import { readableFields as visitReadableFields, updatableFields as visitUpdatableFields } from "../../Models/Visit"

export const resources = {
    USER: 'user',
    PATIENT: 'patient',
    VISIT: 'visit',
    PRIVILEGE: 'privilege',
    FILE: 'file',
    MEDICAL_HISTORY: 'medicalHistory'
}

export function getAttributes(resource: string, action: string) {
    if (action.toLowerCase().includes('create'))
        return []
    if (action.toLowerCase().includes('update'))
        return getUpdateAttributes(resource)
    if (action.toLowerCase().includes('read'))
        return getReadAttributes(resource)
    if (action.toLowerCase().includes('delete'))
        return []

    throw new Error('Invalid action value provided.')
}

export function getReadAttributes(resource: string): string[] {
    switch (resource) {
        case resources.USER:
            return userReadableFields
        case resources.PRIVILEGE:
            return privilegeReadableFields
        case resources.PATIENT:
            return patientReadableFields
        case resources.VISIT:
            return visitReadableFields
        case resources.FILE:
            return []

        default:
            throw new Error('Invalid resource value provided.')
    }
}

export function getUpdateAttributes(resource: string): string[] {
    switch (resource) {
        case resources.USER:
            return userUpdatableFields
        case resources.PRIVILEGE:
            return privilegeUpdatableFields
        case resources.PATIENT:
            return patientUpdatableFields
        case resources.VISIT:
            return visitUpdatableFields
        case resources.FILE:
            return []

        default:
            throw new Error('Invalid resource value provided.')
    }
}
