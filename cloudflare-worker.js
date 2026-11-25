/**
 * Cloudflare Worker for Tripura Convention (Luxury HTML Card Emails via Resend)
 * 
 * Setup in 2 minutes:
 * 1. Log in to Cloudflare Dashboard -> Workers & Pages -> Create Application -> Create Worker.
 * 2. Paste this entire code into the worker editor and click "Deploy".
 * 3. Go to Worker Settings -> Variables & Secrets -> Add Secret:
 *    - Name: RESEND_API_KEY
 *    - Value: your_resend_api_key (from https://resend.com)
 *    Optional Secret:
 *    - RESEND_FROM_EMAIL (e.g. "Tripura Convention <inquiries@tripuraconvention.com>" or default "Tripura Convention <onboarding@resend.dev>")
 *    - RECIPIENT_EMAIL (default "Tripuraconvention9696@gmail.com")
 * 4. Copy your worker URL (e.g. https://tripura-mail.your-subdomain.workers.dev) and paste it into script.js!
 */

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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#0f172a;">
  <div style="background-color:#f8fafc; padding:32px 16px; min-height:100%;">
    
    <!-- MAIN CONTAINER -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 20px rgba(15, 23, 42, 0.04);">
      
      <!-- TOP HEADER BAR -->
      <tr>
        <td style="padding:24px 28px; border-bottom:1px solid #f1f5f9;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align:middle;">
                <div style="font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#6366f1; margin-bottom:4px;">
                  TRIPURA CONVENTION
                </div>
                <h1 style="margin:0; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.01em;">
                  ${isContact ? 'New Client Message' : 'New Booking Inquiry'}
                </h1>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="display:inline-block; background:#eef2ff; color:#4f46e5; border:1px solid #e0e7ff; border-radius:9999px; padding:6px 14px; font-size:12px; font-weight:600;">
                  ${eventType}${venue !== 'Tripura Convention' ? ` • ${venue}` : ''}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td style="padding:24px 28px;">

          ${!isContact ? `
          <!-- KEY METRICS ROW (DASHBOARD KPI CARDS) -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
            <tr>
              <!-- METRIC 1: EVENT DATE -->
              <td width="32%" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; vertical-align:top;">
                <div style="font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px;">
                  Event Date
                </div>
                <div style="font-size:16px; font-weight:700; color:#0f172a;">
                  ${eventDate}
                </div>
              </td>
              <td width="2%"></td>
              <!-- METRIC 2: GUESTS -->
              <td width="32%" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; vertical-align:top;">
                <div style="font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px;">
                  Expected Guests
                </div>
                <div style="font-size:18px; font-weight:700; color:#0f172a;">
                  ${guests}
                </div>
              </td>
              <td width="2%"></td>
              <!-- METRIC 3: BUDGET -->
              <td width="32%" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:14px 16px; vertical-align:top;">
                <div style="font-size:11px; font-weight:600; color:#15803d; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px;">
                  Est. Budget
                </div>
                <div style="font-size:18px; font-weight:700; color:#16a34a;">
                  ${budget}
                </div>
              </td>
            </tr>
          </table>
          ` : ''}

          <!-- SECTION 1: CLIENT OVERVIEW -->
          <div style="border:1px solid #e2e8f0; border-radius:12px; padding:18px 20px; margin-bottom:16px; background:#ffffff;">
            <div style="font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:14px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
              Client Details
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:5px 0; font-size:13px; color:#64748b; width:120px;">Full Name</td>
                <td style="padding:5px 0; font-size:14px; color:#0f172a; font-weight:600;">${name}</td>
              </tr>
              <tr>
                <td style="padding:5px 0; font-size:13px; color:#64748b;">Phone Number</td>
                <td style="padding:5px 0; font-size:14px;">
                  <a href="tel:${cleanPhone}" style="color:#4f46e5; font-weight:600; text-decoration:none;">
                    ${phone}
                  </a>
                </td>
              </tr>
              ${email !== 'Not provided' ? `
              <tr>
                <td style="padding:5px 0; font-size:13px; color:#64748b;">Email Address</td>
                <td style="padding:5px 0; font-size:14px;">
                  <a href="mailto:${email}" style="color:#0f172a; text-decoration:underline;">${email}</a>
                </td>
              </tr>` : ''}
            </table>
          </div>

          ${!isContact ? `
          <!-- SECTION 2: VENUE & OCCASION -->
          <div style="border:1px solid #e2e8f0; border-radius:12px; padding:18px 20px; margin-bottom:16px; background:#ffffff;">
            <div style="font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:14px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
              Event Overview
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:5px 0; font-size:13px; color:#64748b; width:120px;">Venue Space</td>
                <td style="padding:5px 0; font-size:14px; color:#0f172a; font-weight:600;">
                  <span style="background:#f1f5f9; color:#334155; padding:3px 10px; border-radius:6px; font-size:13px; font-weight:600;">
                    ${venue}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:5px 0; font-size:13px; color:#64748b;">Occasion</td>
                <td style="padding:5px 0; font-size:14px; color:#0f172a; font-weight:600;">${eventType}</td>
              </tr>
            </table>
          </div>
          ` : ''}

          <!-- SECTION 3: NOTES / MESSAGE -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px 20px; margin-bottom:24px;">
            <div style="font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">
              ${isContact ? 'Message' : 'Special Requirements'}
            </div>
            <div style="font-size:14px; color:#334155; line-height:1.6; white-space:pre-wrap;">${requirements}</div>
          </div>

          <!-- ACTION BUTTONS -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="left">
                <a href="tel:${cleanPhone}" style="background:#4f46e5; color:#ffffff; text-decoration:none; padding:11px 22px; border-radius:8px; font-weight:600; font-size:14px; display:inline-block; margin-right:10px;">
                  Call Client
                </a>
                ${email !== 'Not provided' ? `
                <a href="mailto:${email}" style="background:#ffffff; color:#334155; text-decoration:none; padding:10px 20px; border-radius:8px; font-weight:600; font-size:14px; display:inline-block; border:1px solid #cbd5e1;">
                  Send Email
                </a>` : ''}
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f8fafc; padding:18px 24px; text-align:center; border-top:1px solid #e2e8f0; font-size:12px; color:#64748b;">
          <div style="margin-bottom:4px; font-weight:700; color:#0f172a;">Tripura Convention Hall &amp; Open Lawn</div>
          <div>Angadichittampalle, Chevella Road, Telangana 501503</div>
          <div style="margin-top:6px; color:#94a3b8; font-size:11px;">Automated inquiry captured from tripuraconvention.com</div>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>
`.trim();
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const data = await request.json();
      const apiKey = env.RESEND_API_KEY;

      if (!apiKey) {
        return new Response(JSON.stringify({ error: "RESEND_API_KEY secret is not set in Worker settings" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const name = data.name || data.fullName || 'Customer';
      const venue = data.venue || 'Tripura Convention';
      const eventType = data.eventType || 'Event Inquiry';
      const isContactForm = Boolean(data.isContactForm);

      const subject = isContactForm 
        ? `New Inquiry from ${name} - Tripura Convention` 
        : `New ${venue} Booking Inquiry - ${name} (${eventType})`;

      const htmlContent = buildInquiryCardsHtml({
        name,
        phone: data.phone,
        email: data.email,
        venue,
        eventType,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        guests: data.guests,
        budget: data.budget,
        requirements: data.requirements || data.message,
        isContactForm
      });

      const senderEmail = env.RESEND_FROM_EMAIL || "Tripura Convention <onboarding@resend.dev>";
      const recipientEmail = env.RECIPIENT_EMAIL || "Tripuraconvention9696@gmail.com";

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
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
        return new Response(JSON.stringify({ error: result.message || "Resend API error" }), {
          status: resendResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
