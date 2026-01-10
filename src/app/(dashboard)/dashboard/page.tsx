'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import {
    Users,
    FileText,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';



export default function DashboardPage() {
    const [stats, setStats] = useState({
        attendance: 0,
        activeForms: 0,
        newMembers: 0,
        events: 0
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch total responses for today as "Attendance" (simplified logic)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count: attendanceCount } = await supabase
                .from('form_responses')
                .select('*', { count: 'exact', head: true })
                .gte('submitted_at', today.toISOString());

            // Fetch active forms count
            const { count: activeFormsCount } = await supabase
                .from('forms')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Fetch new members this month
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const { count: memberCount } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', firstDayOfMonth.toISOString());

            // Fetch upcoming events
            const { count: upcomingEventsCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .gte('event_date', today.toISOString().split('T')[0]);

            setStats({
                attendance: attendanceCount || 0,
                activeForms: activeFormsCount || 0,
                newMembers: memberCount || 0,
                events: upcomingEventsCount || 0
            });

            // Fetch recent responses with form titles
            const { data: recentResp, error: respError } = await supabase
                .from('form_responses')
                .select(`
                    id,
                    submitted_at,
                    forms (id, title)
                `)
                .order('submitted_at', { ascending: false })
                .limit(4);

            if (!respError && recentResp) {
                setActivities(recentResp.map(r => ({
                    id: r.id,
                    formId: (r as any).forms?.id,
                    title: (r as any).forms?.title || 'Form Submission',
                    date: new Date(r.submitted_at).toLocaleDateString(),
                    rawDate: r.submitted_at
                })));
            }

            // Fetch chart data (last 7 weeks)
            const sevenWeeksAgo = new Date();
            sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);

            const { data: trendData } = await supabase
                .from('form_responses')
                .select('submitted_at')
                .gte('submitted_at', sevenWeeksAgo.toISOString())
                .order('submitted_at', { ascending: true });

            if (trendData) {
                const groupedData: Record<string, number> = {};
                trendData.forEach(r => {
                    const d = new Date(r.submitted_at);
                    const weekLabel = `W${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}`;
                    const key = `${d.getMonth() + 1}/${d.getDate()} (${weekLabel})`;
                    groupedData[key] = (groupedData[key] || 0) + 1;
                });

                const formattedChart = Object.entries(groupedData).map(([name, attendance]) => ({ name, attendance }));
                setChartData(formattedChart.slice(-7));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#001D86] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D5AB45] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="h-20 w-20 bg-white p-1 rounded-full shadow-2xl overflow-hidden border-4 border-white flex-shrink-0">
                        <img src="/clbc-logo.jpg" alt="CLBC" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Dashboard Overview</h1>
                        <p className="text-blue-100/80 mt-1 font-medium">Welcome back! Here's what's happening at CLBC today.</p>
                    </div>
                </div>
                <div className="flex gap-3 relative z-10">
                    <Link href="/forms/create">
                        <Button className="bg-[#D5AB45] hover:bg-white text-[#001D86] font-extrabold rounded-xl h-12 gap-2 px-8 shadow-xl transition-all hover:scale-105 active:scale-95">
                            <Plus size={18} />
                            Create Form
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Attendance"
                    value={stats.attendance.toString()}
                    change="Real-time count"
                    icon={Users}
                    gradient="from-[#001D86] to-[#000C33]"
                />
                <StatCard
                    title="Active Forms"
                    value={stats.activeForms.toString()}
                    change="Currently taking responses"
                    icon={FileText}
                    gradient="from-[#D5AB45] to-[#B89230]"
                />
                <StatCard
                    title="New Members"
                    value={stats.newMembers.toString()}
                    change="Joined this month"
                    icon={ArrowUpRight}
                    gradient="from-amber-500 to-yellow-500"
                />
                <StatCard
                    title="Upcoming Events"
                    value={stats.events.toString()}
                    change="Scheduled"
                    icon={Calendar}
                    gradient="from-[#001D86] to-[#000C33]"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Trend */}
                <Card className="shadow-sm border-none bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-[#001D86]" size={20} />
                            Attendance Trend
                        </CardTitle>
                        <CardDescription>Last 7 weeks performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#001D86" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#000C33" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="attendance"
                                        fill="url(#colorAttendance)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="shadow-sm border-none bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest form submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activities.length === 0 ? (
                                <p className="text-center py-8 text-gray-500">No recent activity found.</p>
                            ) : (
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-[#001D86]">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{activity.title}</p>
                                                <p className="text-sm text-gray-500">Submitted on {activity.date}</p>
                                            </div>
                                        </div>
                                        <Link href={`/forms/${activity.formId}/responses`}>
                                            <Button variant="ghost" size="sm" className="text-[#001D86] hover:bg-blue-50 font-bold">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, icon: Icon, gradient }: any) {
    return (
        <Card className={`relative overflow-hidden border-none shadow-md group hover:shadow-xl transition-all duration-300`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:scale-110 transition-transform duration-500`} />
            <CardContent className="relative p-6 text-white text-center">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Icon size={24} />
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                        Live
                    </span>
                </div>
                <div className="space-y-1 text-left">
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-4xl font-bold tracking-tight">{value}</p>
                    <p className="text-xs opacity-75 mt-2 flex items-center gap-1">
                        {change}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
