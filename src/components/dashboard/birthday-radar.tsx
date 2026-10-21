'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Cake,
    MessageCircle,
    Phone,
    Send,
    Sparkles,
    Calendar,
    ChevronRight,
    Heart,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { buildWhatsAppWebUrl } from '@/lib/broadcast/utils';
import { cn } from '@/lib/utils';

interface BirthdayMember {
    id: string;
    full_name: string;
    phone?: string;
    date_of_birth: string;
    daysUntil: number;
    formattedDate: string;
    turningAge?: number;
}

export function BirthdayRadar() {
    const [birthdays, setBirthdays] = useState<BirthdayMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
    const [sentStatus, setSentStatus] = useState<Record<string, boolean>>({});

    const supabase = createClient();

    useEffect(() => {
        fetchUpcomingBirthdays();
    }, []);

    const fetchUpcomingBirthdays = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('members')
                .select('id, full_name, phone, date_of_birth')
                .not('date_of_birth', 'is', null);

            if (error || !data) {
                setBirthdays([]);
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const currentYear = today.getFullYear();

            const upcomingList: BirthdayMember[] = [];

            data.forEach(m => {
                if (!m.date_of_birth) return;

                const dob = new Date(m.date_of_birth);
                if (isNaN(dob.getTime())) return;

                // Candidate birthday this year
                let nextBday = new Date(currentYear, dob.getMonth(), dob.getDate());
                if (nextBday < today) {
                    // Birthday already passed this year, check next year
                    nextBday = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
                }

                const diffTime = nextBday.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Include if within the next 30 days
                if (diffDays <= 30) {
                    const turningAge = nextBday.getFullYear() - dob.getFullYear();
                    upcomingList.push({
                        id: m.id,
                        full_name: m.full_name,
                        phone: m.phone,
                        date_of_birth: m.date_of_birth,
                        daysUntil: diffDays,
                        formattedDate: nextBday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                        turningAge: turningAge > 0 ? turningAge : undefined
                    });
                }
            });

            // Sort by nearest birthday
            upcomingList.sort((a, b) => a.daysUntil - b.daysUntil);
            setBirthdays(upcomingList.slice(0, 5)); // Top 5 upcoming
        } catch (err) {
            console.error('Error fetching birthdays:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendWhatsApp = (member: BirthdayMember) => {
        if (!member.phone) {
            toast.error(`${member.full_name} has no phone number registered`);
            return;
        }

        const firstName = member.full_name.split(' ')[0] || member.full_name;
        const msg = `Happy Birthday ${firstName}! 🎂🎉\n\nThe pastoral leadership and congregation of Christ Love Breed Church celebrate God's immense grace upon your life today! May this new chapter usher you into supernatural favor, vibrant health, and extraordinary testimonies in Jesus' name! Have a glorious celebration! ✨`;

        const url = buildWhatsAppWebUrl(member.phone, msg);
        window.open(url, '_blank');
        setSentStatus(prev => ({ ...prev, [member.id]: true }));
        toast.success(`Opened WhatsApp greeting for ${member.full_name}`);
    };

    const handleSendSMS = async (member: BirthdayMember) => {
        if (!member.phone) {
            toast.error(`${member.full_name} has no phone number registered`);
            return;
        }

        setSendingSmsId(member.id);
        const firstName = member.full_name.split(' ')[0] || member.full_name;
        const msg = `Happy Birthday ${firstName}! CLBC celebrates God's immense grace upon your life today. May this new year bring overflowing testimonies and supernatural open doors! Have a blessed day!`;

        try {
            const res = await fetch('/api/broadcast/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageType: 'sms',
                    body: msg,
                    recipients: [{ id: member.id, name: member.full_name, phone: member.phone }]
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Birthday SMS sent to ${member.full_name}!`);
                setSentStatus(prev => ({ ...prev, [member.id]: true }));
            } else {
                toast.error(data.error || 'Failed to send SMS');
            }
        } catch (err: any) {
            toast.error(err.message || 'Network error sending SMS');
        } finally {
            setSendingSmsId(null);
        }
    };

    return (
        <Card className="shadow-sm border-none bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-gray-100 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                            <Cake size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                                Birthday Radar
                                <Sparkles size={14} className="text-[#D5AB45]" />
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Upcoming celebrants in the next 30 days
                            </CardDescription>
                        </div>
                    </div>

                    <Badge className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
                        {birthdays.length} Upcoming
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
                {isLoading ? (
                    <div className="text-center py-8">
                        <Loader2 className="mx-auto h-6 w-6 text-amber-600 animate-spin mb-2" />
                        <p className="text-xs text-gray-400">Scanning birthday calendar...</p>
                    </div>
                ) : birthdays.length === 0 ? (
                    <div className="text-center py-10">
                        <Cake className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-sm font-semibold text-gray-700">No birthdays in the next 30 days</p>
                        <p className="text-xs text-gray-400 mt-0.5">Ensure members have dates of birth recorded</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {birthdays.map(member => {
                            const isToday = member.daysUntil === 0;
                            const isTomorrow = member.daysUntil === 1;

                            return (
                                <div
                                    key={member.id}
                                    className={cn(
                                        "p-3 rounded-2xl border transition-all flex items-center justify-between gap-3",
                                        isToday ? "bg-amber-50 border-amber-300 shadow-xs" : "bg-white hover:bg-gray-50 border-gray-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0",
                                            isToday ? "bg-amber-500 text-white animate-pulse" : "bg-amber-100 text-amber-800"
                                        )}>
                                            {isToday ? 'TODAY' : member.formattedDate}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-gray-900 truncate">
                                                {member.full_name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className={cn(
                                                    "font-semibold text-[11px]",
                                                    isToday ? "text-amber-700 font-black" : isTomorrow ? "text-blue-600" : "text-gray-400"
                                                )}>
                                                    {isToday ? '🎉 Celebrating Today!' : isTomorrow ? 'Tomorrow' : `In ${member.daysUntil} days`}
                                                </span>
                                                {member.phone && (
                                                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                                                        • {member.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {sentStatus[member.id] ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] gap-1 px-2 py-1">
                                                <CheckCircle2 size={12} /> Blessed
                                            </Badge>
                                        ) : (
                                            <>
                                                {member.phone && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSendWhatsApp(member)}
                                                        className="h-8 px-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold gap-1 shadow-xs"
                                                        title="Send WhatsApp Birthday Message"
                                                    >
                                                        <MessageCircle size={14} />
                                                        <span className="hidden sm:inline">WhatsApp</span>
                                                    </Button>
                                                )}

                                                {member.phone && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSendSMS(member)}
                                                        disabled={sendingSmsId === member.id}
                                                        className="h-8 px-2.5 rounded-xl border-gray-200 text-gray-700 text-xs font-bold gap-1 hover:bg-gray-100"
                                                        title="Send Birthday SMS"
                                                    >
                                                        {sendingSmsId === member.id ? (
                                                            <Loader2 size={13} className="animate-spin" />
                                                        ) : (
                                                            <Send size={13} />
                                                        )}
                                                        <span className="hidden sm:inline">SMS</span>
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
