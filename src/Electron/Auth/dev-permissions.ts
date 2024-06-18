import { DateTime } from "luxon";
import { Privilege } from "../Database/Models/Privilege"

export const resources = {
    USER: 'user',
    PATIENT: 'patient',
    VISIT: 'visit',
    PRIVILEGE: 'privilege',
}

export const roles = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    SECRETARY: 'secretary',
}

const ts: number = DateTime.utc().toUnixInteger()

export const privileges: Privilege[] = [
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.SECRETARY, action: 'create:any', resource: resources.PATIENT, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.SECRETARY, action: 'create:any', resource: resources.VISIT, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },

]
