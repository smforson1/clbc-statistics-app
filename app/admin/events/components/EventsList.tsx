'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Users, QrCode, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import QRCodeDisplay from '@/app/admin/events/components/QRCodeDisplay'

interface Event {
  id: string
  event_name: string
  event_type: string
  event_date: string
  event_time: string
  description: string | null
  qr_code_token: string
  is_active: boolean
  manual_headcount: number
  created_at: string
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
        .limit(10)

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !currentStatus })
        .eq('id', eventId)

      if (error) throw error
      
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, is_active: !currentStatus }
          : event
      ))
    } catch (error) {
      console.error('Error updating event status:', error)
    }
  }

  const getAttendanceCount = async (eventId: string) => {
    const { count } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    return count || 0
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Events
        </h2>

        {events.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No events created yet
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-4 border rounded-lg transition-colors ${
                  event.is_active
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {event.event_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.event_time}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {event.event_type}
                    </p>
                    
                    {event.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-full transition-colors"
                      title="View QR Code"
                    >
                      <QrCode className="h-4 w-4 text-blue-600" />
                    </button>
                    
                    <button
                      onClick={() => toggleEventStatus(event.id, event.is_active)}
                      className={`p-2 rounded-full transition-colors ${
                        event.is_active
                          ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800'
                          : 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800'
                      }`}
                      title={event.is_active ? 'Deactivate Event' : 'Activate Event'}
                    >
                      {event.is_active ? (
                        <EyeOff className="h-4 w-4 text-red-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedEvent && (
        <QRCodeDisplay
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  )
}