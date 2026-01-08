import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format Nigerian phone numbers
  if (cleaned.startsWith('234')) {
    return `+${cleaned}`
  } else if (cleaned.startsWith('0')) {
    return `+234${cleaned.slice(1)}`
  } else if (cleaned.length === 10) {
    return `+234${cleaned}`
  }
  
  return phone
}

export function generateQRToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}