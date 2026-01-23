'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
    Plus,
    Trash2,
    GripVertical,
    Settings2,
    Eye,
    Save,
    Rocket,
    ChevronLeft,
    Type,
    Hash,
    CheckSquare,
    List,
    Calendar as CalendarIcon,
    Clock,
    Mail,
    Phone,
    HelpCircle,
    LayoutTemplate,
    User,
    CheckCircle2,
    Home,
    Mic2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FieldType = 'text' | 'number' | 'email' | 'phone' | 'date' | 'time' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'boolean';

interface FormField {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    helpText?: string;
}

const fieldTypes: { type: FieldType, icon: any, label: string }[] = [
    { type: 'text', icon: Type, label: 'Text Input' },
    { type: 'textarea', icon: List, label: 'Long Text' },
    { type: 'number', icon: Hash, label: 'Number' },
    { type: 'email', icon: Mail, label: 'Email' },
    { type: 'phone', icon: Phone, label: 'Phone' },
    { type: 'date', icon: CalendarIcon, label: 'Date' },
    { type: 'time', icon: Clock, label: 'Time' },
    { type: 'boolean', icon: CheckSquare, label: 'Yes/No' },
    { type: 'select', icon: List, label: 'Dropdown' },
    { type: 'radio', icon: List, label: 'Multiple Choice' },
];

