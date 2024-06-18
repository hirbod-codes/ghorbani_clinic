import { DateTime } from "luxon"
import { User } from "../../Models/User"

export class Auth {
    static authenticatedUser: User | null = null
    static authenticatedAt: number | null = null
    static EXPIRATION_SECONDS = 1;

    static getAuthenticated(): User | null {
        try {
            if (!this.authenticatedUser && this.authenticatedAt > DateTime.utc().minus({ seconds: this.EXPIRATION_SECONDS }).toUnixInteger())
                return this.authenticatedUser
            else
                return null
        } catch (error) {
            console.error(error)
            return null
        }
    }
}
