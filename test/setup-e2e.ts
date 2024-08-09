import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { DomainEvents } from '@/core/events/domain-events'

config({
  path: './.env',
  override: true,
})
config({
  path: './.env.test',
  override: true,
})

const prisma = new PrismaClient()
function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const DatabaseUUID = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(DatabaseUUID)
  process.env.DATABASE_URL = databaseURL
  DomainEvents.shouldRun = false

  execSync('pnpm prisma migrate deploy')
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${DatabaseUUID}" CASCADE`,
  )
  await prisma.$disconnect()
})
