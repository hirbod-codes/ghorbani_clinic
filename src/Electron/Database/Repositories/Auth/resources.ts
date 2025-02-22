import { readableFields as privilegeReadableFields, updatableFields as privilegeUpdatableFields } from "../../Models/Privilege"
import { readableFields as userReadableFields, updatableFields as userUpdatableFields } from "../../Models/User"
import { readableFields as patientReadableFields, updatableFields as patientUpdatableFields } from "../../Models/Patient"
import { readableFields as visitReadableFields, updatableFields as visitUpdatableFields } from "../../Models/Visit"
import { readableFields as canvasReadableFields, updatableFields as canvasUpdatableFields } from "../../Models/Canvas"

export const resources = {
    USER: 'user',
    PRIVILEGE: 'privilege',
    PATIENT: 'patient',
    VISIT: 'visit',
    FILE: 'file',
    DB: 'db',
    MEDICAL_HISTORY: 'medicalHistory',
    CANVAS: 'canvas',
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
        case resources.CANVAS:
            return canvasReadableFields
        case resources.FILE:
            return []
        case resources.DB:
            return []
        case resources.MEDICAL_HISTORY:
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
        case resources.CANVAS:
            return canvasUpdatableFields
        case resources.FILE:
            return []
        case resources.DB:
            return []
        case resources.MEDICAL_HISTORY:
            return []

        default:
            throw new Error('Invalid resource value provided.')
    }
}
