'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generateQRToken } from '@/lib/utils'

export default function CreateEventForm() {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    eventDate: '',
    eventTime: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const eventTypes = [
    'Sunday Service',
    'Mid-week Prayer',
    'Bible Study',
    'Youth Meeting',
    'Special Event',
    'Conference',
    'Workshop',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const qrToken = generateQRToken()
      
      const { error } = await supabase
        .from('events')
        .insert({
          event_name: formData.eventName,
          event_type: formData.eventType,
          event_date: formData.eventDate,
          event_time: formData.eventTime,
          description: formData.description,
          qr_code_token: qrToken,
          is_active: true
        })

      if (error) throw error

      setSuccess(true)
      setFormData({
        eventName: '',
        eventType: '',
        eventDate: '',
        eventTime: '',
        description: ''
      })

      setTimeout(() => setSuccess(false), 3000)
      
      // Refresh the page to show new event
      window.location.reload()
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Create New Event
      </h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-600 dark:text-green-400 text-sm">
            Event created successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Name *</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Sunday Service"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Event Type *</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select event type</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time *</label>
          <input
            type="time"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows={3}
            placeholder="Optional event description"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span>{loading ? 'Creating...' : 'Create Event'}</span>
        </button>
      </form>
    </div>
  )
}