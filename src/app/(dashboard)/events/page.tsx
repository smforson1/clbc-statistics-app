'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    MoreVertical,
    CalendarCheck,
    ChevronRight,
    PlusCircle,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: false });

        if (error) {
            toast.error('Failed to fetch events');
        } else {
            setEvents(data || []);
        }
        setIsLoading(false);
    };

    const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const eventData = {
            event_name: formData.get('event_name'),
            event_type: formData.get('event_type'),
            event_date: formData.get('event_date'),
            location: formData.get('location'),
            description: formData.get('description'),
        };

        const { error } = await supabase.from('events').insert(eventData);

        if (error) {
            toast.error('Failed to add event');
        } else {
            toast.success('Event scheduled successfully');
            setIsAddDialogOpen(false);
            fetchEvents();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Event Calendar</h1>
                    <p className="text-gray-500 mt-1">Schedule and manage church activities and meetings</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg transition-all gap-2 px-6">
                            <PlusCircle size={18} />
                            Schedule Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                        <form onSubmit={handleAddEvent}>
                            <DialogHeader>
                                <DialogTitle>Schedule New Event</DialogTitle>
                                <DialogDescription>
                                    Fill in the event details to add it to the church calendar.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-6">
                                <div className="space-y-2">
                                    <Label>Event Name</Label>
                                    <Input name="event_name" placeholder="e.g. Youth Fellowship Night" required className="rounded-xl" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Event Type</Label>
                                        <select name="event_type" className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-violet-500 appearance-none">
                                            <option>Sunday Service</option>
                                            <option>Midweek Service</option>
                                            <option>Youth Meeting</option>
                                            <option>Special Event</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input name="event_date" type="date" required className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input name="location" placeholder="Main Sanctuary or Online" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input name="description" placeholder="Brief details about the event" className="rounded-xl" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full bg-violet-600 rounded-xl py-6 text-lg font-bold">Schedule Event</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <CalendarCheck size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No events scheduled</h3>
                    <p className="text-gray-500 mb-6">Plan your church's next big event today.</p>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600">Schedule Event</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <Card key={event.id} className="group border-none shadow-md hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] bg-white overflow-hidden flex flex-col">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded-full px-3 font-bold">
                                        {event.event_type}
                                    </Badge>
                                    <Button variant="ghost" size="icon" className="rounded-full text-gray-300 opacity-0 group-hover:opacity-100">
                                        <MoreVertical size={18} />
                                    </Button>
                                </div>
                                <CardTitle className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {event.event_name}
                                </CardTitle>
                                <p className="text-gray-500 text-sm line-clamp-2 mt-2">{event.description}</p>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 flex-1 space-y-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-gray-600 font-medium">
                                        <CalendarIcon size={18} className="text-blue-500" />
                                        <span>{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 font-medium">
                                        <MapPin size={18} className="text-red-500" />
                                        <span>{event.location || 'CLBC Main Sanctuary'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Expected: {event.expected_attendance || '0'}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 pt-0 mt-auto">
                                <Button className="w-full bg-gray-50 text-gray-900 border border-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-2xl h-12 gap-2 font-bold transition-all">
                                    View Logistics <ChevronRight size={18} />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
