import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOverdueAlert } from '@/lib/mailer'
import { Job } from '@prisma/client' // Pehle top par import karein
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  console.log(authHeader);
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const overdueJobs = await prisma.job.findMany({
    where: {
      status: 'PENDING',
      returnDate: { lt: now },
    },
  })

  const results = await Promise.allSettled(
    overdueJobs.map((job:Job) =>
      sendOverdueAlert({
        to: job.clientEmail,
        clientName: job.clientName,
        blNumber: job.blNumber,
        returnDate: job.returnDate,
      })
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return Response.json({
    processed: overdueJobs.length,
    sent,
    failed,
    timestamp: now.toISOString(),
  })
}
