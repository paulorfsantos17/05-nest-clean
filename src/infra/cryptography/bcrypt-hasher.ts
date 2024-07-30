import type { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer'
import type { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'
import { Injectable } from '@nestjs/common'
import { compare, hash } from 'bcryptjs'

@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_lENGTH = 8
  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_lENGTH)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
