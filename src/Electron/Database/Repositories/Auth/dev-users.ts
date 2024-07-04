import { hashSync } from 'bcrypt'
import { User } from "../../Models/User";
import { roles } from "./dev-permissions";
import { DateTime } from 'luxon';

const ts: number = DateTime.utc().toUnixInteger()

export const users: User[] = [
    { schemaVersion: 'v0.0.1', roleName: roles.ADMIN, username: 'hirbod', password: hashSync('adminPass', 10), updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', roleName: roles.DOCTOR, username: 'Ghorbani', password: hashSync('docPass', 10), updatedAt: ts, createdAt: ts },
    { schemaVersion: 'v0.0.1', roleName: roles.SECRETARY, username: 'secretary', password: hashSync('secPass', 10), updatedAt: ts, createdAt: ts },
]
