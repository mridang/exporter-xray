import express from 'express';
import {
  CreateQueueCommand,
  GetQueueUrlCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

const router = express.Router();

export default function (wrapFn: <T>(client: T) => T) {
  const sqsClient = wrapFn(
    new SQSClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    }),
  );

  const QUEUE_NAME = 'MyQueue';
  let QUEUE_URL: string;

  async function createQueue() {
    try {
      const { QueueUrl } = await sqsClient.send(
        new GetQueueUrlCommand({
          QueueName: QUEUE_NAME,
        }),
      );
      if (QueueUrl === undefined) {
        throw new Error();
      } else {
        console.log('Queue already exists:', QUEUE_URL);
        QUEUE_URL = QueueUrl;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'QueueDoesNotExist') {
        await sqsClient.send(
          new CreateQueueCommand({
            QueueName: QUEUE_NAME,
          }),
        );
        const { QueueUrl } = await sqsClient.send(
          new GetQueueUrlCommand({
            QueueName: QUEUE_NAME,
          }),
        );
        if (QueueUrl === undefined) {
          throw new Error();
        } else {
          console.log('Queue created:', QUEUE_URL);
          QUEUE_URL = QueueUrl;
        }
      } else {
        throw error;
      }
    }
  }

  router.get('/add-to-queue', async (req, res) => {
    try {
      await createQueue();

      const data = await sqsClient.send(
        new SendMessageCommand({
          MessageBody: crypto.randomUUID(),
          QueueUrl: QUEUE_URL,
        }),
      );
      res.status(200).json({ message: 'Item added to queue', data });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        res.status(500);
      }
    }
  });

  createQueue().catch((error) => {
    console.error('Error creating queue:', error);
  });

  return router;
}
