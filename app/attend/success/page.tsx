import Link from 'next/link'
import { CheckCircle, Instagram, Facebook, Youtube, ArrowLeft } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-church-50 to-primary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* Success Icon */}
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
          
          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Church!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Thank you for checking in. Your attendance has been recorded successfully.
          </p>

          {/* Social Media Links */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Stay Connected</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Follow us on social media for updates and upcoming events
            </p>
            
            <div className="flex justify-center space-x-4">
              <a 
                href="https://instagram.com/yourchurch" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-pink-100 hover:bg-pink-200 dark:bg-pink-900 dark:hover:bg-pink-800 rounded-full transition-colors"
              >
                <Instagram className="h-6 w-6 text-pink-600" />
              </a>
              
              <a 
                href="https://facebook.com/yourchurch" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-full transition-colors"
              >
                <Facebook className="h-6 w-6 text-blue-600" />
              </a>
              
              <a 
                href="https://youtube.com/yourchurch" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded-full transition-colors"
              >
                <Youtube className="h-6 w-6 text-red-600" />
              </a>
            </div>
          </div>

          {/* Upcoming Sermon Info */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">This Week's Message</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              "Walking in Faith: A Student's Journey"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sunday Service • 10:00 AM
            </p>
          </div>

          {/* Back to Home */}
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-church-600 hover:text-church-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}