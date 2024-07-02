import { ipcRenderer } from 'electron'
import { Peer } from '../../Configuration/types'

export async function becomeMasterPeer(): Promise<boolean> {
    return (await ipcRenderer.invoke('become-master-peer')) ?? false
}

export async function browsePeers(): Promise<Peer[]> {
    return (await ipcRenderer.invoke('browse-peers')) ?? []
}

export async function getBrowsedPeers(): Promise<Peer[]> {
    return (await ipcRenderer.invoke('get-browsed-peers')) ?? []
}
