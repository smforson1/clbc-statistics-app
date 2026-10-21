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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User, Phone, Mail, MapPin, Calendar, Cake,
    MessageCircle, Edit2, Trash2, Check, X, Shield,
    Heart, Save, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';
import { buildWhatsAppWebUrl } from '@/lib/broadcast/utils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MemberProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: any | null;
    onUpdated: () => void;
    onDeleted: () => void;
}

export function MemberProfileModal({
    isOpen,
    onClose,
    member,
    onUpdated,
    onDeleted
}: MemberProfileModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const supabase = createClient();

    if (!isOpen || !member) return null;

    const handleStartEdit = () => {
        setEditData({
            full_name: member.full_name || '',
            phone: member.phone || '',
            email: member.email || '',
            address: member.address || '',
            gender: member.gender || 'Male',
            membership_status: member.membership_status || 'active',
            date_of_birth: member.date_of_birth || '',
            notes: member.notes || ''
        });
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!editData.full_name.trim()) {
            toast.error('Member name cannot be empty');
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('members')
                .update({
                    full_name: editData.full_name,
                    phone: editData.phone || null,
                    email: editData.email || null,
                    address: editData.address || null,
                    gender: editData.gender || null,
                    membership_status: editData.membership_status,
                    date_of_birth: editData.date_of_birth || null,
                    notes: editData.notes || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', member.id);

            if (error) throw error;

            toast.success('Member profile updated successfully');
            setIsEditing(false);
            onUpdated();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update member profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMember = async () => {
        if (!confirm(`Are you sure you want to remove ${member.full_name} from the database?`)) return;

        try {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', member.id);

            if (error) throw error;

            toast.success('Member removed');
            onClose();
            onDeleted();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete member');
        }
    };

    const handleWhatsApp = () => {
        if (!member.phone) return;
        const firstName = member.full_name.split(' ')[0] || member.full_name;
        const msg = `Hello ${firstName}, grace and peace from Christ Love Breed Church! Hope you are having a wonderful and blessed week!`;
        const url = buildWhatsAppWebUrl(member.phone, msg);
        window.open(url, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setIsEditing(false); onClose(); } }}>
            <DialogContent className="sm:max-w-[620px] rounded-3xl p-6 bg-white shadow-2xl border-none">
                <DialogHeader className="space-y-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#001D86] to-blue-800 text-white flex items-center justify-center font-black text-xl shadow-md">
                                {member.full_name.charAt(0)}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-gray-900">
                                    {member.full_name}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                    <span>Joined {member.join_date ? format(new Date(member.join_date), 'MMM yyyy') : 'Unknown'}</span>
                                    <span>•</span>
                                    <span className="capitalize">{member.gender || 'Member'}</span>
                                </DialogDescription>
                            </div>
                        </div>

                        <Badge className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold capitalize",
                            member.membership_status === 'active' ? "bg-green-100 text-green-700" :
                                member.membership_status === 'first_timer' ? "bg-purple-100 text-purple-700" :
                                    "bg-gray-100 text-gray-700"
                        )}>
                            {member.membership_status?.replace('_', ' ') || 'Active'}
                        </Badge>
                    </div>

                    {/* Quick Contact Action Bar */}
                    <div className="flex items-center gap-2 pt-1">
                        {member.phone && (
                            <Button
                                size="sm"
                                onClick={handleWhatsApp}
                                className="h-9 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold gap-1.5 shadow-xs"
                            >
                                <MessageCircle size={15} /> WhatsApp
                            </Button>
                        )}

                        {member.phone && (
                            <a href={`tel:${member.phone}`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 rounded-xl border-gray-200 text-gray-700 text-xs font-bold gap-1.5 hover:bg-gray-50"
                                >
                                    <Phone size={14} /> Call
                                </Button>
                            </a>
                        )}

                        {member.email && (
                            <a href={`mailto:${member.email}`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 rounded-xl border-gray-200 text-gray-700 text-xs font-bold gap-1.5 hover:bg-gray-50"
                                >
                                    <Mail size={14} /> Email
                                </Button>
                            </a>
                        )}

                        <div className="ml-auto">
                            {!isEditing ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleStartEdit}
                                    className="h-9 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 gap-1.5"
                                >
                                    <Edit2 size={14} /> Edit Details
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(false)}
                                    className="h-9 rounded-xl text-xs font-bold text-gray-400 gap-1.5"
                                >
                                    <X size={14} /> Cancel Edit
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Body Content */}
                <div className="py-2 space-y-4">
                    {!isEditing ? (
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Phone Number
                                </span>
                                <p className="font-mono text-gray-900 font-semibold">{member.phone || 'None'}</p>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Email Address
                                </span>
                                <p className="text-gray-900 font-semibold truncate">{member.email || 'None'}</p>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Residence / Hall / Hostel
                                </span>
                                <p className="text-gray-900 font-semibold">{member.address || 'Not specified'}</p>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Date of Birth
                                </span>
                                <p className="text-gray-900 font-semibold">
                                    {member.date_of_birth ? format(new Date(member.date_of_birth), 'MMMM d, yyyy') : 'Not recorded'}
                                </p>
                            </div>

                            {/* Pastoral Notes */}
                            <div className="col-span-2 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Pastoral Notes & Remarks
                                </span>
                                <p className="text-gray-700 text-xs leading-relaxed">
                                    {member.notes || 'No notes on file for this member.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Edit Form */
                        <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-gray-700">Full Name</Label>
                                <Input
                                    value={editData.full_name}
                                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                    className="h-9 text-xs rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-gray-700">Phone Number</Label>
                                    <Input
                                        value={editData.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                        className="h-9 text-xs rounded-xl font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-gray-700">Email Address</Label>
                                    <Input
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="h-9 text-xs rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-gray-700">Hall / Hostel Residence</Label>
                                    <Input
                                        value={editData.address}
                                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                        className="h-9 text-xs rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-gray-700">Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={editData.date_of_birth}
                                        onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                                        className="h-9 text-xs rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-gray-700">Membership Status</Label>
                                    <select
                                        className="w-full h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-xs outline-none"
                                        value={editData.membership_status}
                                        onChange={(e) => setEditData({ ...editData, membership_status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="first_timer">First Timer</option>
                                        <option value="convert">New Convert</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-gray-700">Gender</Label>
                                    <select
                                        className="w-full h-9 px-2.5 rounded-xl border border-gray-200 bg-white text-xs outline-none"
                                        value={editData.gender}
                                        onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-bold text-gray-700">Pastoral Notes</Label>
                                <textarea
                                    className="w-full min-h-[60px] p-2.5 rounded-xl border border-gray-200 bg-white text-xs outline-none resize-none"
                                    value={editData.notes}
                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteMember}
                        className="text-red-600 hover:bg-red-50 text-xs font-bold gap-1 rounded-xl"
                    >
                        <Trash2 size={14} /> Remove Member
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} className="rounded-xl">
                            Close
                        </Button>
                        {isEditing && (
                            <Button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="bg-[#001D86] hover:bg-[#D5AB45] rounded-xl font-bold gap-1 text-white"
                            >
                                <Save size={14} /> Save Changes
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
