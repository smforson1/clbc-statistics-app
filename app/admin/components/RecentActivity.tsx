'use client'

import { useEffect, useState } from 'react'
import { Clock, User, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'attendance' | 'member' | 'event'
  description: string
  timestamp: string
  icon: any
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      // Get recent attendance
      const { data: recentAttendance } = await supabase
        .from('attendance')
        .select(`
          id,
          checked_in_at,
          members (full_name),
          events (event_name)
        `)
        .order('checked_in_at', { ascending: false })
        .limit(5)

      // Get recent members
      const { data: recentMembers } = await supabase
        .from('members')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      // Get recent events
      const { data: recentEvents } = await supabase
        .from('events')
        .select('id, event_name, created_at')
        .order('created_at', { ascending: false })
        .limit(2)

      const activities: Activity[] = []

      // Add attendance activities
      recentAttendance?.forEach((attendance: any) => {
        activities.push({
          id: attendance.id,
          type: 'attendance',
          description: `${attendance.members?.full_name} checked in to ${attendance.events?.event_name}`,
          timestamp: attendance.checked_in_at,
          icon: User
        })
      })

      // Add member activities
      recentMembers?.forEach((member: any) => {
        activities.push({
          id: member.id,
          type: 'member',
          description: `New member ${member.full_name} joined`,
          timestamp: member.created_at,
          icon: User
        })
      })

      // Add event activities
      recentEvents?.forEach((event: any) => {
        activities.push({
          id: event.id,
          type: 'event',
          description: `Event "${event.event_name}" was created`,
          timestamp: event.created_at,
          icon: Calendar
        })
      })

      // Sort by timestamp and take top 10
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(activities.slice(0, 10))

    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <activity.icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}