import { Module } from '@nestjs/common'
import { EnvModule } from '../env/env.module'
import { RedisService } from './redis/redis.service'
import { RedisCacheRepository } from './redis/redis-cache-repository'
import { CacheRepository } from './cache-repository'

@Module({
  imports: [EnvModule],
  providers: [
    RedisService,
    { provide: CacheRepository, useClass: RedisCacheRepository },
  ],
  exports: [CacheRepository],
})
export class CacheModule {}
