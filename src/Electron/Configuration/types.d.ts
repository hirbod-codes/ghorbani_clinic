import type { ConfigurationStorableData } from "../../react/ConfigurationContext"

export type MongodbConfig = {
    url: string;
    databaseName: string;
    auth: {
        username: string;
        password: string;
    };
};

export type AuthConfig = { users: User[] }

export type Config = {
    configuration?: ConfigurationStorableData,
    mongodb?: MongodbConfig,
    auth?: AuthConfig,
}
