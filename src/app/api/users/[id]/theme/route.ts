import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession, createSession } from '@/lib/auth'

const themeSchema = z.object({
  themePrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
})

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/users/[id]/theme'>) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const userId = parseInt(id, 10)

  if (session.role !== 'ADMIN' && session.userId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = themeSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: 'Invalid hex color' }, { status: 422 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { themePrimary: parsed.data.themePrimary },
    select: { id: true, email: true, name: true, role: true, themePrimary: true },
  })

  if (session.userId === userId) {
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      themePrimary: user.themePrimary,
    })
  }

  return Response.json({ user })
}
