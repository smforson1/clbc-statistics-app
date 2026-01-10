'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Church, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PublicFormPage() {
    const { id } = useParams();
    const [form, setForm] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const supabase = createClient();

    useEffect(() => {
        fetchForm();
    }, [id]);

    const fetchForm = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data || data.status !== 'active') {
            setForm(null);
        } else {
            setForm(data);

            // Check for previous submission if multiple submissions are not allowed
            if (data.allow_multiple_submissions === false) {
                const hasSubmitted = localStorage.getItem(`submitted_${id}`);
                if (hasSubmitted) {
                    setAlreadySubmitted(true);
                }
            }

            // Initialize form data
            const initialData: Record<string, any> = {};
            data.form_schema.forEach((field: any) => {
                initialData[field.id] = field.type === 'boolean' ? false : '';
            });
            setFormData(initialData);
        }
        setIsLoading(false);
    };

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from('form_responses')
            .insert({
                form_id: id,
                response_data: formData,
                submitted_at: new Date().toISOString(),
            });

        if (error) {
            toast.error('Failed to submit form. Please try again.');
        } else {
            if (form.allow_multiple_submissions === false) {
                localStorage.setItem(`submitted_${id}`, 'true');
            }
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 text-[#001D86] animate-spin" />
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="max-w-md w-full border-none shadow-xl rounded-3xl text-center p-8">
                    <AlertCircle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Form Not Available</h2>
                    <p className="text-gray-500 mt-2">This form may have been closed or is no longer active.</p>
                    <Button
                        className="mt-6 w-full rounded-2xl bg-gray-900"
                        onClick={() => window.location.reload()}
                    >
                        Refresh
                    </Button>
                </Card>
            </div>
        );
    }

    if (alreadySubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] text-center p-12 bg-white overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 to-orange-600" />
                    <div className="bg-amber-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-12 w-12 text-amber-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Already Submitted</h2>
                    <p className="text-gray-500 mt-4 text-lg">
                        You have already submitted a response for <strong>{form.title}</strong>.
                        This form is limited to one response per person.
                    </p>
                    <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-2 text-[#001D86] font-bold">
                            <Church size={20} />
                            <span>Christ Love Breed Church</span>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
                <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] text-center p-12 bg-white overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#001D86] to-blue-600" />
                    <div className="bg-green-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Success!</h2>
                    <p className="text-gray-500 mt-4 text-lg">
                        Thank you for filling out the <strong>{form.title}</strong>. Your response has been recorded.
                    </p>
                    <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-2 text-[#001D86] font-bold">
                            <Church size={20} />
                            <span>Christ Love Breed Church</span>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-2xl h-12 border-gray-200 text-gray-600"
                            onClick={() => window.location.reload()}
                        >
                            Submit another response
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-amber-50">
            <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="mx-auto h-24 w-24 bg-white p-1 rounded-full flex items-center justify-center shadow-xl transform rotate-3 overflow-hidden border-4 border-white">
                        <img src="/clbc-logo.jpg" alt="CLBC Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-[#001D86] tracking-tight">{form.title}</h1>
                        <p className="font-bold uppercase tracking-widest text-xs text-[#D5AB45]">Christ Love Breed Church</p>
                    </div>
                    {form.description && (
                        <p className="text-gray-600 max-w-sm mx-auto">{form.description}</p>
                    )}
                </div>

                <Card className="border-none shadow-2xl rounded-[2rem] bg-white/90 backdrop-blur-md overflow-hidden">
                    <CardHeader className="bg-white/50 border-b border-gray-50 px-8 py-6">
                        <CardTitle className="text-lg font-bold">Please provide your details</CardTitle>
                        <CardDescription>Fields marked with * are required</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-8 space-y-8">
                            {form.form_schema.map((field: any) => (
                                <div key={field.id} className="space-y-2 group">
                                    <Label className="text-base font-bold text-gray-800 flex items-center gap-1 group-focus-within:text-[#001D86] transition-colors">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </Label>

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            className="w-full p-4 rounded-2xl border border-gray-200 bg-white/50 focus:ring-4 focus:ring-[#001D86]/10 focus:border-[#001D86] transition-all outline-none resize-none"
                                            placeholder={field.placeholder}
                                            rows={4}
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    ) : field.type === 'boolean' ? (
                                        <div className="flex gap-4">
                                            <Button
                                                type="button"
                                                variant={formData[field.id] === true ? 'default' : 'outline'}
                                                className={cn(
                                                    "flex-1 h-14 rounded-2xl text-lg font-bold transition-all",
                                                    formData[field.id] === true ? "bg-[#001D86] border-none shadow-lg scale-105 text-white" : "border-gray-200 bg-white text-gray-400"
                                                )}
                                                onClick={() => handleInputChange(field.id, true)}
                                            >
                                                Yes
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={formData[field.id] === false ? 'default' : 'outline'}
                                                className={cn(
                                                    "flex-1 h-14 rounded-2xl text-lg font-bold transition-all",
                                                    formData[field.id] === false ? "bg-gray-800 border-none shadow-lg scale-105" : "border-gray-200 bg-white text-gray-400"
                                                )}
                                                onClick={() => handleInputChange(field.id, false)}
                                            >
                                                No
                                            </Button>
                                        </div>
                                    ) : field.type === 'select' || field.type === 'radio' ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {(field.options || ['Option 1', 'Option 2']).map((option: string) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    className={cn(
                                                        "w-full text-left p-4 rounded-2xl border-2 transition-all font-semibold flex items-center justify-between",
                                                        formData[field.id] === option
                                                            ? "border-[#001D86] bg-blue-50 text-[#001D86]"
                                                            : "border-gray-100 bg-gray-50/50 text-gray-600 hover:border-gray-200"
                                                    )}
                                                    onClick={() => handleInputChange(field.id, option)}
                                                >
                                                    {option}
                                                    {formData[field.id] === option && <CheckCircle2 size={18} />}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <Input
                                            type={field.type}
                                            className="h-14 rounded-2xl border-gray-200 bg-white/50 px-6 text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-[#001D86] transition-all"
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        />
                                    )}
                                    {field.helpText && <p className="text-xs text-gray-400 pl-1">{field.helpText}</p>}
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button
                                type="submit"
                                className="w-full h-16 bg-[#001D86] hover:bg-[#D5AB45] text-white rounded-[1.5rem] text-xl font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit My Response'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <div className="text-center space-y-2">
                    <p className="text-xs text-gray-400 font-medium">Your response is secure and private.</p>
                    <p className="text-[10px] text-gray-300 uppercase tracking-tighter">Powered by CLBC Statistics Division</p>
                </div>
            </div>
        </div>
    );
}
