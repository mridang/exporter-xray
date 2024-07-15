import express from 'express';
import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';

const router = express.Router();

export default function (wrapFn: <T>(client: T) => T) {
  const dynamoClient = wrapFn(
    new DynamoDBClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    }),
  );

  const TABLE_NAME = 'MyTable';

  async function createTable() {
    try {
      await dynamoClient.send(
        new DescribeTableCommand({
          TableName: TABLE_NAME,
        }),
      );
      console.log('Table already exists:', TABLE_NAME);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'ResourceNotFoundException'
      ) {
        try {
          await dynamoClient.send(
            new CreateTableCommand({
              TableName: TABLE_NAME,
              AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
              ],
              KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            }),
          );
          console.log('Table created:', TABLE_NAME);
        } catch (error) {
          if (
            error instanceof Error &&
            error.name === 'ResourceInUseException'
          ) {
            console.log('Table already exists');
          } else {
            console.error('Error creating table:', error);
          }
        }
      } else {
        throw error;
      }
    }
  }

  router.get('/add-to-table', async (req, res) => {
    try {
      await createTable();

      const data = await dynamoClient.send(
        new PutItemCommand({
          TableName: TABLE_NAME,
          Item: {
            id: { S: crypto.randomUUID() },
            data: { S: `Random data ${Math.random()}` },
          },
        }),
      );
      res.status(200).json({ message: 'Random item added to DynamoDB', data });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        res.status(500);
      }
    }
  });

  createTable().catch((error) => {
    console.error('Error creating table:', error);
  });

  return router;
}
