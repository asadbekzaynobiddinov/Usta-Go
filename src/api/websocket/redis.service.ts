import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  private getUserStatus(userId: string) {
    return `user:${userId}:status`;
  }
  private getUserLastSeen(userId: string) {
    return `user:${userId}:last_seen`;
  }
  private getConnKey(userId: string) {
    return `user:${userId}:connections`;
  }

  async onConnect(userId: string) {
    const key = this.getConnKey(userId);
    const connections = await this.redis.incr(key);

    if (connections === 1) {
      await this.redis.set(this.getUserStatus(userId), 'online');
    }
  }

  async onDisconnect(userId: string) {
    const key = this.getConnKey(userId);

    const connections = await this.redis.decr(key);

    if (connections <= 0) {
      await this.redis.del(key);
      await this.redis.set(this.getUserStatus(userId), 'offline');
      await this.redis.set(this.getUserLastSeen(userId), Date.now());
    }
  }

  async isOnline(userId: string) {
    const status = await this.redis.get(this.getUserStatus(userId));
    return status === 'online';
  }

  async getLastSeen(userId: string) {
    return await this.redis.get(this.getUserLastSeen(userId));
  }
}
