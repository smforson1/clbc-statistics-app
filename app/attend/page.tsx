import { Suspense } from 'react'
import AttendanceForm from './components/AttendanceForm'
import { Church } from 'lucide-react'

export default function AttendPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-church-50 to-primary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Church className="h-12 w-12 text-church-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Church!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please fill out this quick form to check in
          </p>
        </div>

        {/* Attendance Form */}
        <div className="max-w-md mx-auto">
          <Suspense fallback={
            <div className="card p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          }>
            <AttendanceForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}