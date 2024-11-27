import fs from 'fs'
import Path from 'path'

export class StorageHelper {
    private static cache: { [path: string]: number } = {}

    static async getSize(path: string): Promise<number | undefined> {
        if (!fs.existsSync(path))
            return undefined

        if (this.cache[path] === undefined)
            this.cache[path] = await this.calculateSize(path)

        return this.cache[path]
    }

    static async updateCache() {
        for (const p in this.cache)
            this.cache[p] = await this.calculateSize(p)
    }

    static async addSize(directoryPath: string, paths: string[]): Promise<void> {
        if (fs.statSync(directoryPath).isDirectory())
            return

        let total = 0
        for (const p of paths)
            if (!p.startsWith(directoryPath))
                total += await this.calculateSize(Path.join(directoryPath, p))
            else
                total += await this.calculateSize(p)

        if (this.cache[directoryPath] === undefined)
            this.cache[directoryPath] = total
        else
            this.cache[directoryPath] += total
    }

    static async subtractSize(directoryPath: string, paths: string[]): Promise<void> {
        if (fs.statSync(directoryPath).isDirectory())
            return

        let total = 0
        for (const p of paths)
            if (!p.startsWith(directoryPath))
                total -= await this.calculateSize(Path.join(directoryPath, p))
            else
                total -= await this.calculateSize(p)

        if (this.cache[directoryPath] === undefined)
            this.cache[directoryPath] = total
        else
            this.cache[directoryPath] -= total
    }

    private static async calculateSize(path: string): Promise<number> {
        if (!fs.existsSync(path))
            return 0

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
