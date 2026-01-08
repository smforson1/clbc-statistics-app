import { Suspense } from 'react'
import AdminNavigation from './components/AdminNavigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />
      <main className="lg:pl-64">
        <div className="p-6">
          <Suspense fallback={
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  )
}