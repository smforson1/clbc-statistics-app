'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Settings,
    User,
    Bell,
    Shield,
    Database,
    Palette,
    Info,
    Save,
    Trash2,
    RefreshCw,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [branchData, setBranchData] = useState({ name: '', location: '' });
    const supabase = createClient();

    useEffect(() => {
        fetchBranchData();
    }, []);

    const fetchBranchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('branch:branches(name, location)')
                .eq('id', user.id)
                .single();

            if (profile?.branch) {
                setBranchData({
                    name: (profile.branch as any).name,
                    location: (profile.branch as any).location || ''
                });
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('branch_id')
            .eq('id', user.id)
            .single();

        if (profile?.branch_id) {
            const { error } = await supabase
                .from('branches')
                .update({ name: branchData.name, location: branchData.location })
                .eq('id', profile.branch_id);

            if (error) {
                toast.error('Failed to update branch settings');
            } else {
                toast.success('Branch settings updated successfully');
                // Force a refresh of the sidebar branch name
                window.location.reload();
            }
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
                <p className="text-gray-500 mt-1">Configure your church portal and administrative preferences</p>
            </div>

            <Tabs defaultValue="church" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
                    <TabsTrigger value="church" className="rounded-lg gap-2 min-w-[120px]">
                        <Info size={16} /> Church Info
                    </TabsTrigger>
                    <TabsTrigger value="account" className="rounded-lg gap-2 min-w-[120px]">
                        <User size={16} /> My Account
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg gap-2 min-w-[120px]">
                        <Bell size={16} /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg gap-2 min-w-[120px]">
                        <Shield size={16} /> Security
                    </TabsTrigger>
                    <TabsTrigger value="data" className="rounded-lg gap-2 min-w-[120px]">
                        <Database size={16} /> Data Management
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="church">
                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
                            <CardTitle>Church Information</CardTitle>
                            <CardDescription>Public details seen on forms and reports</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label>Church Branch Name</Label>
                                    <Input
                                        value={branchData.name}
                                        onChange={(e) => setBranchData({ ...branchData, name: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website URL</Label>
                                    <Input defaultValue="https://clbc.org" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Email</Label>
                                    <Input defaultValue="office@clbc.org" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input defaultValue="+233 24 000 0000" className="rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Branch Address / Location</Label>
                                <Input
                                    value={branchData.location}
                                    onChange={(e) => setBranchData({ ...branchData, location: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSave} disabled={isSaving} className="bg-[#001D86] hover:bg-[#D5AB45] rounded-xl px-8 transition-all">
                                    {isSaving ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="account">
                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
                            <CardTitle>Admin Profile</CardTitle>
                            <CardDescription>Manage your personal login information</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="h-24 w-24 bg-gradient-to-br from-[#001D86] to-blue-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    A
                                </div>
                                <div>
                                    <Button variant="outline" className="rounded-xl">Change Photo</Button>
                                    <p className="text-xs text-gray-400 mt-2">Recommended: 400x400px</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input defaultValue="Admin User" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input defaultValue="Statistics Head" disabled className="rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleSave} className="bg-[#001D86] hover:bg-[#D5AB45] rounded-xl px-8 transition-all">Update Profile</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be notified</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-gray-500">Receive an email when a new response is submitted.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Weekly Summary</Label>
                                    <p className="text-sm text-gray-500">Get a weekly attendance and logistics report.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Urgent Alerts</Label>
                                    <p className="text-sm text-gray-500">SMS alerts for critical logistics updates.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-none shadow-sm rounded-3xl bg-white p-8">
                            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <RefreshCw size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Backup All Data</h3>
                            <p className="text-sm text-gray-500 mb-6">Download a complete backup of all forms, responses, and members in JSON format.</p>
                            <Button variant="outline" className="w-full rounded-xl h-12 border-blue-200 text-blue-700 hover:bg-blue-50">Download Backup</Button>
                        </Card>

                        <Card className="border-none shadow-sm rounded-3xl bg-white p-8">
                            <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-red-600">Danger Zone</h3>
                            <p className="text-sm text-gray-500 mb-6">Permanently delete old form responses to free up space. This action cannot be undone.</p>
                            <Button variant="outline" className="w-full rounded-xl h-12 border-red-200 text-red-700 hover:bg-red-50">Clear Old Responses</Button>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
