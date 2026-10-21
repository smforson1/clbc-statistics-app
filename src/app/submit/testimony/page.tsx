'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Church, CheckCircle2, Loader2, Mic2, Sparkles, Heart, Share2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SubmitTestimonyPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        testifier_name: '',
        contact_info: '',
        content: '',
        category: 'Breakthrough',
        share_preference: 'in_person' as 'in_person' | 'read_only',
        is_anonymous: false
    });

    const supabase = createClient();

    const categories = [
        'Breakthrough',
        'Divine Healing',
        'Academic Success',
        'Career & Business',
        'Financial Provision',
        'Salvation & Deliverance',
        'Family & Marriage',
        'Thanksgiving'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.content.trim()) {
            toast.error('Please share your testimony story');
            return;
        }

        setIsSubmitting(true);

        try {
            // First find default branch
            const { data: branchData } = await supabase
                .from('branches')
                .select('id')
                .limit(1)
                .single();

            const targetBranchId = branchData?.id;

            const { error } = await supabase
                .from('testimonies')
                .insert({
                    testifier_name: formData.is_anonymous ? 'Anonymous' : (formData.testifier_name.trim() || 'Anonymous'),
                    contact_info: formData.contact_info.trim() || null,
                    content: formData.content.trim(),
                    share_preference: formData.share_preference,
                    status: 'pending',
                    branch_id: targetBranchId
                });

            if (error) {
                throw error;
            }

            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit testimony. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] text-center p-12 bg-white overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#001D86] via-[#D5AB45] to-blue-600" />
                    <div className="bg-amber-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Sparkles className="h-10 w-10 text-[#D5AB45]" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Praise the Lord!</h2>
                    <p className="text-gray-500 mt-4 text-base leading-relaxed">
                        Thank you for sharing the mighty works of God! Your testimony will inspire faith in the hearts of many.
                    </p>
                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-2 text-[#001D86] font-bold text-sm">
                            <Church size={18} />
                            <span>Christ Love Breed Church</span>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-2xl h-11 border-gray-200 text-gray-600 text-xs font-bold"
                            onClick={() => {
                                setIsSubmitted(false);
                                setFormData({
                                    testifier_name: '',
                                    contact_info: '',
                                    content: '',
                                    category: 'Breakthrough',
                                    share_preference: 'in_person',
                                    is_anonymous: false
                                });
                            }}
                        >
                            Share Another Testimony
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Branding Banner */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#001D86] text-xs font-black tracking-wider uppercase mb-2">
                        <Church size={16} />
                        Christ Love Breed Church
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                        Share Your Testimony
                    </h1>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        "And they overcame him by the blood of the Lamb and by the word of their testimony." — Rev 12:11
                    </p>
                </div>

                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-[#001D86] via-[#D5AB45] to-blue-600" />
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="px-8 pt-8 pb-4">
                            <CardTitle className="text-lg font-bold text-gray-900">
                                Testimony Details
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-500">
                                Fill in what the Lord has done for you
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-8 space-y-6">
                            {/* Category Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Testimony Category
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat })}
                                            className={cn(
                                                "p-2.5 rounded-xl border text-xs font-bold transition-all text-center truncate",
                                                formData.category === cat
                                                    ? "bg-blue-50 border-[#001D86] text-[#001D86] shadow-xs"
                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Share Preference */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    How Would You Like to Share?
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, share_preference: 'in_person' })}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left",
                                            formData.share_preference === 'in_person'
                                                ? "bg-blue-50/80 border-[#001D86] text-[#001D86]"
                                                : "border-gray-100 text-gray-500 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#001D86] flex-shrink-0">
                                            <Mic2 size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-gray-900">In Person on Stage</p>
                                            <p className="text-[10px] text-gray-500">I would like to come up and testify</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, share_preference: 'read_only' })}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left",
                                            formData.share_preference === 'read_only'
                                                ? "bg-blue-50/80 border-[#001D86] text-[#001D86]"
                                                : "border-gray-100 text-gray-500 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                                            <Share2 size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-gray-900">Read on My Behalf</p>
                                            <p className="text-[10px] text-gray-500">Please read it from the pulpit</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Name & Anonymous */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Your Full Name
                                    </Label>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer font-medium select-none">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_anonymous}
                                            onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                                            className="rounded border-gray-300 text-[#001D86] focus:ring-[#001D86]"
                                        />
                                        Share Anonymously
                                    </label>
                                </div>

                                {!formData.is_anonymous && (
                                    <Input
                                        placeholder="e.g. Sister Abigail Mensah"
                                        className="h-11 rounded-xl bg-gray-50/50 border-gray-200 text-sm"
                                        value={formData.testifier_name}
                                        onChange={(e) => setFormData({ ...formData, testifier_name: e.target.value })}
                                    />
                                )}
                            </div>

                            {/* Contact Phone */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Contact Phone Number
                                </Label>
                                <Input
                                    placeholder="024 000 0000 (So leaders can coordinate with you)"
                                    className="h-11 rounded-xl bg-gray-50/50 border-gray-200 text-sm font-mono"
                                    value={formData.contact_info}
                                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                                />
                            </div>

                            {/* Content Story */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    What Did God Do For You? *
                                </Label>
                                <textarea
                                    required
                                    className="w-full min-h-[160px] p-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-[#001D86]/10 focus:border-[#001D86] transition-all outline-none resize-none text-gray-800 text-sm leading-relaxed"
                                    placeholder="Tell us your story... What challenge were you facing, how did God step in, and what is your word of gratitude?"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="px-8 pb-8 pt-2">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 bg-[#001D86] hover:bg-[#D5AB45] rounded-2xl text-base font-black shadow-xl hover:shadow-2xl transition-all text-white gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Submitting Praise Report...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-1" size={18} />
                                        Submit Testimony to Church
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
