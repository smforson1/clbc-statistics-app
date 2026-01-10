'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import {
    Download,
    Copy,
    Share2,
    MessageCircle,
    Mail,
    ChevronLeft,
    Printer,
    Church,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function QRPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const qrRef = useRef<SVGSVGElement>(null);
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

        if (error) {
            toast.error('Failed to fetch form details');
            router.push('/forms');
        } else {
            setForm(data);
        }
        setIsLoading(false);
    };

    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const origin = window.location.origin;
            setShareUrl(`${origin}/submit/${id}`);
        }
    }, [id]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    };

    const downloadQR = () => {
        if (!qrRef.current) return;

        const svgData = new XMLSerializer().serializeToString(qrRef.current);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${form.title}-qr.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const shareWhatsApp = () => {
        const message = `Please fill out the ${form.title} for Christ Love Breed Church: ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001D86]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 print:hidden">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ChevronLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">QR Code & Sharing</h1>
                    <p className="text-sm text-gray-500">Invite members to fill the form</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
                {/* QR Code Display Card */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col items-center p-8 print:shadow-none print:p-0 print:m-0 print:rounded-none">
                    <div className="w-full text-center mb-6 space-y-2">
                        <div className="mx-auto h-12 w-12 bg-gradient-to-br from-[#001D86] to-[#D5AB45] rounded-xl flex items-center justify-center text-white mb-2 shadow-lg print:hidden">
                            <Church size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 print:text-3xl print:mb-2">{form.title}</h2>
                        <p className="text-xs text-gray-400 font-medium tracking-widest uppercase print:text-sm print:text-gray-600">Christ Love Breed Church</p>
                    </div>

                    <div className="relative p-6 bg-white rounded-3xl shadow-inner border-8 border-gray-50 mb-4 group hover:scale-105 transition-transform duration-500 print:border-none print:shadow-none print:p-0 print:mb-2">
                        <QRCodeSVG
                            ref={qrRef}
                            value={shareUrl}
                            size={256}
                            level="H"
                            includeMargin={true}
                            className="print:w-[400px] print:h-[400px]"
                            imageSettings={{
                                src: "/clbc-logo.jpg",
                                x: undefined,
                                y: undefined,
                                height: 48,
                                width: 48,
                                excavate: true,
                            }}
                        />
                        <div className="absolute inset-x-0 -bottom-4 flex justify-center print:hidden">
                            <Badge className="bg-gradient-to-r from-[#001D86] to-[#D5AB45] px-4 py-1 rounded-full shadow-lg border-2 border-white">
                                SCAN TO FILL
                            </Badge>
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        <p className="text-[#001D86] font-bold text-lg">https://bit.ly/3YSsQq9</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Short Link</p>
                    </div>

                    <div className="w-full flex gap-3 mt-4 print:hidden">
                        <Button onClick={downloadQR} className="flex-1 rounded-2xl h-12 bg-gray-900 hover:bg-black gap-2">
                            <Download size={18} /> PNG
                        </Button>
                        <Button onClick={() => window.print()} variant="outline" className="flex-1 rounded-2xl h-12 gap-2 border-gray-200">
                            <Printer size={18} /> Print
                        </Button>
                    </div>
                </Card>

                {/* Sharing Options */}
                <div className="space-y-6 print:hidden">
                    <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-lg">Share Link</CardTitle>
                            <CardDescription>Direct link to the public form</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex-1 px-3 py-2 text-sm text-gray-500 truncate font-medium">
                                    {shareUrl}
                                </div>
                                <Button onClick={copyToClipboard} size="sm" className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-200 rounded-xl shadow-sm px-4">
                                    <Copy size={16} className="mr-2" /> Copy
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4">
                        <ShareButton
                            icon={MessageCircle}
                            label="Share via WhatsApp"
                            color="bg-[#25D366]"
                            onClick={shareWhatsApp}
                        />
                        <ShareButton
                            icon={Mail}
                            label="Send via Email"
                            color="bg-[#001D86]"
                            onClick={() => window.open(`mailto:?subject=${encodeURIComponent(form.title)}&body=${encodeURIComponent(shareUrl)}`)}
                        />
                        <Link href={`/submit/${id}`} target="_blank">
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-gray-200 gap-3 text-gray-700 bg-white hover:bg-gray-50">
                                <ExternalLink size={20} /> Preview Public Form
                            </Button>
                        </Link>
                    </div>

                    <Card className="border-none shadow-sm rounded-3xl bg-amber-50 p-6 border-l-4 border-amber-400">
                        <div className="flex gap-4">
                            <div className="mt-1 text-amber-500">
                                <Share2 size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900">Sharing Tip</h4>
                                <p className="text-sm text-amber-800 opacity-80 mt-1">
                                    For Sunday services, display the QR code on the main screen before and after the service for best engagement.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ShareButton({ icon: Icon, label, color, onClick }: any) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "w-full h-14 rounded-2xl shadow-md hover:shadow-lg transition-all gap-3 text-white font-bold",
                color
            )}
        >
            <Icon size={20} />
            {label}
        </Button>
    );
}

function Link({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
}
