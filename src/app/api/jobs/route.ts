import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const createJobSchema = z.object({
  blNumber: z.string().min(1),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  dirNumber: z.string().min(1),
  eirNumber: z.string().min(1),
  returnDate: z.string().datetime(),
  advanceAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  containerReturnDate: z.string().datetime().optional().nullable(),
  extraFields: z.record(z.string(), z.unknown()).optional().nullable(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ jobs })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const parsed = createJobSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
  }

  const data = parsed.data

  try {
    const job = await prisma.job.create({
      data: {
        blNumber: data.blNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        dirNumber: data.dirNumber,
        eirNumber: data.eirNumber,
        returnDate: new Date(data.returnDate),
        advanceAmount: data.advanceAmount,
        totalAmount: data.totalAmount,
        containerReturnDate: data.containerReturnDate ? new Date(data.containerReturnDate) : null,
        extraFields: data.extraFields as Prisma.InputJsonValue | undefined,
      },
    })

    return Response.json({ job }, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return Response.json({ error: 'BL Number already exists' }, { status: 409 })
    }
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
