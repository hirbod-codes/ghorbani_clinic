export type menuAPI = {
    openMenu: (x: number, y: number) => void | undefined,
    minimize: () => void | undefined,
    maximize: () => void | undefined,
    unmaximize: () => void | undefined,
    maxUnmax: () => void | undefined,
    close: () => void | undefined,
    isWindowMaximized: () => Promise<boolean | null | undefined>,
}
