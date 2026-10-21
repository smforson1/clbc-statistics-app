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
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';

interface MemberImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
}

export function MemberImportModal({ isOpen, onClose, onImportSuccess }: MemberImportModalProps) {
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [isImporting, setIsImporting] = useState(false);
    const supabase = createClient();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            // Simple robust CSV parser
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                toast.error('The uploaded CSV file is empty or missing headers');
                return;
            }

            // Headers
            const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            setHeaders(rawHeaders);

            const parsedRows = lines.slice(1).map(line => {
                // Split respecting quotes
                const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
                const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
                const rowObj: Record<string, string> = {};

                rawHeaders.forEach((h, idx) => {
                    const rawVal = matches[idx]?.trim().replace(/^"|"$/g, '') || '';
                    rowObj[h] = rawVal;
                });

                return rowObj;
            });

            setCsvData(parsedRows);
            toast.success(`Loaded ${parsedRows.length} member rows from ${file.name}`);
        };

        reader.readAsText(file);
    };

    const handleConfirmImport = async () => {
        if (csvData.length === 0) {
            toast.error('No member data to import');
            return;
        }

        setIsImporting(true);

        // Find relevant column names by inspecting header keywords
        const findCol = (keywords: string[]) => {
            return headers.find(h => keywords.some(k => h.toLowerCase().includes(k))) || '';
        };

        const nameCol = findCol(['name', 'full name', 'member', 'fullname']) || headers[0];
        const phoneCol = findCol(['phone', 'contact', 'mobile', 'tel', 'whatsapp']);
        const emailCol = findCol(['email', 'mail']);
        const genderCol = findCol(['gender', 'sex']);
        const addressCol = findCol(['address', 'residence', 'hostel', 'hall', 'location']);
        const dobCol = findCol(['dob', 'birth', 'birthday', 'date of birth']);

        const formattedMembers = csvData.map(row => ({
            full_name: row[nameCol]?.trim() || 'Unnamed Member',
            phone: phoneCol ? row[phoneCol]?.trim() : null,
            email: emailCol ? row[emailCol]?.trim() : null,
            gender: genderCol ? row[genderCol]?.trim() : null,
            address: addressCol ? row[addressCol]?.trim() : null,
            date_of_birth: dobCol && row[dobCol]?.trim() ? row[dobCol]?.trim() : null,
            membership_status: 'active',
            join_date: new Date().toISOString().split('T')[0]
        })).filter(m => m.full_name && m.full_name !== 'Unnamed Member');

        try {
            const { error } = await supabase.from('members').insert(formattedMembers);

            if (error) {
                throw error;
            }

            toast.success(`Successfully imported ${formattedMembers.length} members!`);
            onImportSuccess();
            onClose();
            setCsvData([]);
            setFileName('');
        } catch (err: any) {
            toast.error(err.message || 'Failed to batch insert members');
        } finally {
            setIsImporting(false);
        }
    };

    const downloadSampleCSV = () => {
        const sampleContent = "Full Name,Phone Number,Email,Gender,Residence,Date of Birth\nKofi Mensah,0240001122,kofi@example.com,Male,Valco Hall KNUST,1998-05-14\nAkosua Boateng,0501122334,akosua@example.com,Female,Brunei Hostel,2001-11-20";
        const blob = new Blob([sampleContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clbc_members_template.csv';
        a.click();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[600px] rounded-3xl p-6 bg-white shadow-2xl border-none">
                <DialogHeader className="space-y-1 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-[#001D86]">
                            <FileSpreadsheet size={22} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Bulk Member Import (CSV / Excel)
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Import your existing congregation spreadsheet into the member database
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    {/* Upload Box */}
                    <div className="border-2 border-dashed border-gray-200 hover:border-[#001D86] rounded-2xl p-6 text-center transition-colors bg-gray-50/50">
                        <input
                            type="file"
                            accept=".csv,text/csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="csv-upload-input"
                        />
                        <label htmlFor="csv-upload-input" className="cursor-pointer space-y-2 block">
                            <Upload className="mx-auto h-10 w-10 text-gray-400" />
                            <p className="text-sm font-bold text-gray-800">
                                {fileName ? `Selected: ${fileName}` : 'Click to select a CSV file or drag & drop'}
                            </p>
                            <p className="text-xs text-gray-400">
                                Supports comma-separated (.csv) member rosters
                            </p>
                        </label>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Need the correct column structure?</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={downloadSampleCSV}
                            className="h-7 text-xs text-[#001D86] hover:bg-blue-50 font-bold gap-1 px-2"
                        >
                            <Download size={12} /> Download Sample CSV
                        </Button>
                    </div>

                    {/* Preview Table */}
                    {csvData.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                                <span>Preview (Showing first 4 of {csvData.length} records)</span>
                                <Badge className="bg-blue-100 text-[#001D86] text-[10px]">
                                    {csvData.length} Ready to Import
                                </Badge>
                            </div>

                            <div className="border border-gray-100 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto custom-scrollbar text-[11px]">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                                        <tr>
                                            {headers.slice(0, 4).map((h, i) => (
                                                <th key={i} className="p-2 truncate">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {csvData.slice(0, 4).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                {headers.slice(0, 4).map((h, cIdx) => (
                                                    <td key={cIdx} className="p-2 truncate">{row[h] || '-'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-3 border-t border-gray-100 flex gap-2">
                    <Button variant="outline" onClick={onClose} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmImport}
                        disabled={csvData.length === 0 || isImporting}
                        className="bg-[#001D86] hover:bg-[#D5AB45] rounded-xl font-bold gap-1 text-white"
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4 mr-1" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} />
                                Import {csvData.length > 0 ? `${csvData.length} Members` : ''}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
