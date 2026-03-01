import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vercel.com/mdannicks-projects/constructa-erp'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdnFjcmdzaGRnYnFhcWt6ZmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjAwOTksImV4cCI6MjA4NzkzNjA5OX0.AjLmPisLSkiPG1AnZldZiAdDvg53VGGdjSqmF47aezk'

export const supabase = createClient(supabaseUrl, supabaseKey)