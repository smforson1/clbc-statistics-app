import twilio from 'twilio';
import { formatPhoneNumber } from './utils';

export interface SendSMSParams {
    to: string;
    body: string;
    senderId?: string;
}

export async function sendSMS({
    to,
    body,
    senderId
}: SendSMSParams): Promise<{ success: boolean; id?: string; provider: string; error?: string }> {
    const formattedPhone = formatPhoneNumber(to);

    if (!formattedPhone) {
        return {
            success: false,
            provider: 'none',
            error: 'Invalid or missing phone number'
        };
    }

    // 1. Check for Arkesel (popular Ghana SMS gateway with alphanumeric sender IDs like 'CLBC')
    if (process.env.ARKESEL_API_KEY) {
        try {
            const arkeselSender = senderId || process.env.ARKESEL_SENDER_ID || 'CLBC';
            const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
                method: 'POST',
                headers: {
                    'api-key': process.env.ARKESEL_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: arkeselSender,
                    message: body,
                    recipients: [formattedPhone.replace('+', '')] // Arkesel expects 233xxxxxxxxx without +
                })
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                return { success: true, id: data.data?.[0]?.id || 'arkesel-ok', provider: 'arkesel' };
            } else {
                return { success: false, provider: 'arkesel', error: data.message || 'Arkesel SMS delivery failed' };
            }
        } catch (err: any) {
            return { success: false, provider: 'arkesel', error: err.message || 'Arkesel network error' };
        }
    }

    // 2. Check for mNotify (another top Ghana SMS gateway)
    if (process.env.MNOTIFY_API_KEY) {
        try {
            const mnotifySender = senderId || process.env.MNOTIFY_SENDER_ID || 'CLBC';
            const response = await fetch(`https://api.mnotify.com/api/sms/quick?key=${process.env.MNOTIFY_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: [formattedPhone.replace('+', '')],
                    sender: mnotifySender,
                    message: body,
                    is_schedule: false
                })
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                return { success: true, id: data.summary?.[0]?.id || 'mnotify-ok', provider: 'mnotify' };
            } else {
                return { success: false, provider: 'mnotify', error: data.message || 'mNotify SMS delivery failed' };
            }
        } catch (err: any) {
            return { success: false, provider: 'mnotify', error: err.message || 'mNotify network error' };
        }
    }

    // 3. Twilio SMS Gateway (Configured in .env.local)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
        return {
            success: false,
            provider: 'twilio',
            error: 'Twilio credentials not fully configured in .env.local (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)'
        };
    }

    try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages.create({
            body: body,
            from: fromPhone,
            to: formattedPhone
        });

        return {
            success: true,
            id: message.sid,
            provider: 'twilio'
        };
    } catch (err: any) {
        return {
            success: false,
            provider: 'twilio',
            error: err.message || 'Twilio SMS failed to dispatch'
        };
    }
}
