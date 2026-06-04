import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const adminCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'CLIENT']).default('CLIENT'),
  organizationId: z.number().int().positive().optional().nullable(),
})

const clientCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const where =
    session.role === 'ADMIN'
      ? {}
      : { organizationId: session.organizationId ?? -1 }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      themePrimary: true,
      createdAt: true,
      organizationId: true,
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ users })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  try {
    if (session.role === 'ADMIN') {
      const parsed = adminCreateSchema.safeParse(body)
      if (!parsed.success) {
        return Response.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
      }
      const { email, password, name, role, organizationId } = parsed.data
      const hashed = await bcrypt.hash(password, 12)
      const user = await prisma.user.create({
        data: { email, password: hashed, name, role, organizationId: organizationId ?? null },
        select: { id: true, email: true, name: true, role: true, themePrimary: true, createdAt: true, organizationId: true, organization: { select: { name: true } } },
      })
      return Response.json({ user }, { status: 201 })
    } else {
      if (!session.organizationId) {
        return Response.json({ error: 'No organization assigned' }, { status: 403 })
      }
      const parsed = clientCreateSchema.safeParse(body)
      if (!parsed.success) {
        return Response.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
      }
      const { email, password, name } = parsed.data
      const hashed = await bcrypt.hash(password, 12)
      const user = await prisma.user.create({
        data: { email, password: hashed, name, role: 'CLIENT', organizationId: session.organizationId },
        select: { id: true, email: true, name: true, role: true, themePrimary: true, createdAt: true, organizationId: true, organization: { select: { name: true } } },
      })
      return Response.json({ user }, { status: 201 })
    }
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return Response.json({ error: 'Email already exists' }, { status: 409 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
