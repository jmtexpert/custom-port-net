import { PrismaClient, Role } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('❌ DATABASE_URL is missing inside environment system configs!')
  }

  // Pure string pass ho rahi hai bina kisi pool ke aapke code ke mutabiq
  const adapter = new PrismaMariaDb(databaseUrl)
  const client = new PrismaClient({ adapter })

  return { client }
}

const globalForPrisma = globalThis as unknown as { 
  prismaInstance?: { client: PrismaClient } 
}

const prismaWrapper = globalForPrisma.prismaInstance ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaInstance = prismaWrapper
}

export const prisma = prismaWrapper.client

async function main() {
  const hashed = await bcrypt.hash('Admin@123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@customport.com' },
    update: {},
    create: {
      email: 'admin@customport.com',
      password: hashed,
      name: 'Super Admin',
      role: Role.ADMIN,
      themePrimary: '#3b82f6',
    },
  })

  console.log('✅ Seeded successfully: admin@customport.com / Admin@123')
}

main()
  .catch((err) => {
    console.error('❌ Seeding pipeline failure error tracking:', err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })