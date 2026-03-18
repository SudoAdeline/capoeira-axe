export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, details } = req.body;

  if (!type || !details) {
    return res.status(400).json({ error: 'Missing type or details' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email not configured' });
  }

  const ADMIN_EMAIL = 'thembe.adeline@gmail.com';

  let subject, body;

  if (type === 'event_pending') {
    subject = `AXÉ Events — New event awaiting approval`;
    body = `
      <h2>New Event Submitted</h2>
      <p><strong>Title:</strong> ${details.title}</p>
      <p><strong>Type:</strong> ${details.event_type || 'N/A'}</p>
      <p><strong>Date:</strong> ${details.start_date || 'N/A'}</p>
      <p><strong>Location:</strong> ${details.city || ''}, ${details.country || ''}</p>
      <p><strong>Submitted by:</strong> ${details.submitted_by_name || 'Unknown'}</p>
      <br>
      <p><a href="https://axe-events.com/admin">Review in Admin Dashboard</a></p>
    `;
  } else if (type === 'organizer_request') {
    subject = `AXÉ Events — New organizer request`;
    body = `
      <h2>New Organizer Request</h2>
      <p><strong>Name:</strong> ${details.name || 'Not provided'}</p>
      <p><strong>Apelido:</strong> ${details.apelido || 'Not provided'}</p>
      <p><strong>Group:</strong> ${details.capoeira_group || 'Not provided'}</p>
      <p><strong>Email:</strong> ${details.email || 'Not provided'}</p>
      <br>
      <p><a href="https://axe-events.com/admin">Review in Admin Dashboard</a></p>
    `;
  } else {
    return res.status(400).json({ error: 'Unknown notification type' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'AXÉ Events <onboarding@resend.dev>',
        to: ADMIN_EMAIL,
        subject,
        html: body,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
