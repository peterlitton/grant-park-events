// Generate Email HTML from Campaign Data
// Consolidates events by title and creates MailerLite-compatible HTML

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { campaign, events: rawEvents } = await req.json();
    const events = rawEvents || [];
    
    console.log('[API] Generating email HTML for campaign:', campaign.internalName);
    console.log('[API] Processing', events.length, 'events');
    
    // Consolidate events by title
    const consolidated = {};
    events.forEach(event => {
      if (!consolidated[event.title]) {
        consolidated[event.title] = [];
      }
      consolidated[event.title].push(event);
    });
    
    // Sort consolidated events by earliest date
    const sortedTitles = Object.keys(consolidated).sort((a, b) => {
      const dateA = consolidated[a][0].date;
      const dateB = consolidated[b][0].date;
      return dateA.localeCompare(dateB);
    });
    
    console.log('[API] Consolidated into', sortedTitles.length, 'unique events');
    
    // Format date and time
    const formatDateTime = (dateStr, timeStr) => {
      const date = new Date(dateStr + 'T00:00:00');
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      
      const dayName = days[date.getDay()];
      const monthName = months[date.getMonth()];
      const day = date.getDate();
      
      return `${dayName}, ${monthName} ${day}, ${timeStr}`;
    };
    
    // Build event HTML
    let eventsHtml = '';
    sortedTitles.forEach((title, index) => {
      const eventInstances = consolidated[title];
      const isLastEvent = (index === sortedTitles.length - 1);
      const bottomPadding = isLastEvent ? '40px' : '5px';
      
      eventsHtml += `
        <tr>
          <td align="center" style="padding: 10px 30px ${bottomPadding};">
            <h2 style="color: #d32f2f; font-size: 26px; margin: 0 0 2px; font-weight: bold;">${title}</h2>
            <div style="margin: 0;">
      `;
      
      // Add each date/time as a link
      eventInstances.forEach(evt => {
        const formattedDate = formatDateTime(evt.date, evt.time);
        let timeDisplay = formattedDate;
        if (evt.endTime) {
          const startLower = evt.time.toLowerCase();
          const endLower = evt.endTime.toLowerCase();
          const bothPm = startLower.includes('pm') && endLower.includes('pm');
          const bothAm = startLower.includes('am') && endLower.includes('am');
          if (bothPm || bothAm) {
            const cleanStart = formatDateTime(evt.date, evt.time.replace(/\s*(am|pm)/i, ''));
            timeDisplay = `${cleanStart} - ${evt.endTime}`;
          } else {
            timeDisplay = `${formattedDate} - ${evt.endTime}`;
          }
        }
        const eventUrl = `https://www.grantparkevents.com/events/${evt.urlSlug}`;
        
        eventsHtml += `
              <a href="${eventUrl}" style="display: block; margin: 3px 0; color: #1976d2; text-decoration: none; font-size: 18px;">
                ${timeDisplay}
              </a>
        `;
      });
      
      eventsHtml += `
            </div>
          </td>
        </tr>
      `;
    });
    
    // Full HTML email template
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaign.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">
        <!-- Main Container (Build10.27: responsive width for mobile) -->
        <table cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px;">
          
          <!-- Header: Logo Left, QR Right (Build10.27.2: reduced side padding) -->
          <tr>
            <td style="padding: 20px 15px; background-color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle" width="50%" style="background-color: #ffffff;">
                    <a href="https://www.grantparkevents.com" target="_blank" style="text-decoration: none; background-color: #ffffff;">
                      <img src="https://www.grantparkevents.com/assets/common/gpe-logo-email.png" alt="Grant Park Events" width="266" style="display: block;">
                    </a>
                  </td>
                  <td align="right" valign="middle" width="50%">
                    <!-- QR Code -->
                    <img src="https://www.grantparkevents.com/assets/common/poster-qr-code.png?v=2.3.0" alt="Scan for events" width="66" height="66" style="display: block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Hero Image (Build10.27: linked to homepage, conditional) -->
          ${campaign.heroImage ? `<tr>
            <td>
              <a href="https://www.grantparkevents.com" target="_blank" style="text-decoration: none;">
                <img src="https://www.grantparkevents.com/.netlify/functions/images/${campaign.heroImage}" alt="" width="600" style="display: block; width: 100%; height: auto;">
              </a>
            </td>
          </tr>` : ''}
          
          <!-- Headline (Centered) -->
          <tr>
            <td align="center" style="padding: 30px 20px ${campaign.text && campaign.text.replace(/<[^>]*>/g, '').trim() ? '10px' : '20px'};">
              <h1 style="margin: 0; color: #333333; font-size: 28px; font-weight: bold;">${campaign.headline}</h1>
            </td>
          </tr>
          
          ${campaign.text && campaign.text.replace(/<[^>]*>/g, '').trim() ? `<!-- Text (Build10.26, Build10.27: larger font for mobile) -->
          <tr>
            <td align="left" style="padding: 0 30px 20px;">
              <div style="color: #555555; font-size: 18px; line-height: 1.5;">${campaign.text}</div>
            </td>
          </tr>` : ''}
          
          <!-- Events Section Headline (Build10.33) -->
          <tr>
            <td align="center" style="padding: 20px 30px 10px;">
              <h1 style="margin: 0; color: #333333; font-size: 22px; font-weight: bold;">This Week's Events</h1>
            </td>
          </tr>
          
          <!-- Events List (Centered) -->
          ${eventsHtml}
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 30px 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 4px; color: #999999; font-size: 13px; font-weight: bold;">Grant Park Events</p>
              <p style="margin: 0 0 4px; color: #999999; font-size: 12px;">65 E Monroe St, Chicago</p>
              <p style="margin: 0 0 12px; color: #999999; font-size: 12px;">United States of America</p>
              <p style="margin: 0; color: #bbbbbb; font-size: 11px; font-style: italic;">You received this email because you signed up on the website or have attended a Grant Park event.</p>
              <p style="margin: 8px 0 0; font-size: 11px;"><a href="{$unsubscribe}" style="color: #999999;">Unsubscribe</a></p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    console.log('[API] ✅ Email HTML generated');
    
    return new Response(JSON.stringify({ html }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[ERROR] Generating email HTML:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to generate email', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
