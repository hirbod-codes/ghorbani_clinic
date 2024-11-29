import fs from 'fs'
import Path from 'path'
import { Config, readConfig, writeConfigSync } from './Configuration/main'

export class StorageHelper {
    private static getConfig(): Config {
        console.log('getConfig')
        const c = readConfig()
        if (!c.storage)
            c.storage = {}
        return c
    }

    private static setConfig(c: Config) {
        console.log('setConfig')
        writeConfigSync(c)
    }

    static async getSize(path: string): Promise<number | undefined> {
        console.log('getSize', path)

        if (!fs.existsSync(path))
            return undefined

        const c = this.getConfig()

        if (c.storage[path] === undefined) {
            c.storage[path] = await this.calculateSize(path)
            this.setConfig(c)
        }

        return c.storage[path]
    }

    static async updateCache() {
        console.log('updateCache')

        const c = this.getConfig()

        for (const p of Object.keys(c.storage))
            c.storage[p] = await this.calculateSize(p)
        this.setConfig(c)
    }

    static async addSize(directoryPath: string, size: number): Promise<void> {
        console.log('addSize', directoryPath, size)

        if (!fs.statSync(directoryPath).isDirectory()) {
            console.log('directoryPath is not a directory')
            return
        }

        const c = this.getConfig()

        if (c.storage[directoryPath] === undefined)
            c.storage[directoryPath] = size
        else
            c.storage[directoryPath] += size

        this.setConfig(c)
    }

    static async subtractSize(directoryPath: string, size: number): Promise<void> {
        console.log('subtractSize', directoryPath, size)

        if (!fs.statSync(directoryPath).isDirectory()) {
            console.log('directoryPath is not a directory')
            return
        }

        const c = this.getConfig()

        if (c.storage[directoryPath] === undefined)
            return

        if (c.storage[directoryPath] >= size)
            c.storage[directoryPath] -= size
        else
            c.storage[directoryPath] -= 0

        this.setConfig(c)
    }

    static async calculateSizes(paths: string[] | string): Promise<number> {
        console.log('calculateSizes', paths)

        if (!paths)
            return

        if (!Array.isArray(paths))
            paths = [paths]

        let total = 0
        for (const p of paths)
            total += await this.calculateSize(p)

        return total
    }

    private static async calculateSize(path: string): Promise<number> {
        console.log('calculateSize', path)
        if (!fs.existsSync(path)) {
            console.log('path doesn\'t exists')
            return 0
        }

        if (fs.statSync(path).isFile())
            return fs.statSync(path).size

        const files = fs.readdirSync(path);

        const paths: Promise<number>[] = files.map(async (file: string) => {
            const joinedPath = Path.join(path, file);

            const stat = fs.statSync(joinedPath)

            if (stat.isDirectory())
                return await this.calculateSize(joinedPath);

            if (stat.isFile()) {
                const { size } = fs.statSync(joinedPath);

                return size;
            }

            return 0;
        });

        return (await Promise.all(paths)).flat(Infinity).reduce((i, size) => i + size, 0);
    }
}
