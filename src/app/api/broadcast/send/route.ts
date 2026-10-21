import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendSMS } from '@/lib/broadcast/sms';
import { sendEmailWithResend } from '@/lib/broadcast/email';
import { sendWhatsAppViaTwilio } from '@/lib/broadcast/whatsapp';
import { personalizeMessage } from '@/lib/broadcast/utils';

interface RecipientInput {
    id: string;
    name: string;
    phone?: string;
    email?: string;
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
        }

        // Fetch user's profile and branch info
        const { data: profile } = await supabase
            .from('profiles')
            .select('branch_id, branch:branches(name)')
            .eq('id', user.id)
            .single();

        const branchId = profile?.branch_id;
        const churchName = (profile?.branch as any)?.name || 'Christ Love Breed Church';

        if (!branchId) {
            return NextResponse.json({ error: 'No branch associated with your profile.' }, { status: 400 });
        }

        const bodyData = await req.json();
        const {
            messageType,
            subject,
            body,
            recipients = [],
            whatsappMode = 'automated',
            senderId
        } = bodyData as {
            messageType: 'sms' | 'email' | 'whatsapp';
            subject?: string;
            body: string;
            recipients: RecipientInput[];
            whatsappMode?: 'automated' | 'web';
            senderId?: string;
        };

        if (!messageType || !['sms', 'email', 'whatsapp'].includes(messageType)) {
            return NextResponse.json({ error: 'Invalid or missing message type.' }, { status: 400 });
        }

        if (!body || !body.trim()) {
            return NextResponse.json({ error: 'Message body cannot be empty.' }, { status: 400 });
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'At least one recipient must be specified.' }, { status: 400 });
        }

        // Dispatch loop
        const results: Array<{
            id: string;
            name: string;
            contact: string;
            status: 'sent' | 'failed' | 'queued';
            error?: string;
            externalId?: string;
            provider?: string;
        }> = [];

        let sentCount = 0;
        let failedCount = 0;

        for (const recipient of recipients) {
            const personalizedBody = personalizeMessage(body, {
                fullname: recipient.name,
                churchName: churchName,
                branchName: churchName
            });

            if (messageType === 'sms') {
                const phone = recipient.phone || '';
                if (!phone) {
                    failedCount++;
                    results.push({
                        id: recipient.id,
                        name: recipient.name,
                        contact: 'No Phone',
                        status: 'failed',
                        error: 'Missing phone number'
                    });
                    continue;
                }

                const res = await sendSMS({ to: phone, body: personalizedBody, senderId });
                if (res.success) {
                    sentCount++;
                    results.push({
                        id: recipient.id,
                        name: recipient.name,
                        contact: phone,
                        status: 'sent',
                        externalId: res.id,
                        provider: res.provider
                    });
                } else {
                    failedCount++;
                    results.push({
                        id: recipient.id,
                        name: recipient.name,
                        contact: phone,
                        status: 'failed',
                        error: res.error,
                        provider: res.provider
                    });
                }
            } else if (messageType === 'email') {
                const email = recipient.email || '';
                if (!email) {
                    failedCount++;
                    results.push({
                        id: recipient.id,
                        name: recipient.name,
                        contact: 'No Email',
                        status: 'failed',
                        error: 'Missing email address'
                    });
                    continue;
                }

                const emailSubject = subject?.trim() || `${churchName} Announcement`;
                const res = await sendEmailWithResend({
                    to: email,
                    recipientName: recipient.name,
                    subject: emailSubject,
                    body: personalizedBody,
                    churchName: churchName
                });

                if (res.success) {
                    sentCount++;
                    results.push({
                        id: recipient.id,
                        name: recipient.name,
                        contact: email,
                        status: 'sent',
                        externalId: res.id,
                        provider: 'resend'
                    });
                } else {
                    failedCount++;
                    results.push({
                        id: recipient.id,
                        name: recipient.name,
                        contact: email,
                        status: 'failed',
                        error: res.error,
                        provider: 'resend'
                    });
                }
            } else if (messageType === 'whatsapp') {
                const phone = recipient.phone || '';
                if (!phone) {
                    failedCount++;
                    results.push({
                        id: recipient.id,
                        name: recipient.name,
                        contact: 'No Phone',
                        status: 'failed',
                        error: 'Missing phone number'
                    });
                    continue;
                }

                if (whatsappMode === 'automated') {
                    const res = await sendWhatsAppViaTwilio({ to: phone, body: personalizedBody });
                    if (res.success) {
                        sentCount++;
                        results.push({
                            id: recipient.id,
                            name: recipient.name,
                            contact: phone,
                            status: 'sent',
                            externalId: res.id,
                            provider: 'twilio_whatsapp'
                        });
                    } else {
                        failedCount++;
                        results.push({
                            id: recipient.id,
                            name: recipient.name,
                            contact: phone,
                            status: 'failed',
                            error: res.error,
                            provider: 'twilio_whatsapp'
                        });
                    }
                } else {
                    // Web queue mode
                    sentCount++;
                    results.push({
                        id: recipient.id,
                        name: recipient.name,
                        contact: phone,
                        status: 'queued',
                        provider: 'whatsapp_web'
                    });
                }
            }
        }

        // Determine overarching message status
        let overallStatus = 'sent';
        if (failedCount === recipients.length) {
            overallStatus = 'failed';
        } else if (failedCount > 0) {
            overallStatus = 'partially_sent';
        } else if (whatsappMode === 'web' && messageType === 'whatsapp') {
            overallStatus = 'queued';
        }

        // Save record into Supabase messages table
        const { data: savedMessage, error: insertError } = await supabase
            .from('messages')
            .insert({
                message_type: messageType,
                subject: subject || null,
                body: body,
                recipients: results,
                status: overallStatus,
                branch_id: branchId,
                created_by: user.id,
                sent_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error('Failed to log message into messages table:', insertError);
        }

        return NextResponse.json({
            success: overallStatus !== 'failed',
            messageId: savedMessage?.id,
            status: overallStatus,
            summary: {
                total: recipients.length,
                sent: sentCount,
                failed: failedCount
            },
            results: results
        });

    } catch (err: any) {
        console.error('Broadcast API route error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