const templates = [
    {
        id: 'clbc-knust-connect',
        title: 'CLBC-KNUST Connect',
        description: 'Specialized intake form for KNUST freshers, continuiing students, and alumni.',
        icon: Rocket,
        fields: [
            { id: 'cat', type: 'radio', label: 'I am a...', required: true, options: ['Fresher', 'Continuing Student', 'Alumnus'] },
            { id: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
            { id: 'phone', type: 'phone', label: 'Phone Number', required: true, placeholder: '050 000 0000' },
            { id: 'course', type: 'text', label: 'Field/Course of Study', required: true, placeholder: 'e.g. Computer Science' },
            { id: 'residence', type: 'text', label: 'Hall or Hostel of Residence', required: false, placeholder: 'e.g. Valco Hall' },
            { id: 'grad_year', type: 'number', label: 'Graduation Year (Alumni only)', required: false, placeholder: '2024' },
            { id: 'prayer', type: 'textarea', label: 'Prayer Request', required: false, placeholder: 'How can we pray with you?' },
        ] as FormField[]
    },
    {
        id: 'prayer-request',
        title: 'Prayer Request',
        description: 'Simple form to collect prayer needs from members.',
        icon: HelpCircle,
        fields: [
            { id: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'Your name' },
            { id: 'phone', type: 'phone', label: 'Phone Number', required: false },
            { id: 'request', type: 'textarea', label: 'Prayer Request', required: true, placeholder: 'Tell us how we can pray...' },
        ] as FormField[]
    },
    {
        id: 'simple-attendance',
        title: 'Simple Attendance',
        description: 'Quick check-in form for services and meetings.',
        icon: CheckCircle2,
        fields: [
            { id: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
            { id: 'status', type: 'radio', label: 'Attendance Status', required: true, options: ['Present', 'Excused'] },
            { id: 'notes', type: 'text', label: 'Brief Note (Optional)', required: false, placeholder: 'Any reason for late arrival, etc.' },
        ] as FormField[]
    },
    {
        id: 'member-onboarding',
        title: 'Detailed Member Info',
        description: 'Comprehensive personal information form for new and existing members.',
        icon: User,
        fields: [
            { id: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'First Name & Last Name' },
            { id: 'dob', type: 'date', label: 'Date of Birth', required: true, helpText: 'We need this to celebrate you on your birthday!' },
            { id: 'gender', type: 'radio', label: 'Gender', required: true, options: ['Male', 'Female'] },
            { id: 'phone', type: 'phone', label: 'Primary Phone Number', required: true, placeholder: '024 000 0000' },
            { id: 'email', type: 'email', label: 'Email Address', required: false, placeholder: 'yourname@example.com' },
            { id: 'address', type: 'text', label: 'Residential Address', required: false, placeholder: 'e.g. Plot 12, Sobolo St.' },
            { id: 'ministry', type: 'select', label: 'Department/Ministry', required: false, options: ['Media', 'Worship/Choir', 'Ushering', 'Protocol', 'Intercession', 'Children', 'None yet'] },
            { id: 'emergency_contact', type: 'text', label: 'Emergency Contact Name & Phone', required: false },
        ] as FormField[]
    },
    {
        id: 'testimony-submission',
        title: 'Testimony Submission',
        description: 'Share your testimony with the church.',
        icon: Mic2,
        fields: [
            { id: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'Your name' },
            { id: 'contact', type: 'phone', label: 'Contact Number', required: true, placeholder: 'So we can reach you' },
            { id: 'testimony', type: 'textarea', label: 'Share Your Story', required: true, placeholder: 'Type your testimony here...' },
            { id: 'preference', type: 'radio', label: 'How would you like to share?', required: true, options: ['I want to share in person', 'Please read it for me'] },
        ] as FormField[]
    }
];

export default function CreateFormPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState('Sunday Service');
    const [eventDate, setEventDate] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);
    const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(true);
    const [activeTab, setActiveTab] = useState('builder');
    const [isSaving, setIsSaving] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const loadTemplate = (template: typeof templates[0]) => {
        setTitle(template.title);
        setDescription(template.description);
        setFields(template.fields.map(f => ({ ...f, id: Math.random().toString(36).substr(2, 9) })));
        setShowTemplateModal(false);
        toast.success(`Loaded ${template.title} template`);
    };

    const addField = (type: FieldType) => {
        const newField: FormField = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            required: false,
            placeholder: '',
            options: ['Option 1', 'Option 2'],
        };
        setFields([...fields, newField]);
        toast.success(`Added ${type} field`);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const saveForm = async (status: 'draft' | 'active') => {
        if (!title) {
            toast.error('Form title is required');
            return;
        }

        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        const formPayload = {
            title,
            description,
            event_type: eventType,
            event_date: eventDate || null,
            status,
            form_schema: fields,
            allow_multiple_submissions: allowMultipleSubmissions,
            created_by: user?.id,
        };

        const { error } = await supabase
            .from('forms')
            .insert(formPayload);

        if (error) {
            console.error('Supabase Error:', error);
            toast.error(`Failed to save: ${error.message || 'Unknown error'}`);
        } else {
            toast.success(status === 'active' ? 'Form published successfully!' : 'Form saved as draft');
            router.push('/forms');
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Form</h1>
                        <p className="text-sm text-gray-500">Design your form and share it with members</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => saveForm('draft')} disabled={isSaving}>
                        <Save size={18} className="mr-2" />
                        Save Draft
                    </Button>
                    <Button
                        className="bg-[#001D86] hover:bg-[#D5AB45] shadow-md hover:shadow-lg rounded-xl transition-all"
                        onClick={() => saveForm('active')}
                        disabled={isSaving}
                    >
                        <Rocket size={18} className="mr-2" />
                        Publish Form
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="builder" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-6">
                    <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        <TabsTrigger value="builder" className="rounded-lg gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-[#001D86]">
                            <Settings2 size={16} /> Builder
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="rounded-lg gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
                            <Eye size={16} /> Preview
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="builder" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Form Info & Fields */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50/50 flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-lg">Form Details</CardTitle>
                                    </div>
                                    <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-xl border-[#001D86] text-[#001D86] hover:bg-blue-50">
                                                <LayoutTemplate size={16} className="mr-2" />
                                                Browse Templates
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl rounded-3xl">
                                            <DialogHeader>
                                                <DialogTitle>Form Templates</DialogTitle>
                                                <DialogDescription>
                                                    Start quickly with one of our pre-designed form structures.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                {templates.map((template) => (
                                                    <Card
                                                        key={template.id}
                                                        className="cursor-pointer hover:ring-2 hover:ring-[#001D86] transition-all border-gray-100 shadow-none hover:shadow-md rounded-2xl group"
                                                        onClick={() => loadTemplate(template)}
                                                    >
                                                        <CardContent className="p-5">
                                                            <div className="flex items-start gap-4">
                                                                <div className="p-3 bg-blue-50 rounded-xl text-[#001D86] group-hover:bg-[#001D86] group-hover:text-white transition-colors">
                                                                    <template.icon size={24} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900">{template.title}</h4>
                                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Form Title</Label>
                                            <Input
                                                placeholder="e.g. Sunday Service Attendance"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Event Type</Label>
                                            <select
                                                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#001D86] appearance-none"
                                                value={eventType}
                                                onChange={(e) => setEventType(e.target.value)}
                                            >
                                                <option>Sunday Service</option>
                                                <option>Midweek Service</option>
                                                <option>Special Event</option>
                                                <option>Youth Meeting</option>
                                                <option>Prayer Meeting</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Event Date</Label>
                                            <Input
                                                type="date"
                                                value={eventDate}
                                                onChange={(e) => setEventDate(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mt-2">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold text-[#001D86]">Submission Limit</Label>
                                                <p className="text-xs text-gray-500">Allow members to fill this form more than once?</p>
                                            </div>
                                            <Switch
                                                checked={allowMultipleSubmissions}
                                                onCheckedChange={setAllowMultipleSubmissions}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Short Description (Optional)</Label>
                                        <Input
                                            placeholder="Members will see this below the title"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Current Fields ({fields.length})</h3>
                                </div>

                                {fields.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <Plus className="mx-auto h-12 w-12 text-gray-300" />
                                        <p className="mt-2 text-gray-500">Your form is empty. Add fields from the right panel.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <Card key={field.id} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:ring-2 hover:ring-blue-100 transition-all">
                                                <CardContent className="p-4 sm:p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-2 cursor-grab active:cursor-grabbing text-gray-300">
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                                <div className="flex-1 w-full space-y-1">
                                                                    <Label className="text-xs text-gray-400 font-bold uppercase">Field Label</Label>
                                                                    <Input
                                                                        value={field.label}
                                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                                        className="border-none bg-gray-50 focus-visible:ring-[#001D86] font-medium"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-4 pt-4 sm:pt-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <Label className="text-xs font-bold text-gray-400 uppercase">Required</Label>
                                                                        <Switch
                                                                            checked={field.required}
                                                                            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-gray-400 hover:text-red-500 rounded-full"
                                                                        onClick={() => removeField(field.id)}
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-gray-400 font-bold uppercase">Placeholder</Label>
                                                                    <Input
                                                                        placeholder="Placeholder text..."
                                                                        value={field.placeholder}
                                                                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                                        className="h-8 text-sm"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-gray-400 font-bold uppercase">Type: <Badge variant="secondary" className="ml-1 text-[10px]">{field.type}</Badge></Label>
                                                                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                                                                        <div className="space-y-2 mt-2">
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {(field.options || []).map((option, optIndex) => (
                                                                                    <div key={optIndex} className="flex items-center bg-blue-50 text-[#001D86] pl-3 pr-1 py-1 rounded-full text-xs font-bold border border-blue-100 group/opt">
                                                                                        {option}
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const newOptions = [...(field.options || [])];
                                                                                                newOptions.splice(optIndex, 1);
                                                                                                updateField(field.id, { options: newOptions });
                                                                                            }}
                                                                                            className="ml-2 p-1 hover:bg-blue-200 rounded-full transition-colors"
                                                                                        >
                                                                                            <Trash2 size={12} className="text-[#001D86]" />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <Input
                                                                                    placeholder="Add option..."
                                                                                    className="h-8 text-xs rounded-lg"
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            e.preventDefault();
                                                                                            const val = (e.target as HTMLInputElement).value.trim();
                                                                                            if (val) {
                                                                                                updateField(field.id, { options: [...(field.options || []), val] });
                                                                                                (e.target as HTMLInputElement).value = '';
                                                                                            }
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Field Toolbox */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-sm rounded-3xl bg-white sticky top-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Add Fields</CardTitle>
                                    <CardDescription>Click to add any field type</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 grid grid-cols-1 gap-2">
                                    {fieldTypes.map((item) => (
                                        <Button
                                            key={item.type}
                                            variant="ghost"
                                            className="justify-start gap-4 h-12 px-4 rounded-xl hover:bg-blue-50 hover:text-[#001D86] group transition-all"
                                            onClick={() => addField(item.type)}
                                        >
                                            <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-blue-100 group-hover:text-[#001D86] transition-colors">
                                                <item.icon size={18} />
                                            </div>
                                            <span className="font-semibold text-sm">{item.label}</span>
                                            <Plus size={16} className="ml-auto opacity-0 group-hover:opacity-100 text-blue-400" />
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Tips Card */}
                            <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-[#001D86] to-blue-900 text-white p-6">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <HelpCircle size={18} /> Pro Tip
                                </h4>
                                <p className="text-sm opacity-90 leading-relaxed">
                                    Focus on collecting the most important data. Too many fields can reduce the completion rate from members.
                                </p>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                    <div className="max-w-2xl mx-auto py-12 px-4 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="text-center mb-10">
                            <div className="mx-auto h-12 w-12 bg-gradient-to-br from-[#001D86] to-blue-900 rounded-xl flex items-center justify-center text-white mb-4">
                                <Church className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{title || "Form Title"}</h2>
                            <p className="text-gray-500 mt-2">{description || "Form description will appear here..."}</p>
                        </div>

                        <div className="space-y-6">
                            {fields.map((field) => (
                                <div key={field.id} className="space-y-2">
                                    <Label className="text-base font-semibold">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </Label>
                                    {field.type === 'textarea' ? (
                                        <textarea className="w-full p-3 rounded-xl border border-gray-200 bg-white" placeholder={field.placeholder} rows={4} disabled />
                                    ) : field.type === 'select' ? (
                                        <select className="w-full h-12 p-3 rounded-xl border border-gray-200 bg-white appearance-none" disabled>
                                            <option>{field.placeholder || "Select an option"}</option>
                                            {(field.options || []).map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'radio' ? (
                                        <div className="space-y-2">
                                            {(field.options || ['Option 1', 'Option 2']).map((opt) => (
                                                <div key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                                    <span className="text-sm font-medium text-gray-700">{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : field.type === 'boolean' ? (
                                        <div className="flex gap-4">
                                            <Button variant="outline" className="flex-1 rounded-xl h-12" disabled>Yes</Button>
                                            <Button variant="outline" className="flex-1 rounded-xl h-12" disabled>No</Button>
                                        </div>
                                    ) : (
                                        <Input type={field.type} className="h-12 rounded-xl" placeholder={field.placeholder} disabled />
                                    )}
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <p className="text-center text-gray-400 italic">No fields added yet</p>
                            )}

                            <Button className="w-full h-14 bg-[#001D86] rounded-2xl text-lg font-bold shadow-lg opacity-50 cursor-not-allowed">
                                Submit Response
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Church({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2" />
            <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
            <path d="M18 22V5l-6-3-6 3v17" />
            <path d="M12 7v5" />
            <path d="M10 9h4" />
        </svg>
    );
}
