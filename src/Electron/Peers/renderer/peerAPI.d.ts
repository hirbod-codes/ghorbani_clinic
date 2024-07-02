import { Peer } from "../../Configuration/types"
import type { Config } from "../types"

export type configAPI = {
    becomeMasterPeer: () => Promise<boolean>,
    browsePeers: () => Promise<Peer[]>,
    getBrowsedPeers: () => Promise<Peer[]>,
}
