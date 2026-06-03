import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendOverdueAlert(params: {
  to: string
  clientName: string
  blNumber: string
  returnDate: Date
}) {
  const { to, clientName, blNumber, returnDate } = params
  const formattedDate = returnDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  await transporter.sendMail({
    from: `"Custom Port Clearance" <${process.env.GMAIL_USER}>`,
    to,
    subject: `⚠️ Overdue Container Return — BL# ${blNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background: #0b0f19; color: #e2e8f0; padding: 32px;">
          <div style="max-width: 600px; margin: 0 auto; background: #161b22; border-radius: 12px; padding: 32px; border: 1px solid #30363d;">
            <h2 style="color: #f97316; margin-top: 0;">Container Return Overdue</h2>
            <p>Dear <strong>${clientName}</strong>,</p>
            <p>This is an automated reminder that your container associated with the following clearance job is <strong style="color: #ef4444;">overdue for return</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <tr>
                <td style="padding: 10px; border: 1px solid #30363d; color: #94a3b8;">BL Number</td>
                <td style="padding: 10px; border: 1px solid #30363d; font-weight: bold;">${blNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #30363d; color: #94a3b8;">Return Deadline</td>
                <td style="padding: 10px; border: 1px solid #30363d; color: #ef4444; font-weight: bold;">${formattedDate}</td>
              </tr>
            </table>
            <p>Please arrange for the container return immediately to avoid additional demurrage charges.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 32px;">This is an automated message. Please contact your agent for assistance.</p>
          </div>
        </body>
      </html>
    `,
  })
}
