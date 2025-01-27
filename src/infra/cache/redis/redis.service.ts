import { EnvService } from '@/infra/env/env.service'
import { Injectable, type OnModuleDestroy } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(envService: EnvService) {
    super({
      host: envService.get('REDIS_HOST'),
      port: parseInt(envService.get('REDIS_PORT')),
      db: parseInt(envService.get('REDIS_DB')),
    })
  }

  onModuleDestroy() {
    this.disconnect()
  }
}
