export function extractKeys(o: any, keys: string[]): any {
    return Object.fromEntries(Object.entries(o).filter(arr => keys.includes(arr[0])));
}

export function extractKeysRecursive(o: any[], keys: string[],): any {
    return o.map(elm => extractKeys(elm, keys))
}
