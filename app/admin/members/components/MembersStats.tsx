'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MemberStats {
  totalMembers: number
  newThisWeek: number
  needsFollowUp: number
}

export default function MembersStats() {
  const [stats, setStats] = useState<MemberStats>({
    totalMembers: 0,
    newThisWeek: 0,
    needsFollowUp: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get total active members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get new members this week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const { count: newThisWeek } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', oneWeekAgo.toISOString())

      // Get members who need follow-up (haven't attended in 3+ weeks)
      const threeWeeksAgo = new Date()
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)
      
      interface MemberAttendance {
        last_attendance_date: string | null
      }
      
      const { data: allMembers } = await supabase
        .from('members')
        .select('last_attendance_date')
        .eq('is_active', true)

      const needsFollowUp = (allMembers as MemberAttendance[])?.filter((member) => 
        !member.last_attendance_date || 
        new Date(member.last_attendance_date) < threeWeeksAgo
      ).length || 0

      setStats({
        totalMembers: totalMembers || 0,
        newThisWeek: newThisWeek || 0,
        needsFollowUp
      })
    } catch (error) {
      console.error('Error fetching member stats:', error)
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
      name: 'New This Week',
      value: stats.newThisWeek,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Needs Follow-up',
      value: stats.needsFollowUp,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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