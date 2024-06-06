export type MongodbConfig = {
    url: string;
    databaseName: string;
    auth: {
        username: string;
        password: string;
    };
};

export type Config = {
    mongodb: MongodbConfig,
}

export type AuthConfig = { authenticatedUserIndex: number | null, users: User[] }
