'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Church, CheckCircle2, Loader2, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PrayerRequestPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        requester_name: '',
        requester_email: '',
        request_content: '',
        category: 'General',
        is_anonymous: false,
        is_urgent: false
    });

    const supabase = createClient();

    const categories = ['General', 'Healing', 'Finances', 'Family', 'Deliverance', 'Career', 'Thanksgiving'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from('prayer_requests')
            .insert({
                requester_name: formData.is_anonymous ? 'Anonymous' : formData.requester_name,
                requester_email: formData.requester_email,
                request_content: formData.request_content,
                category: formData.category,
                is_anonymous: formData.is_anonymous,
                is_urgent: formData.is_urgent,
            });

        if (error) {
            toast.error('Failed to submit your request. Please try again.');
        } else {
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setIsSubmitting(false);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] text-center p-12 bg-white overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#001D86] to-blue-600" />
                    <div className="bg-amber-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-12 w-12 text-amber-600 fill-amber-600/20" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Request Received</h2>
                    <p className="text-gray-500 mt-4 text-lg">
                        Thank you for sharing your prayer request. Our intercession team will be praying with you.
                    </p>
                    <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-2 text-[#001D86] font-bold">
                            <Church size={20} />
                            <span>Christ Love Breed Church</span>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-2xl h-12 border-gray-200 text-gray-600"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Submit another request
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100 via-white to-blue-50">
            <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 text-white">
                        <Sparkles size={32} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Prayer Request</h1>
                        <p className="text-amber-600 font-bold uppercase tracking-widest text-xs">Christ Love Breed Church</p>
                    </div>
                    <p className="text-gray-600 max-w-sm mx-auto">"For where two or three are gathered together in my name, there am I in the midst of them."</p>
                </div>

                <Card className="border-none shadow-2xl rounded-[2rem] bg-white/90 backdrop-blur-md overflow-hidden">
                    <CardHeader className="bg-white/50 border-b border-gray-50 px-8 py-6">
                        <CardTitle className="text-lg font-bold">Share your burden with us</CardTitle>
                        <CardDescription>Our prayer team reviews every request</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-gray-700">Category</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-sm font-semibold transition-all border",
                                                    formData.category === cat
                                                        ? "bg-amber-600 border-amber-600 text-white shadow-md scale-105"
                                                        : "bg-white border-gray-200 text-gray-500 hover:border-amber-200"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {!formData.is_anonymous && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700">Your Name</Label>
                                        <Input
                                            required
                                            placeholder="Enter your name"
                                            className="h-12 rounded-xl"
                                            value={formData.requester_name}
                                            onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-gray-700">Email (Optional)</Label>
                                    <Input
                                        type="email"
                                        placeholder="To receive a message when we pray"
                                        className="h-12 rounded-xl"
                                        value={formData.requester_email}
                                        onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-gray-700">Your Request</Label>
                                    <textarea
                                        required
                                        className="w-full p-4 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none resize-none min-h-[150px]"
                                        placeholder="Tell us what you would like us to pray for..."
                                        value={formData.request_content}
                                        onChange={(e) => setFormData({ ...formData, request_content: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                            checked={formData.is_anonymous}
                                            onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-gray-700 text-left">Submit anonymously</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/30 cursor-pointer hover:bg-red-50/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                                            checked={formData.is_urgent}
                                            onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold text-red-700 text-left">This is urgent</span>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button
                                type="submit"
                                className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[1.5rem] text-xl font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Send Prayer Request'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
