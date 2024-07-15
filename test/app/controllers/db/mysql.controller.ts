import express from 'express';
import { createPool } from 'mysql2/promise';

const router = express.Router();

export default function (wrapFn: <T>(client: T) => T) {
  const pool = wrapFn(
    createPool({
      host: 'localhost',
      user: 'your_user',
      password: 'your_password',
      database: 'your_database',
    }),
  );

  router.get('/count', async (req, res) => {
    await pool.query('SELECT 1');
    res.json({});
  });

  return router;
}
