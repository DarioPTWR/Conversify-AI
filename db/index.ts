// prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // Allow `cachedPrisma` to be undefined initially
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined
}

const prisma = global.cachedPrisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Optional: Enable detailed logging
})

if (process.env.NODE_ENV !== 'production') {
  global.cachedPrisma = prisma
}

export const db = prisma
