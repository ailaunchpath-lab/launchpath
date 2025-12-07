import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gyfkjcczettwrjgatxtg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZmtqY2N6ZXR0d3JqZ2F0eHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5OTAxNzksImV4cCI6MjA4MDU2NjE3OX0.2mvTu5rXvgx_1KSIL9P351IqxDv-w-3Xa-aBqGLuGSI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)