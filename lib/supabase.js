import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://vqoxhaggxgwfktuvtoyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTgxMTQsImV4cCI6MjA5Njg3NDExNH0.Jt93SSFA-d4tAkQxR208puLBd47MavkFYK2MQsys9pQ'
)