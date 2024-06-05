import { getPrivileges as getPatientsPrivileges } from '../Database/Models/Patient'
import { getPrivileges as getVisitsPrivileges } from '../Database/Models/Visit'
import type { Operation } from './types'


export type RoleName = 'doctor' | 'secretary'

export const roles: { name: RoleName, privileges: string[] }[] = [
    {
        name: 'doctor',
        privileges: getPrivileges('doctor')
    },
    {
        name: 'secretary',
        privileges: getPrivileges('secretary')
    },
]

export function getFieldsInPrivileges(privileges: string[], operation: Operation, collectionName: string): string[] {
    return privileges.filter(p => p.startsWith(`${operation}.${collectionName}.`)).map(p => p.replace(`${operation}.${collectionName}.`, ''))
}

export function getPrivileges(roleName: RoleName): string[] {
    return [
        ...getPatientsPrivileges(roleName),
        ...getVisitsPrivileges(roleName)
    ]
}
