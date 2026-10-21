import twilio from 'twilio';
import { formatPhoneNumber } from './utils';

export interface SendWhatsAppParams {
    to: string;
    body: string;
}

/**
 * Builds a direct WhatsApp Web / app link for manual or hybrid sending
 */
export function buildWhatsAppWebUrl(phone: string, message: string): string {
    const formatted = formatPhoneNumber(phone).replace('+', '');
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${formatted}?text=${encoded}`;
}

/**
 * Automated WhatsApp dispatch via Twilio WhatsApp API
 */
export async function sendWhatsAppViaTwilio({
    to,
    body
}: SendWhatsAppParams): Promise<{ success: boolean; id?: string; error?: string }> {
    const formattedPhone = formatPhoneNumber(to);

    if (!formattedPhone) {
        return {
            success: false,
            error: 'Invalid phone number for WhatsApp'
        };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Default Twilio sandbox

    if (!accountSid || !authToken) {
        return {
            success: false,
            error: 'Twilio credentials not configured in .env.local'
        };
    }

    try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages.create({
            body: body,
            from: fromWhatsApp.startsWith('whatsapp:') ? fromWhatsApp : `whatsapp:${fromWhatsApp}`,
            to: `whatsapp:${formattedPhone}`
        });

        return {
            success: true,
            id: message.sid
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Twilio WhatsApp sending failed'
        };
    }
}
