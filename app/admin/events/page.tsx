import { Suspense } from 'react'
import EventsList from './components/EventsList'
import CreateEventForm from './components/CreateEventForm'

export default function EventsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Events Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create and manage church events with QR code attendance
        </p>
      </div>

      {/* Create Event Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Suspense fallback={
            <div className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          }>
            <CreateEventForm />
          </Suspense>
        </div>

        {/* Events List */}
        <div className="lg:col-span-2">
          <Suspense fallback={
            <div className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          }>
            <EventsList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}