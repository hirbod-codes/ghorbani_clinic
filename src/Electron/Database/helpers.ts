export function extractKeys(o: unknown, keys: string[]) {
    return Object.fromEntries(Object.entries(o).filter(arr => keys.includes(arr[0])));
}

export function extractKeysRecursive(o: unknown[], keys: string[], ) {
    return o.map(elm => Object.fromEntries(Object.entries(elm).filter(arr => keys.includes(arr[0]))))
}