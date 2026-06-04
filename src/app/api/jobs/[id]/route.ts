import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const updateJobSchema = z.object({
  status: z.enum(['PENDING', 'RECEIVED']).optional(),
  containerReturnDate: z.string().datetime().optional().nullable(),
  blNumber: z.string().min(1).optional(),
  clientName: z.string().min(1).optional(),
  clientEmail: z.string().email().optional(),
  dirNumber: z.string().min(1).optional(),
  eirNumber: z.string().min(1).optional(),
  returnDate: z.string().datetime().optional(),
  advanceAmount: z.number().nonnegative().optional(),
  totalAmount: z.number().nonnegative().optional(),
  extraFields: z.record(z.string(), z.unknown()).optional().nullable(),
})

async function resolveJobAccess(jobId: number, session: { role: string; organizationId: number | null }) {
  if (session.role === 'ADMIN') return true
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { organizationId: true } })
  return job?.organizationId !== null && job?.organizationId === session.organizationId
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/jobs/[id]'>) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const jobId = parseInt(id, 10)
  if (isNaN(jobId)) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  const allowed = await resolveJobAccess(jobId, session)
  if (!allowed) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const parsed = updateJobSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
  }

  const data = parsed.data

  const updateData: Prisma.JobUpdateInput = {
    status: data.status,
    blNumber: data.blNumber,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    dirNumber: data.dirNumber,
    eirNumber: data.eirNumber,
    advanceAmount: data.advanceAmount,
    totalAmount: data.totalAmount,
    returnDate: data.returnDate ? new Date(data.returnDate) : undefined,
    containerReturnDate:
      data.containerReturnDate !== undefined
        ? data.containerReturnDate
          ? new Date(data.containerReturnDate)
          : null
        : undefined,
    extraFields:
      data.extraFields !== undefined
        ? data.extraFields === null
          ? Prisma.JsonNull
          : (data.extraFields as Prisma.InputJsonValue)
        : undefined,
  }

  const job = await prisma.job.update({ where: { id: jobId }, data: updateData })
  return Response.json({ job })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/jobs/[id]'>) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const jobId = parseInt(id, 10)
  if (isNaN(jobId)) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  const allowed = await resolveJobAccess(jobId, session)
  if (!allowed) return Response.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.job.delete({ where: { id: jobId } })
  return Response.json({ success: true })
}
