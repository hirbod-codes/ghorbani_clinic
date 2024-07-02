import express, { Express, Request, Response } from 'express';
import { readConfig } from '../Configuration/configuration';

const app: Express = express();

const config = readConfig()

app.get('/is-master', async (req: Request, res: Response) => {
    res.status(200).json({ isMaster: readConfig().isMaster })
});

app.listen(Number(config.port), config.hostName, () => console.log(`Express server has launched at http://${config.hostName}:${config.port}`));
