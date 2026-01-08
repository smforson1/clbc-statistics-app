import { Suspense } from 'react'
import MembersList from './components/MembersList'
import MembersStats from './components/MembersStats'

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Members Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage church members and their attendance
        </p>
      </div>

      {/* Members Stats */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      }>
        <MembersStats />
      </Suspense>

      {/* Members List */}
      <Suspense fallback={
        <div className="card p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      }>
        <MembersList />
      </Suspense>
    </div>
  )
}