import { Resend } from 'resend';

export interface SendEmailParams {
    to: string;
    recipientName: string;
    subject: string;
    body: string;
    churchName?: string;
}

export function generateEmailHtml({
    recipientName,
    subject,
    body,
    churchName = 'Christ Love Breed Church'
}: {
    recipientName: string;
    subject: string;
    body: string;
    churchName?: string;
}): string {
    // Convert newlines in body to paragraph breaks
    const formattedBody = body
        .split('\n\n')
        .map(paragraph => `<p style="margin-bottom: 16px; line-height: 1.6; color: #374151; font-size: 15px;">${paragraph.replace(/\n/g, '<br/>')}</p>`)
        .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px 0;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #001D86 0%, #1e3a8a 100%); padding: 36px 32px; text-align: left;">
              <div style="font-size: 12px; font-weight: 700; color: #D5AB45; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">Official Broadcast</div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${churchName}</h1>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 16px 0;">Hello ${recipientName || 'Beloved'},</h2>
              
              <div style="margin-bottom: 28px;">
                ${formattedBody}
              </div>

              <div style="border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 28px;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e3a8a;">Blessings,</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">${churchName} Secretariat</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                You are receiving this communication as a registered member/visitor of ${churchName}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
}

export async function sendEmailWithResend({
    to,
    recipientName,
    subject,
    body,
    churchName
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        return {
            success: false,
            error: 'RESEND_API_KEY is not set in .env.local. Please add your Resend API key to send live emails.'
        };
    }

    try {
        const resend = new Resend(apiKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'CLBC <onboarding@resend.dev>';

        const html = generateEmailHtml({
            recipientName,
            subject,
            body,
            churchName
        });

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            return {
                success: false,
                error: error.message || 'Resend failed to deliver email'
            };
        }

        return {
            success: true,
            id: data?.id
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Unexpected email error'
        };
    }
}
