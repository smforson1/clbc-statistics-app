'use client';

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

const data = [
    { name: 'W1', attendance: 145 },
    { name: 'W2', attendance: 168 },
    { name: 'W3', attendance: 152 },
    { name: 'W4', attendance: 180 },
    { name: 'W5', attendance: 195 },
    { name: 'W6', attendance: 188 },
    { name: 'W7', attendance: 245 },
];

const recentActivity = [
    { id: 1, title: 'Sunday Service Form', responses: 245, date: 'Today' },
    { id: 2, title: 'Midweek Bible Study', responses: 132, date: 'Yesterday' },
    { id: 3, title: 'Youth Fellowship', responses: 67, date: '2 days ago' },
    { id: 4, title: 'Prayer Request Form', responses: 42, date: '3 days ago' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#001D86] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D5AB45] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="h-20 w-20 bg-white p-1 rounded-full shadow-2xl overflow-hidden border-4 border-white flex-shrink-0">
                        <img src="/clbc-logo.jpeg" alt="CLBC" className="w-full h-full object-cover" />
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
                    value="245"
                    change="+12% from last week"
                    icon={Users}
                    gradient="from-[#001D86] to-[#000C33]"
                />
                <StatCard
                    title="Active Forms"
                    value="3"
                    change="2 pending submissions"
                    icon={FileText}
                    gradient="from-[#D5AB45] to-[#B89230]"
                />
                <StatCard
                    title="New Members"
                    value="8"
                    change="This month"
                    icon={ArrowUpRight}
                    gradient="from-amber-500 to-yellow-500"
                />
                <StatCard
                    title="Upcoming Events"
                    value="5"
                    change="Next 7 days"
                    icon={Calendar}
                    gradient="from-[#001D86] to-[#000C33]"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Trend */}
                <Card className="shadow-sm border-none bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-violet-600" size={20} />
                            Attendance Trend
                        </CardTitle>
                        <CardDescription>Last 7 weeks performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <defs>
                                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.8} />
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
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-violet-200 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{activity.title}</p>
                                            <p className="text-sm text-gray-500">{activity.responses} responses • {activity.date}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-violet-600 hover:bg-violet-50 font-medium">
                                        View
                                    </Button>
                                </div>
                            ))}
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
