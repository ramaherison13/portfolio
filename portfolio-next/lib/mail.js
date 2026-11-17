// Notification email optionnelle via Resend (https://resend.com). Ignorée si non configurée.
export async function sendAlertEmail(subject, text) {
  const { RESEND_API_KEY, NOTIFY_EMAIL_TO, NOTIFY_EMAIL_FROM } = process.env
  if (!RESEND_API_KEY || !NOTIFY_EMAIL_TO) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: NOTIFY_EMAIL_FROM || 'Portfolio <onboarding@resend.dev>',
        to: [NOTIFY_EMAIL_TO],
        subject,
        text,
      }),
    })
  } catch {}
}
