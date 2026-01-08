import LoginForm from './components/LoginForm'
import { Church } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-church-50 to-primary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Church className="h-12 w-12 text-church-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Access your church management dashboard
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ecclesia-Link Church Management System
          </p>
        </div>
      </div>
    </div>
  )
}