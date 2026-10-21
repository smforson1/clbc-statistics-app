'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MessageCircle,
    Mail,
    Phone,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    Users
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BroadcastRecord {
    id: string;
    message_type: 'whatsapp' | 'email' | 'sms';
    subject?: string;
    body: string;
    recipients: Array<{
        id: string;
        name: string;
        contact: string;
        status: 'sent' | 'failed' | 'queued' | 'skipped';
        error?: string;
        externalId?: string;
        provider?: string;
    }>;
    status: string;
    sent_at: string;
}

interface BroadcastDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: BroadcastRecord | null;
    onRetryFailed?: (record: BroadcastRecord) => void;
}

export function BroadcastDetailsModal({
    isOpen,
    onClose,
    record,
    onRetryFailed
}: BroadcastDetailsModalProps) {
    if (!isOpen || !record) return null;

    const recipients = record.recipients || [];
    const sentRecipients = recipients.filter(r => r.status === 'sent');
    const failedRecipients = recipients.filter(r => r.status === 'failed');

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'whatsapp':
                return <MessageCircle size={18} className="text-green-600" />;
            case 'email':
                return <Mail size={18} className="text-blue-600" />;
            default:
                return <Phone size={18} className="text-gray-600" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col rounded-3xl p-6 bg-white shadow-2xl border-none">
                <DialogHeader className="space-y-3 pb-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center",
                                record.message_type === 'whatsapp' ? "bg-green-50" :
                                    record.message_type === 'email' ? "bg-blue-50" : "bg-gray-100"
                            )}>
                                {getChannelIcon(record.message_type)}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900 capitalize">
                                    {record.message_type} Broadcast Details
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Clock size={12} />
                                    Sent on {record.sent_at ? format(new Date(record.sent_at), 'PPP p') : 'Unknown date'}
                                </DialogDescription>
                            </div>
                        </div>

                        <Badge className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold uppercase",
                            record.status === 'sent' ? "bg-green-100 text-green-700" :
                                record.status === 'partially_sent' ? "bg-amber-100 text-amber-700" :
                                    "bg-red-100 text-red-700"
                        )}>
                            {record.status.replace('_', ' ')}
                        </Badge>
                    </div>

                    {/* Stats summary banner */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-center">
                            <span className="text-[11px] font-bold text-gray-400 uppercase">Total</span>
                            <p className="text-lg font-black text-gray-900">{recipients.length}</p>
                        </div>
                        <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-center">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase">Delivered</span>
                            <p className="text-lg font-black text-emerald-700">{sentRecipients.length}</p>
                        </div>
                        <div className="bg-red-50/60 p-3 rounded-2xl border border-red-100 text-center">
                            <span className="text-[11px] font-bold text-red-600 uppercase">Failed</span>
                            <p className="text-lg font-black text-red-700">{failedRecipients.length}</p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 py-3 pr-1">
                    {/* Subject (for email) */}
                    {record.subject && (
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Subject Line</label>
                            <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                {record.subject}
                            </p>
                        </div>
                    )}

                    {/* Message Body */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Message Content</label>
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {record.body}
                        </div>
                    </div>

                    {/* Recipient Breakdown */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Users size={12} /> Recipient Breakdown ({recipients.length})
                            </label>
                        </div>

                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                            {recipients.map((r, i) => (
                                <div key={i} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors">
                                    <div className="min-w-0 pr-2">
                                        <p className="font-bold text-gray-900 truncate">{r.name}</p>
                                        <p className="text-gray-400 font-mono text-[11px] truncate">{r.contact}</p>
                                        {r.error && (
                                            <p className="text-red-500 text-[10px] mt-0.5 truncate flex items-center gap-1">
                                                <AlertCircle size={10} /> {r.error}
                                            </p>
                                        )}
                                    </div>

                                    <Badge variant="outline" className={cn(
                                        "capitalize px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0",
                                        r.status === 'sent' ? "bg-green-50 text-green-700 border-green-200" :
                                            r.status === 'queued' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                "bg-red-50 text-red-700 border-red-200"
                                    )}>
                                        {r.status === 'sent' ? <CheckCircle2 size={10} className="mr-1" /> :
                                            r.status === 'failed' ? <XCircle size={10} className="mr-1" /> : null}
                                        {r.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100 flex-shrink-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-xl border-gray-200"
                    >
                        Close
                    </Button>

                    {failedRecipients.length > 0 && onRetryFailed && (
                        <Button
                            onClick={() => {
                                onClose();
                                onRetryFailed(record);
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-2 shadow-sm"
                        >
                            <RefreshCw size={14} /> Retry {failedRecipients.length} Failed Recipients
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
