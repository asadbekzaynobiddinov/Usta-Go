import { Provider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { config } from 'src/config';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    });
  },
};
