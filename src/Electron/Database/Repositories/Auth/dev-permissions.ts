import { DateTime } from "luxon";
import { Privilege } from "../../Models/Privilege"
import { resources } from "./resources";

export const roles = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    SECRETARY: 'secretary',
}

const ts: number = DateTime.utc().toUnixInteger()

export const privileges: Privilege[] = [
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.DB, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.DB, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.DB, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.DB, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.DB, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.DB, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.DB, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.DB, attributes: '*', updatedAt: ts, createdAt: ts },

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

    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.SECRETARY, action: 'create:any', resource: resources.CANVAS, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.SECRETARY, action: 'create:any', resource: resources.FILE, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.PRIVILEGE, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.USER, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.USER, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.USER, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.USER, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.USER, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.USER, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.USER, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.USER, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'create:any', resource: resources.MEDICAL_HISTORY, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'read:any', resource: resources.MEDICAL_HISTORY, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'update:any', resource: resources.MEDICAL_HISTORY, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.ADMIN, action: 'delete:any', resource: resources.MEDICAL_HISTORY, attributes: '*', updatedAt: ts, createdAt: ts },

    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'create:any', resource: resources.MEDICAL_HISTORY, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'read:any', resource: resources.MEDICAL_HISTORY, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'update:any', resource: resources.MEDICAL_HISTORY, attributes: '*', updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', role: roles.DOCTOR, action: 'delete:any', resource: resources.MEDICAL_HISTORY, attributes: '*', updatedAt: ts, createdAt: ts },
]
