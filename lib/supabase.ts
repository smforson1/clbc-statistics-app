// Workaround for TypeScript module resolution issue
// @ts-ignore
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client-side Supabase client
export const createClientComponentClient = () => 
  createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export const createServerComponentClient = () => 
  createClient<Database>(supabaseUrl, supabaseAnonKey)