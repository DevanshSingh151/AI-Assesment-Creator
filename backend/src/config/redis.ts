import dotenv from 'dotenv';
dotenv.config();

import IORedis from 'ioredis';

export const createRedisConnection = () => {
  const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null, // Required for BullMQ
  });

  connection.on('connect', () => console.log('✅ Redis connected'));
  connection.on('error', (err) => console.error('❌ Redis error:', err));

  return connection;
};
