import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://yntpdayoqxgkkvcbuyfk.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludHBkYXlvcXhna2t2Y2J1eWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDE5ODAsImV4cCI6MjEwMjE3Nzk4MH0.7f4wqzTcvKmfE0hLCedvh3MMyfV2MwfNsd2S8pVnTmM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
