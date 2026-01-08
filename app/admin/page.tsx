import { Suspense } from 'react'
import DashboardStats from './components/DashboardStats'
import AttendanceChart from './components/AttendanceChart'
import RecentActivity from './components/RecentActivity'
import InactiveMembers from './components/InactiveMembers'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome to your church management dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      }>
        <DashboardStats />
      </Suspense>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={
          <div className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }>
          <AttendanceChart />
        </Suspense>

        <Suspense fallback={
          <div className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }>
          <RecentActivity />
        </Suspense>
      </div>

      {/* Inactive Members Alert */}
      <Suspense fallback={
        <div className="card p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      }>
        <InactiveMembers />
      </Suspense>
    </div>
  )
}