import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
import path from 'path'

// Framework safe absolute path mapping taake environment variables loading break na hon
config({ path: path.resolve(process.cwd(), '.env') })

if (!process.env.DATABASE_URL) {
  throw new Error('❌ Prisma Config Error: DATABASE_URL is missing inside your .env file!')
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})