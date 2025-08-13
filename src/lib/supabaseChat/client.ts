'use client'
import { createClient } from '@supabase/supabase-js'

// Client TÁCH RIÊNG cho chatbot để không ảnh hưởng app khác
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseChat = createClient(supabaseUrl, supabaseAnon)
export default supabaseChat
