// src/lib/rag.ts
import { cookies } from "next/headers";
import { createServerClient, type SupabaseClient } from "@supabase/ssr";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Database } from "@/types/supabase";

async function fetchContextBySource(
  question: string,
  source: string,
  topK = 3
): Promise<string> {
  const cookieStore = await cookies();
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
  );

  const embedder = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY
  });
  const vector = await embedder.embedQuery(question);

  const { data, error } = await supabase
    .from("rag_chunks")
    .select("content")
    .eq("source", source)
    .order("embedding", {
      ascending: true,
      using: "embedding <-> $1",
      args: [vector]
    })
    .limit(topK);

  if (error || !data) {
    console.error(`RAG query error for source=${source}`, error);
    return "";
  }
  return data.map((r) => r.content).join("\n---\n");
}

export async function fetchBestContext(question: string): Promise<{
  source: "FAQ" | "blog" | null;
  content: string;
}> {
  const faq = await fetchContextBySource(question, "ggs-FAQ", 3);
  if (faq.trim()) return { source: "FAQ", content: faq };

  const blog = await fetchContextBySource(question, "blog", 3);
  if (blog.trim()) return { source: "blog", content: blog };

  return { source: null, content: "" };
}
