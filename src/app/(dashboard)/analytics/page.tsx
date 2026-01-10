'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Users, Calendar, FileText, TrendingUp,
    BarChart, PieChart, Activity, Download
} from 'lucide-react';
import {
    BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line, Cell,
    PieChart as RePieChart, Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalForms: 0,
        totalResponses: 0,
        growthRate: 0
    });
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [demographicsData, setDemographicsData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            // Basic counts
            const { count: membersCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
            const { count: formsCount } = await supabase.from('forms').select('*', { count: 'exact', head: true });
            const { count: responsesCount } = await supabase.from('form_responses').select('*', { count: 'exact', head: true });

            // Calculate Growth Rate (Members this month vs last month)
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const { count: thisMonthCount } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', firstDayOfMonth.toISOString());

            const { count: lastMonthCount } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', firstDayOfLastMonth.toISOString())
                .lt('created_at', firstDayOfMonth.toISOString());

            let growth = 0;
            if (lastMonthCount && lastMonthCount > 0) {
                growth = parseFloat(((thisMonthCount || 0) / lastMonthCount * 100).toFixed(1));
            } else if (thisMonthCount && thisMonthCount > 0) {
                growth = 100; // First month growth
            }

            setStats({
                totalMembers: membersCount || 0,
                totalForms: formsCount || 0,
                totalResponses: responsesCount || 0,
                growthRate: growth
            });

            // Fetch Attendance Trend (last 6 months/weeks equivalent)
            const sixWeeksAgo = new Date();
            sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

            const { data: trendData } = await supabase
                .from('form_responses')
                .select('submitted_at')
                .gte('submitted_at', sixWeeksAgo.toISOString())
                .order('submitted_at', { ascending: true });

            if (trendData) {
                // Group by week
                const weeks: Record<string, number> = {};
                trendData.forEach(r => {
                    const date = new Date(r.submitted_at);
                    const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
                    const key = `${date.toLocaleString('default', { month: 'short' })} W${weekNum}`;
                    weeks[key] = (weeks[key] || 0) + 1;
                });

                const formattedTrend = Object.entries(weeks).map(([name, attendance]) => ({ name, attendance }));
                setAttendanceData(formattedTrend.slice(-6));
            }

            // Fetch Demographics (Age distribution)
            const { data: memberData } = await supabase
                .from('members')
                .select('date_of_birth, gender');

            if (memberData) {
                const groups = {
                    Children: { count: 0, color: '#10b981' },
                    Youth: { count: 0, color: '#001D86' },
                    Adults: { count: 0, color: '#3b82f6' },
                    Seniors: { count: 0, color: '#D5AB45' },
                };

                memberData.forEach(m => {
                    if (!m.date_of_birth) return;
                    const age = new Date().getFullYear() - new Date(m.date_of_birth).getFullYear();
                    if (age < 13) groups.Children.count++;
                    else if (age < 25) groups.Youth.count++;
                    else if (age < 60) groups.Adults.count++;
                    else groups.Seniors.count++;
                });

                const formattedDemo = Object.entries(groups).map(([name, data]) => ({
                    name,
                    value: Math.round(((data.count / (memberData.length || 1)) * 100)),
                    color: data.color
                })).filter(d => d.value > 0);

                setDemographicsData(formattedDemo);
            }

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Church Analytics</h1>
                    <p className="text-gray-500 mt-1">Numerical insights into growth and engagement</p>
                </div>
                <Button className="bg-[#001D86] hover:bg-[#D5AB45] rounded-xl transition-all">
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Forms Created', value: stats.totalForms, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Form Responses', value: stats.totalResponses, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Monthly Growth', value: `+${stats.growthRate}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                    <stat.icon size={24} className={stat.color} />
                                </div>
                                <Badge variant="secondary" className="bg-gray-50 text-gray-500 font-medium">Last 30 Days</Badge>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Chart */}
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/30 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Attendance Trends</CardTitle>
                                <CardDescription>Weekly service attendance for last 6 weeks</CardDescription>
                            </div>
                            <BarChart size={20} className="text-gray-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="attendance"
                                        stroke="#001D86"
                                        strokeWidth={4}
                                        dot={{ r: 6, fill: '#001D86', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Demographics Pie Chart */}
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/30 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Demographics</CardTitle>
                                <CardDescription>Distribution of church membership</CardDescription>
                            </div>
                            <PieChart size={20} className="text-gray-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="h-[250px] w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={demographicsData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {demographicsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                                {demographicsData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { cn } from '@/lib/utils';
