import Link from 'next/link'
import { Church, Users, BarChart3, QrCode } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-church-50 to-primary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Church className="h-16 w-16 text-church-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Ecclesia-Link
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Modern Church Management System for University Youth Ministry
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card p-6 text-center">
            <QrCode className="h-12 w-12 text-church-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quick Check-in</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Scan QR codes for instant attendance tracking without accounts
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <Users className="h-12 w-12 text-church-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Member Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track member engagement and follow up with inactive members
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <BarChart3 className="h-12 w-12 text-church-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Live attendance tracking with demographic insights
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/attend" 
            className="btn-primary text-center px-8 py-3 text-lg"
          >
            Join Event
          </Link>
          <Link 
            href="/admin/login" 
            className="btn-secondary text-center px-8 py-3 text-lg"
          >
            Admin Dashboard
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p>&copy; 2026 Ecclesia-Link. Built for university youth ministry.</p>
        </div>
      </div>
    </div>
  )
}