import './otel';

import express from 'express';
import axios from 'axios';
import { Request, Response } from 'express';

import sqsController from './controllers/aws/sqs.controller';
import dynamoController from './controllers/aws/ddb.controller';
import bucketController from './controllers/aws/sss.controller';
import secretsController from './controllers/aws/ssm.controller';
import mysqlController from './controllers/db/mysql.controller';
import httpController from './controllers/http.controller';

const app = express();

app.use(
  '/sqs',
  sqsController((client) => client),
);
app.use(
  '/dynamo',
  dynamoController((client) => client),
);
app.use(
  '/s3',
  bucketController((client) => client),
);
app.use(
  '/ssm',
  secretsController((client) => client),
);
app.use(
  '/mysql',
  mysqlController((client) => client),
);
app.use(
  '/http',
  httpController((client) => client),
);

app.get('/', function (req: Request, res: Response) {
  res.send('Hello, world!');
});

// app.get('/crash', (_req: Request, _res: Response) => {
//   const span = trace.getSpan(context.active());
//   span.recordException(new Error('boox'));
//   throw new Error('boom');
// });

app.get('/cause/fault', (_req: Request, res: Response) => {
  res.status(500).send('Internal Server Error');
});

app.get('/cause/error', (_req: Request, res: Response) => {
  res.status(400).send('Bad Request');
});

app.get('/cause/throttle', (_req: Request, res: Response) => {
  res.status(429).send('Bad Request');
});

app.get('/crossapp/send', async (_req: Request, res: Response) => {
  const response = await axios.post('http://localhost:3001/crossapp/receive', {
    name: 'Service A',
  });
  res.send(response.data);
});

app.post('/crossapp/receive', (req: Request, res: Response) => {
  res.json({ name: 'Service B' });
});

const server = app.listen(process.env.PORT || 2999, () => {
  console.log(`Server is running.`);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forcing server shutdown');
    process.exit(1);
  }, 500);
});
