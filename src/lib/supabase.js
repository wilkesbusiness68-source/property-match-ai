import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const isValidUrl = rawUrl.startsWith('https://') || rawUrl.startsWith('http://')

const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = rawKey.length > 20 ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const isSupabaseConfigured = isValidUrl && rawKey.length > 20

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
