export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          full_name: string
          age: number
          phone_number: string
          course_of_study: string
          level: string
          hall_hostel: string
          visitor_status: 'First-Timer' | 'Regular Member' | 'Returning Guest'
          data_consent: boolean
          is_active: boolean
          last_attendance_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          age: number
          phone_number: string
          course_of_study: string
          level: string
          hall_hostel: string
          visitor_status: 'First-Timer' | 'Regular Member' | 'Returning Guest'
          data_consent: boolean
          is_active?: boolean
          last_attendance_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          age?: number
          phone_number?: string
          course_of_study?: string
          level?: string
          hall_hostel?: string
          visitor_status?: 'First-Timer' | 'Regular Member' | 'Returning Guest'
          data_consent?: boolean
          is_active?: boolean
          last_attendance_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          event_name: string
          event_type: string
          event_date: string
          event_time: string
          description: string | null
          qr_code_token: string
          is_active: boolean
          manual_headcount: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_name: string
          event_type: string
          event_date: string
          event_time: string
          description?: string | null
          qr_code_token: string
          is_active?: boolean
          manual_headcount?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          event_type?: string
          event_date?: string
          event_time?: string
          description?: string | null
          qr_code_token?: string
          is_active?: boolean
          manual_headcount?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          member_id: string
          event_id: string
          attendance_method: 'digital' | 'manual'
          checked_in_at: string
        }
        Insert: {
          id?: string
          member_id: string
          event_id: string
          attendance_method?: 'digital' | 'manual'
          checked_in_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          event_id?: string
          attendance_method?: 'digital' | 'manual'
          checked_in_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          role: 'admin' | 'stats_team' | 'pastor'
          full_name: string
          email: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'stats_team' | 'pastor'
          full_name: string
          email: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'stats_team' | 'pastor'
          full_name?: string
          email?: string
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_inactive_members: {
        Args: {
          weeks_threshold?: number
        }
        Returns: {
          id: string
          full_name: string
          phone_number: string
          last_attendance_date: string | null
          weeks_since_attendance: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}