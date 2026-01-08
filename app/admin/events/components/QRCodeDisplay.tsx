'use client'

import { useEffect, useRef } from 'react'
import { X, Download, Copy, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode'

interface Event {
  id: string
  event_name: string
  event_type: string
  event_date: string
  event_time: string
  qr_code_token: string
}

interface QRCodeDisplayProps {
  event: Event
  onClose: () => void
}

export default function QRCodeDisplay({ event, onClose }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const attendanceUrl = `${window.location.origin}/attend?event=${event.qr_code_token}`

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, attendanceUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
    }
  }, [attendanceUrl])

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `${event.event_name.replace(/\s+/g, '_')}_QR.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(attendanceUrl)
      alert('URL copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const openUrl = () => {
    window.open(attendanceUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            QR Code - {event.event_name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Event Details */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {event.event_type}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-lg shadow-inner">
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* URL Display */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Attendance URL:
            </p>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono break-all">
              {attendanceUrl}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={downloadQRCode}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download QR</span>
            </button>
            
            <button
              onClick={copyUrl}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy URL</span>
            </button>
            
            <button
              onClick={openUrl}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Test</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Instructions:</strong> Print this QR code and place it at the entrance. 
              Students can scan it with their phones to check in quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}