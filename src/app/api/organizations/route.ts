import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const createOrgSchema = z.object({
  name: z.string().min(1),
})

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const organizations = await prisma.organization.findMany({
    include: { _count: { select: { users: true, jobs: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ organizations })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const parsed = createOrgSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
  }

  const organization = await prisma.organization.create({
    data: { name: parsed.data.name },
    include: { _count: { select: { users: true, jobs: true } } },
  })

  return Response.json({ organization }, { status: 201 })
}
