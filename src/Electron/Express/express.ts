import express, { Express, Request, Response } from 'express';
import { readConfig } from '../Configuration/configuration';

const app: Express = express()

app.get('/is-master', async (req: Request, res: Response) => {
    res.status(200).json({ isMaster: readConfig().isMaster })
});

export { app as expressApp }
