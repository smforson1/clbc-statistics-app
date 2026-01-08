'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle } from 'lucide-react'

interface AttendanceFormData {
  fullName: string
  age: number
  phoneNumber: string
  courseOfStudy: string
  level: string
  hallHostel: string
  visitorStatus: string
  dataConsent: boolean
}

const courses = [
  'Computer Science', 'Engineering', 'Medicine', 'Law', 'Business Administration',
  'Economics', 'Psychology', 'Biology', 'Chemistry', 'Physics', 'Mathematics',
  'English', 'History', 'Political Science', 'Sociology', 'Other'
]

const halls = [
  'Hall A', 'Hall B', 'Hall C', 'Hall D', 'Hall E',
  'Off-Campus', 'Private Hostel', 'Family House', 'Other'
]

export default function AttendanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<AttendanceFormData>({
    fullName: '',
    age: 18,
    phoneNumber: '',
    courseOfStudy: '',
    level: '',
    hallHostel: '',
    visitorStatus: '',
    dataConsent: false
  })
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventToken = searchParams.get('event')

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (formData.age < 16 || formData.age > 35) {
      newErrors.age = 'Age must be between 16 and 35'
    }

    const phoneRegex = /^(\+234|0)[789]\d{9}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Nigerian phone number'
    }

    if (!formData.courseOfStudy) {
      newErrors.courseOfStudy = 'Please select your course of study'
    }

    if (!formData.level) {
      newErrors.level = 'Please select your level'
    }

    if (!formData.hallHostel) {
      newErrors.hallHostel = 'Please select your hall/hostel'
    }

    if (!formData.visitorStatus) {
      newErrors.visitorStatus = 'Please select your visitor status'
    }

    if (!formData.dataConsent) {
      newErrors.dataConsent = 'You must consent to data processing'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // First, check if event exists and is active
      let eventId = null
      if (eventToken) {
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id')
          .eq('qr_code_token', eventToken)
          .eq('is_active', true)
          .single()

        if (eventError || !event) {
          throw new Error('Invalid or inactive event')
        }
        eventId = event.id
      }

      // Check if member exists by phone number
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('phone_number', formData.phoneNumber)
        .single()

      let memberId = existingMember?.id

      if (!memberId) {
        // Create new member
        const { data: newMember, error: memberError } = await supabase
          .from('members')
          .insert({
            full_name: formData.fullName,
            age: formData.age,
            phone_number: formData.phoneNumber,
            course_of_study: formData.courseOfStudy,
            level: formData.level,
            hall_hostel: formData.hallHostel,
            visitor_status: formData.visitorStatus as any,
            data_consent: formData.dataConsent
          })
          .select('id')
          .single()

        if (memberError) throw memberError
        memberId = newMember.id
      } else {
        // Update existing member info
        await supabase
          .from('members')
          .update({
            full_name: formData.fullName,
            age: formData.age,
            course_of_study: formData.courseOfStudy,
            level: formData.level,
            hall_hostel: formData.hallHostel,
            visitor_status: formData.visitorStatus as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', memberId)
      }

      // Record attendance if event exists
      if (eventId && memberId) {
        await supabase
          .from('attendance')
          .insert({
            member_id: memberId,
            event_id: eventId,
            attendance_method: 'digital'
          })
      }

      setIsSuccess(true)
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push('/attend/success')
      }, 2000)

    } catch (error) {
      console.error('Error submitting attendance:', error)
      alert('There was an error submitting your information. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  if (isSuccess) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your attendance has been recorded successfully.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium mb-1">Age *</label>
          <input
            name="age"
            type="number"
            min="16"
            max="35"
            value={formData.age}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your age"
          />
          {errors.age && (
            <p className="text-red-500 text-sm mt-1">{errors.age}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp Number *</label>
          <input
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 08012345678"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Course of Study */}
        <div>
          <label className="block text-sm font-medium mb-1">Course of Study *</label>
          <select 
            name="courseOfStudy"
            value={formData.courseOfStudy}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select your course</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          {errors.courseOfStudy && (
            <p className="text-red-500 text-sm mt-1">{errors.courseOfStudy}</p>
          )}
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium mb-1">Level *</label>
          <select 
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select your level</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
            <option value="Graduate">Graduate</option>
          </select>
          {errors.level && (
            <p className="text-red-500 text-sm mt-1">{errors.level}</p>
          )}
        </div>

        {/* Hall/Hostel */}
        <div>
          <label className="block text-sm font-medium mb-1">Hall/Hostel *</label>
          <select 
            name="hallHostel"
            value={formData.hallHostel}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select your accommodation</option>
            {halls.map(hall => (
              <option key={hall} value={hall}>{hall}</option>
            ))}
          </select>
          {errors.hallHostel && (
            <p className="text-red-500 text-sm mt-1">{errors.hallHostel}</p>
          )}
        </div>

        {/* Visitor Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Visitor Status *</label>
          <select 
            name="visitorStatus"
            value={formData.visitorStatus}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select status</option>
            <option value="First-Timer">First-Timer</option>
            <option value="Regular Member">Regular Member</option>
            <option value="Returning Guest">Returning Guest</option>
          </select>
          {errors.visitorStatus && (
            <p className="text-red-500 text-sm mt-1">{errors.visitorStatus}</p>
          )}
        </div>

        {/* Data Consent */}
        <div className="flex items-start space-x-2">
          <input
            name="dataConsent"
            type="checkbox"
            checked={formData.dataConsent}
            onChange={handleChange}
            className="mt-1"
          />
          <label className="text-sm text-gray-600 dark:text-gray-300">
            I consent to the processing of my personal data for church management purposes. 
            This information will be kept confidential and used only for ministry activities. *
          </label>
        </div>
        {errors.dataConsent && (
          <p className="text-red-500 text-sm">{errors.dataConsent}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isSubmitting ? 'Submitting...' : 'Check In'}</span>
        </button>
      </form>
    </div>
  )
}