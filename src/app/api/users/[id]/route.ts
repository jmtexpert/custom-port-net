import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const userId = parseInt(id, 10)

  if (session.userId === userId) {
    return Response.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  if (session.role !== 'ADMIN') {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } })
    if (!target || target.organizationId !== session.organizationId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  await prisma.user.delete({ where: { id: userId } })
  return Response.json({ success: true })
}
