import { ipcMain } from "electron"
import { Peer } from "../Configuration/types"
import { readConfig, writeConfigSync } from "../Configuration/configuration"
import { mDNS } from "./mDNS"

export async function browsePeers(): Promise<Peer[]> {
    await updatePeers()

    return readConfig().peers ?? []
}

export async function becomeMasterPeer(): Promise<boolean> {
    let c = readConfig()

    if (c.isMaster)
        return true

    writeConfigSync({ ...c, isMaster: true })

    await updatePeers()

    c = readConfig()

    if (c.peers.find(f => f.isMaster) !== undefined) {
        writeConfigSync({ ...c, isMaster: false })
        return false
    }

    return true
}

export async function updatePeers(): Promise<void> {
    const c = readConfig()

    mDNS.query([{ type: 'SRV', name: `${c.appIdentifier}.local` }])

    await new Promise((resolve, _) => {
        setTimeout(resolve, 2000);
    })

    if (!Array.isArray(c.peers))
        return

    let masterTimestamp: number | undefined = undefined
    for (let i = 0; i < c.peers.length; i++) {
        const res = await fetch(`http://${c.peers[i].ip}:${c.peers[i].port}/is-master`)
        if (res.status < 200)
            continue

        const resObject = JSON.parse(await res.json())

        if (resObject?.isMaster === true)
            c.peers[i].isMaster = true
    }

    writeConfigSync({ ...c })
}

export async function getBrowsedPeers(): Promise<Peer[]> {
    return readConfig().peers ?? []
}

export function handlePeerEvents() {
    ipcMain.handle('browse-peers', () => {
        return browsePeers()
    })

    ipcMain.handle('become-master-peer', async () => {
        return await becomeMasterPeer()
    })

    ipcMain.handle('browse-peers', async () => {
        return await browsePeers()
    })

    ipcMain.handle('get-browsed-peers', async () => {
        return await getBrowsedPeers()
    })
}
