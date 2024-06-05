import { getPrivileges as getPatientsPrivileges } from '../Database/Models/Patient'
import { getPrivileges as getVisitsPrivileges } from '../Database/Models/Visit'


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

export function getPrivileges(roleName: RoleName): string[] {
    return [
        ...getPatientsPrivileges(roleName),
        ...getVisitsPrivileges(roleName)
    ]
}
