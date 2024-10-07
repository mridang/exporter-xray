import axios from 'axios';
import undici from 'undici';
import express, { Request, Response } from 'express';

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function (_wrapFn: <T>(client: T) => T) {
  router.get('/fetch', async (_req: Request, res: Response) => {
    const data = await (await fetch('https://api.github.com/')).json();
    res.send(data);
  });

  router.get('/axios', async (_req: Request, res: Response) => {
    const response = await axios.get('https://api.github.com/');
    res.send(response.data);
  });

  router.get('/undici', async (_req: Request, res: Response) => {
    const data = await (await undici.fetch('https://api.github.com/')).json();
    res.send(data);
  });

  return router;
}
