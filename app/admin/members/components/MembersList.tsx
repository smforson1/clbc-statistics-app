'use client'

import { useEffect, useState } from 'react'
import { Search, Phone, Mail, Calendar, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface Member {
  id: string
  full_name: string
  age: number
  phone_number: string
  course_of_study: string
  level: string
  hall_hostel: string
  visitor_status: string
  last_attendance_date: string | null
  created_at: string
}

export default function MembersList() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, filterStatus])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone_number.includes(searchTerm) ||
        member.course_of_study.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.hall_hostel.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      const threeWeeksAgo = new Date()
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)

      if (filterStatus === 'active') {
        filtered = filtered.filter(member =>
          member.last_attendance_date &&
          new Date(member.last_attendance_date) >= threeWeeksAgo
        )
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(member =>
          !member.last_attendance_date ||
          new Date(member.last_attendance_date) < threeWeeksAgo
        )
      } else if (filterStatus === 'first-timer') {
        filtered = filtered.filter(member =>
          member.visitor_status === 'First-Timer'
        )
      }
    }

    setFilteredMembers(filtered)
  }

  const getStatusColor = (member: Member) => {
    if (!member.last_attendance_date) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }

    const threeWeeksAgo = new Date()
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)
    
    if (new Date(member.last_attendance_date) >= threeWeeksAgo) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    } else {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    }
  }

  const getStatusText = (member: Member) => {
    if (!member.last_attendance_date) return 'Never attended'
    
    const threeWeeksAgo = new Date()
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21)
    
    if (new Date(member.last_attendance_date) >= threeWeeksAgo) {
      return 'Active'
    } else {
      return 'Needs follow-up'
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Members Directory ({filteredMembers.length})
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-church-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-church-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="inactive">Needs Follow-up</option>
            <option value="first-timer">First-Timers</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'No members found matching your criteria'
              : 'No members registered yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.full_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member)}`}>
                      {getStatusText(member)}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {member.visitor_status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <span className="font-medium">Age:</span> {member.age}
                    </div>
                    <div>
                      <span className="font-medium">Course:</span> {member.course_of_study}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {member.level}
                    </div>
                    <div>
                      <span className="font-medium">Hall:</span> {member.hall_hostel}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Last seen: {member.last_attendance_date 
                          ? formatDistanceToNow(new Date(member.last_attendance_date), { addSuffix: true })
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>
                        Joined {formatDistanceToNow(new Date(member.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex items-center space-x-2 ml-4">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}