'use client';

import { useState } from 'react';
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
    ExternalLink,
    CheckCircle2,
    SkipForward,
    ArrowRight,
    User,
    Phone,
    Copy,
    Check
} from 'lucide-react';
import { buildWhatsAppWebUrl } from '@/lib/broadcast/utils';
import { toast } from 'sonner';

interface RecipientItem {
    id: string;
    name: string;
    phone?: string;
    email?: string;
}

interface WhatsAppQueueModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipients: RecipientItem[];
    rawMessage: string;
    churchName: string;
    onCompleted: (results: any[]) => void;
}

export function WhatsAppQueueModal({
    isOpen,
    onClose,
    recipients,
    rawMessage,
    churchName,
    onCompleted
}: WhatsAppQueueModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sentStatus, setSentStatus] = useState<Record<string, 'sent' | 'skipped'>>({});
    const [copied, setCopied] = useState(false);

    if (!isOpen || recipients.length === 0) return null;

    const currentRecipient = recipients[currentIndex];
    const total = recipients.length;
    const progressPercent = Math.round(((currentIndex) / total) * 100);

    // Personalize for current recipient
    const name = currentRecipient?.name || 'Beloved';
    const firstName = name.split(' ')[0] || name;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const personalizedText = rawMessage
        .replace(/{fullname}/gi, name)
        .replace(/{firstname}/gi, firstName)
        .replace(/{name}/gi, name)
        .replace(/{church}/gi, churchName)
        .replace(/{branch}/gi, churchName)
        .replace(/{date}/gi, dateStr);

    const handleOpenWhatsApp = () => {
        if (!currentRecipient.phone) {
            toast.error('This recipient does not have a phone number');
            return;
        }

        const url = buildWhatsAppWebUrl(currentRecipient.phone, personalizedText);
        window.open(url, '_blank');

        // Mark as sent
        setSentStatus(prev => ({ ...prev, [currentRecipient.id]: 'sent' }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(personalizedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Message copied to clipboard');
    };

    const handleNext = () => {
        if (currentIndex < total - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishQueue();
        }
    };

    const handleSkip = () => {
        setSentStatus(prev => ({ ...prev, [currentRecipient.id]: 'skipped' }));
        if (currentIndex < total - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishQueue();
        }
    };

    const finishQueue = () => {
        const results = recipients.map(r => ({
            id: r.id,
            name: r.name,
            contact: r.phone || 'No Phone',
            status: sentStatus[r.id] === 'sent' ? 'sent' : 'skipped',
            provider: 'whatsapp_web'
        }));
        onCompleted(results);
        onClose();
        toast.success(`WhatsApp queue completed! (${Object.values(sentStatus).filter(s => s === 'sent').length} dispatched)`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[550px] rounded-3xl p-6 bg-white shadow-2xl border-none">
                <DialogHeader className="space-y-2 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                                <MessageCircle size={22} />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                    WhatsApp Web Dispatcher
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-500">
                                    Send personalized messages directly through WhatsApp Web
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
                            {currentIndex + 1} of {total}
                        </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{progressPercent}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-300 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </DialogHeader>

                {/* Recipient Details */}
                <div className="space-y-4 py-2">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#001D86] font-bold">
                                {currentRecipient.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{currentRecipient.name}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                                    <Phone size={12} />
                                    {currentRecipient.phone || 'No Phone Number'}
                                </p>
                            </div>
                        </div>

                        {sentStatus[currentRecipient.id] === 'sent' && (
                            <Badge className="bg-green-50 text-green-700 border border-green-200 gap-1">
                                <CheckCircle2 size={12} /> Sent
                            </Badge>
                        )}
                    </div>

                    {/* Message Preview */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Personalized Message Preview
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7 text-xs text-gray-500 hover:text-gray-900 gap-1 px-2"
                            >
                                {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                {copied ? 'Copied' : 'Copy Text'}
                            </Button>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto custom-scrollbar font-sans">
                            {personalizedText}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="rounded-xl border-gray-200 text-gray-600 gap-1 sm:w-auto"
                    >
                        <SkipForward size={14} /> Skip
                    </Button>

                    <Button
                        onClick={handleOpenWhatsApp}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md gap-2 flex-1"
                    >
                        <ExternalLink size={16} /> Open WhatsApp Web
                    </Button>

                    <Button
                        onClick={handleNext}
                        className="bg-[#001D86] hover:bg-blue-900 text-white rounded-xl gap-1 sm:w-auto"
                    >
                        {currentIndex < total - 1 ? (
                            <>Next <ArrowRight size={14} /></>
                        ) : (
                            <>Finish Queue</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
