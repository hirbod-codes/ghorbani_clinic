import { DateTime } from "luxon"
import { User } from "../../Models/User"

export class Auth {
    static authenticatedUser: User | null = null
    static authenticatedAt: number | null = null
    static EXPIRATION_SECONDS = 7200;

    static getAuthenticated(): User | null {
        try {
            if (this.authenticatedUser && this.authenticatedAt !== null && (this.authenticatedAt + this.EXPIRATION_SECONDS) > DateTime.utc().toUnixInteger())
                return this.authenticatedUser
            else
                return null
        } catch (error) {
            console.error(error)
            return null
        }
    }
}
