// src/lib/rag.ts
import { cookies } from 'next/headers'
import { createServerClient, type SupabaseClient } from '@supabase/ssr'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { Database } from '@/types/supabase'

/**
 * Tạo embedding cho câu hỏi và query top-N chunks từ một source nhất định
 */
async function fetchContextBySource(
  question: string,
  source: string,
  topK = 1
): Promise<string> {
  const cookieStore = await cookies()
  const supabase: SupabaseClient<Database> = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
      }
    }
  )

  // 1) Embed question
  const embedder = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY })
  const vector   = await embedder.embedQuery(question)

  // 2) Query chỉ những chunk có source matching, ordered by distance
  const { data, error } = await supabase
    .from('rag_chunks')
    .select('content')
    .eq('source', source)
    .order('embedding', {
      ascending: true,
      using: 'embedding <-> $1',
      args: [vector]
    })
    .limit(topK)

  if (error || !data) {
    console.error(`RAG query error for source=${source}`, error)
    return ''
  }

  // 3) Nối và trả về
  return data.map((r) => r.content).join('\n---\n')
}

/**
 * Lấy context FAQ trước, nếu không có thì thử Blog, cuối cùng trả rỗng
 */
export async function fetchBestContext(question: string): Promise<{
  source: 'FAQ' | 'blog' | null
  content: string
}> {
  // thử FAQ
  const faq = await fetchContextBySource(question, 'ggs-FAQ', 1)
  if (faq.trim()) return { source: 'FAQ',   content: faq }

  // thử blog
  const blog = await fetchContextBySource(question, 'blog', 1)
  if (blog.trim()) return { source: 'blog',  content: blog }

  return { source: null, content: '' }
}
