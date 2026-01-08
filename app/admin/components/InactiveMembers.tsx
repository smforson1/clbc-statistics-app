'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Phone, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface InactiveMember {
  id: string
  full_name: string
  phone_number: string
  last_attendance_date: string | null
  weeks_since_attendance: number
}

export default function InactiveMembers() {
  const [inactiveMembers, setInactiveMembers] = useState<InactiveMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInactiveMembers()
  }, [])

  const fetchInactiveMembers = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_inactive_members', { weeks_threshold: 3 })

      if (error) throw error

      setInactiveMembers(data || [])
    } catch (error) {
      console.error('Error fetching inactive members:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (inactiveMembers.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Member Engagement
          </h3>
        </div>
        <p className="text-green-600 dark:text-green-400">
          Great! All members have attended recently.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Inactive Members Alert
        </h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {inactiveMembers.length} member(s) haven't attended in 3+ weeks
      </p>

      <div className="space-y-3">
        {inactiveMembers.slice(0, 5).map((member) => (
          <div 
            key={member.id} 
            className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {member.full_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Last seen: {member.last_attendance_date 
                  ? new Date(member.last_attendance_date).toLocaleDateString()
                  : 'Never'
                } ({member.weeks_since_attendance} weeks ago)
              </p>
            </div>
            <div className="flex space-x-2">
              <a
                href={`tel:${member.phone_number}`}
                className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-full transition-colors"
                title="Call member"
              >
                <Phone className="h-4 w-4 text-blue-600" />
              </a>
              <a
                href={`https://wa.me/${member.phone_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-full transition-colors"
                title="WhatsApp member"
              >
                <Mail className="h-4 w-4 text-green-600" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {inactiveMembers.length > 5 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          And {inactiveMembers.length - 5} more...
        </p>
      )}
    </div>
  )
}