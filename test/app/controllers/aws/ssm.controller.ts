import express from 'express';
import {
  CreateSecretCommand,
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { randomUUID } from 'node:crypto';

const router = express.Router();

export default function (wrapFn: <T>(client: T) => T) {
  const secretsManagerClient = wrapFn(
    new SecretsManagerClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    }),
  );

  const SECRET_NAME = 'mySecret';

  async function createSecret() {
    try {
      const data = await secretsManagerClient.send(
        new CreateSecretCommand({
          Name: SECRET_NAME,
          SecretString: randomUUID(),
        }),
      );
      console.log('Secret created:', data);
    } catch (error) {
      if (error instanceof Error && error.name === 'ResourceExistsException') {
        console.log('Secret already exists');
      } else {
        console.error('Error creating secret:', error);
      }
    }
  }

  router.get('/get-secret', async (req, res) => {
    try {
      const data = await secretsManagerClient.send(
        new GetSecretValueCommand({
          SecretId: SECRET_NAME,
        }),
      );
      res.status(200).json({ secret: data.SecretString });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        res.status(500);
      }
    }
  });

  createSecret().catch((error) => {
    console.error('Error creating secret:', error);
  });

  return router;
}
