import express from 'express';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const router = express.Router();

export default function (wrapFn: <T>(client: T) => T) {
  const s3Client = wrapFn(
    new S3Client({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      forcePathStyle: true,
    }),
  );

  const BUCKET_NAME = 'my-sample-bucket';

  async function createBucket() {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      console.log('Bucket already exists:', BUCKET_NAME);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFound') {
        const createBucketCommand = new CreateBucketCommand({
          Bucket: BUCKET_NAME,
        });
        await s3Client.send(createBucketCommand);
        console.log('Bucket created:', BUCKET_NAME);
      } else {
        throw error;
      }
    }
  }

  router.get('/add-to-bucket', async (req, res) => {
    try {
      await createBucket();
      const data = await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: 'dummy-file.txt',
          Body: 'This is a dummy file content',
        }),
      );
      res.status(200).json({ message: 'Dummy file added to S3', data });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        res.status(500);
      }
    }
  });

  createBucket().catch((error) => {
    console.error('Error creating bucket:', error);
  });

  return router;
}
