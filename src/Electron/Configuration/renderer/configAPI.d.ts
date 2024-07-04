import type { Config } from "../types"

export type configAPI = {
    readConfig: () => Promise<Config | null | undefined>,
    writeConfig: (config: Config) => void
}
