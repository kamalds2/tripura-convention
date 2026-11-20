// Serverless function for Vercel / Netlify / Node to send luxury HTML card emails via Resend

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDisplayDate(dateStr) {
  if (!dateStr || dateStr === 'Not specified') return 'Not specified';
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
  } catch (e) {}
  return dateStr;
}

function formatDisplayTime(timeStr) {
  if (!timeStr || timeStr === 'Not specified') return 'Not specified';
  try {
    const parts = String(timeStr).split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
  } catch (e) {}
  return timeStr;
}

function buildInquiryCardsHtml(data) {
  const name = escapeHtml(data.name || 'Not provided');
  const phone = escapeHtml(data.phone || 'Not provided');
  const cleanPhone = String(data.phone || '').replace(/[^0-9+]/g, '');
  const email = escapeHtml(data.email || 'Not provided');
  const venue = escapeHtml(data.venue || 'Tripura Convention');
  const eventType = escapeHtml(data.eventType || 'Event Inquiry');
  const eventDate = escapeHtml(formatDisplayDate(data.eventDate));
  const eventTime = escapeHtml(formatDisplayTime(data.eventTime));
  const guests = escapeHtml(data.guests || 'Not specified');
  const budget = escapeHtml(data.budget || 'Not specified');
  const requirements = escapeHtml(data.requirements || 'No special requirements specified.');
  const isContact = Boolean(data.isContactForm);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#f4f1ea; font-family:'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <div style="background-color:#f4f1ea; padding:24px 12px; min-height:100%;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e5ded2; box-shadow:0 8px 30px rgba(74,21,37,0.08);">
      
      <!-- HEADER / BRAND BANNER -->
      <tr>
        <td style="background:linear-gradient(135deg, #2c0b15 0%, #4a1525 60%, #1f070f 100%); padding:28px 24px; text-align:center; border-top:4px solid #d4af37;">
          <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#d4af37; font-weight:700; margin-bottom:6px;">
            ★ TRIPURA CONVENTION ★
          </div>
          <h1 style="color:#ffffff; margin:0 0 6px 0; font-size:22px; font-weight:700; letter-spacing:0.02em;">
            ${isContact ? 'New Client Message' : 'New Booking Inquiry'}
          </h1>
          <div style="display:inline-block; background:rgba(212,175,55,0.18); border:1px solid #d4af37; border-radius:20px; padding:4px 14px; margin-top:6px;">
            <span style="color:#fde047; font-size:13px; font-weight:600;">
              ${eventType} ${venue !== 'Tripura Convention' ? `• ${venue}` : ''}
            </span>
          </div>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td style="padding:24px 20px 20px 20px;">

          <!-- CARD 1: CLIENT DETAILS -->
          <div style="background:#ffffff; border:1px solid #e7ded4; border-left:4px solid #d4af37; border-radius:8px; padding:18px 20px; margin-bottom:16px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
            <div style="font-size:11px; font-weight:700; color:#8b6d38; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px;">
              👤 Client Contact Information
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:4px 0; font-size:14px; color:#6b7280; width:100px; vertical-align:top;"><strong>Full Name:</strong></td>
                <td style="padding:4px 0; font-size:15px; color:#111827; font-weight:700;">${name}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; font-size:14px; color:#6b7280; vertical-align:top;"><strong>Phone:</strong></td>
                <td style="padding:4px 0; font-size:15px;">
                  <a href="tel:${cleanPhone}" style="color:#4a1525; font-weight:700; text-decoration:none; background:#f9f5f0; padding:3px 8px; border-radius:4px; border:1px solid #ebdccb; display:inline-block;">
                    📞 ${phone}
                  </a>
                </td>
              </tr>
              ${email !== 'Not provided' ? `
              <tr>
                <td style="padding:4px 0; font-size:14px; color:#6b7280; vertical-align:top;"><strong>Email:</strong></td>
                <td style="padding:4px 0; font-size:14px;">
                  <a href="mailto:${email}" style="color:#2563eb; text-decoration:none;">${email}</a>
                </td>
              </tr>` : ''}
            </table>
          </div>

          ${!isContact ? `
          <!-- CARD 2: EVENT SCHEDULE & VENUE -->
          <div style="background:#ffffff; border:1px solid #e7ded4; border-left:4px solid #4a1525; border-radius:8px; padding:18px 20px; margin-bottom:16px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
            <div style="font-size:11px; font-weight:700; color:#4a1525; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px;">
              🎪 Event &amp; Schedule Details
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:4px 0; font-size:14px; color:#6b7280; width:110px; vertical-align:top;"><strong>Venue Space:</strong></td>
                <td style="padding:4px 0; font-size:14px; color:#111827; font-weight:600;">
                  <span style="background:#f4ece1; color:#4a1525; padding:2px 10px; border-radius:12px; font-size:13px; font-weight:700; display:inline-block;">
                    ${venue}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0; font-size:14px; color:#6b7280; vertical-align:top;"><strong>Event Occasion:</strong></td>
                <td style="padding:4px 0; font-size:14px; color:#111827; font-weight:600;">${eventType}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; font-size:14px; color:#6b7280; vertical-align:top;"><strong>Date &amp; Time:</strong></td>
                <td style="padding:4px 0; font-size:14px; color:#111827; font-weight:700;">
                  📅 ${eventDate} &nbsp;•&nbsp; ⏰ ${eventTime}
                </td>
              </tr>
            </table>
          </div>

          <!-- CARD 3: CAPACITY & BUDGET -->
          <div style="background:#ffffff; border:1px solid #e7ded4; border-left:4px solid #16a34a; border-radius:8px; padding:18px 20px; margin-bottom:16px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
            <div style="font-size:11px; font-weight:700; color:#16a34a; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px;">
              👥 Scale &amp; Budget
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:4px 0; font-size:14px; color:#6b7280; width:130px; vertical-align:top;"><strong>Expected Guests:</strong></td>
                <td style="padding:4px 0; font-size:14px; color:#111827; font-weight:700;">👥 ${guests} Guests</td>
              </tr>
              <tr>
                <td style="padding:4px 0; font-size:14px; color:#6b7280; vertical-align:top;"><strong>Estimated Budget:</strong></td>
                <td style="padding:4px 0; font-size:15px; color:#16a34a; font-weight:800;">💰 ${budget}</td>
              </tr>
            </table>
          </div>
          ` : ''}

          <!-- CARD 4: MESSAGE / SPECIAL REQUIREMENTS -->
          <div style="background:#faf8f5; border:1px solid #e7ded4; border-radius:8px; padding:18px 20px; margin-bottom:20px;">
            <div style="font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">
              📝 ${isContact ? 'Client Message' : 'Special Requirements & Notes'}
            </div>
            <div style="font-size:14px; color:#374151; line-height:1.6; white-space:pre-wrap;">
              ${requirements}
            </div>
          </div>

          <!-- QUICK ACTION BAR -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:10px;">
            <tr>
              <td align="center" style="padding:10px 0;">
                <a href="tel:${cleanPhone}" style="background:#4a1525; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:700; font-size:14px; display:inline-block; margin-right:8px; border:1px solid #2c0b15;">
                  📞 Call Client Now
                </a>
                ${email !== 'Not provided' ? `
                <a href="mailto:${email}" style="background:#ffffff; color:#4a1525; text-decoration:none; padding:12px 20px; border-radius:6px; font-weight:700; font-size:14px; display:inline-block; border:1px solid #4a1525;">
                  ✉️ Reply to Email
                </a>` : ''}
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f7f5f0; padding:16px 20px; text-align:center; border-top:1px solid #e7ded4; font-size:12px; color:#888;">
          <div style="margin-bottom:4px; font-weight:600; color:#4a1525;">Tripura Convention Hall &amp; Open Lawn</div>
          <div>Angadichittampalle, Chevella Road, Telangana 501503</div>
          <div style="margin-top:6px; color:#aaa; font-size:11px;">Automated inquiry captured from tripuraconvention.com</div>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>`.trim();
}

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY is not configured in server environment variables' });
    }

    const name = data.name || data.fullName || 'Customer';
    const venue = data.venue || 'Tripura Convention';
    const eventType = data.eventType || 'Event Inquiry';
    const isContactForm = Boolean(data.isContactForm);

    const subject = isContactForm
      ? `New Inquiry from ${name} - Tripura Convention`
      : `New ${venue} Booking Inquiry - ${name} (${eventType})`;

    const htmlContent = buildInquiryCardsHtml({
      name: name,
      phone: data.phone,
      email: data.email,
      venue: venue,
      eventType: eventType,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      guests: data.guests,
      budget: data.budget,
      requirements: data.requirements || data.message,
      isContactForm: isContactForm
    });

    const senderEmail = process.env.RESEND_FROM_EMAIL || 'Tripura Convention <onboarding@resend.dev>';
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'KamalKumar.doddi@gmail.com';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [recipientEmail],
        reply_to: data.email && data.email !== 'Not provided' ? data.email : undefined,
        subject: subject,
        html: htmlContent
      })
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({ error: result.message || 'Resend API failed' });
    }

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Serverless mail error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
