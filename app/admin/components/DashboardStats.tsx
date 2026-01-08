'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, TrendingUp, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Stats {
  totalMembers: number
  activeEvents: number
  todayAttendance: number
  weeklyGrowth: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeEvents: 0,
    todayAttendance: 0,
    weeklyGrowth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get total members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get active events
      const { count: activeEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { count: todayAttendance } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .gte('checked_in_at', `${today}T00:00:00`)
        .lt('checked_in_at', `${today}T23:59:59`)

      // Calculate weekly growth (simplified)
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      const { count: lastWeekMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', lastWeek.toISOString())

      const weeklyGrowth = totalMembers && lastWeekMembers 
        ? Math.round(((totalMembers - lastWeekMembers) / lastWeekMembers) * 100)
        : 0

      setStats({
        totalMembers: totalMembers || 0,
        activeEvents: activeEvents || 0,
        todayAttendance: todayAttendance || 0,
        weeklyGrowth
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Active Events',
      value: stats.activeEvents,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: "Today's Attendance",
      value: stats.todayAttendance,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      name: 'Weekly Growth',
      value: `${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div key={stat.name} className="card p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.name}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}